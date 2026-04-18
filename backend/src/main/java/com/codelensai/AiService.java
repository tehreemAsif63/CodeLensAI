package com.codelensai;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiService {
    private static final int MAX_TOKENS = 1000;

    private final RestTemplate restTemplate;
    private final String mistralApiKey;
    private final String mistralApiUrl;
    private final String mistralModel;

    public AiService(
            RestTemplate restTemplate,
            @Value("${mistral.api.key:}") String mistralApiKey,
            @Value("${mistral.api.url:https://api.mistral.ai/v1/chat/completions}") String mistralApiUrl,
            @Value("${mistral.model:mistral-small-latest}") String mistralModel) {
        this.restTemplate = restTemplate;
        this.mistralApiKey = mistralApiKey;
        this.mistralApiUrl = mistralApiUrl;
        this.mistralModel = mistralModel;
    }

    public String analyze(AnalyzeRequest request) {
        if (request == null || normalize(request.code()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paste some code to analyze first.");
        }

        String apiKey = normalize(mistralApiKey);
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI access is not configured right now. Set MISTRAL_API_KEY to enable analysis.");
        }

        return callMistralAPI(request, apiKey);
    }

    private String callMistralAPI(AnalyzeRequest request, String apiKey) {
        String prompt = buildPrompt(request);

        var requestBody = new MistralRequest(
                mistralModel,
                List.of(new MistralRequest.MistralMessage("user", prompt)),
                MAX_TOKENS);

        var headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        var httpEntity = new HttpEntity<>(requestBody, headers);

        try {
            var response = restTemplate.postForObject(mistralApiUrl, httpEntity, MistralResponse.class);

            if (response == null || response.choices() == null || response.choices().length == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI provider returned no response. Please try again later.");
            }

            var message = response.choices()[0].message();
            if (message == null || message.content() == null || message.content().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI provider returned an empty response. Please try again later.");
            }

            return message.content();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not reach the AI provider. Please try again later.",
                    ex);
        }
    }

    private String buildPrompt(AnalyzeRequest request) {
        String mode = normalize(request.mode()).toLowerCase();
        String depth = normalize(request.depth()).toLowerCase();
        String code = normalize(request.code());

        if (!isSupportedMode(mode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown mode: " + request.mode());
        }

        if (!isSupportedDepth(depth)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown depth: " + request.depth());
        }

        String modeInstruction = switch (mode) {
            case "explain" -> "Explain this code clearly in simple terms.";
            case "teach" -> "Teach me the key concepts in this code.";
            case "quiz" -> "Generate exactly 5 multiple-choice quiz questions about this code and return ONLY valid JSON in this exact format: {\"questions\":[{\"question\":\"...\",\"options\":[\"...\",\"...\",\"...\",\"...\"],\"answerIndex\":0,\"explanation\":\"...\"}]}. answerIndex must be 0-based. Do not include markdown, code fences, or extra text.";
            case "structure" -> "Explain the architecture and flow of this code and show how the parts connect.";
            default -> "Analyze this code.";
        };

        String depthInstruction = switch (depth) {
            case "quick" -> " Keep it brief and to the point.";
            case "deep" -> " Provide detailed, in-depth analysis.";
            default -> " Provide a balanced explanation.";
        };

        return new StringBuilder()
                .append(modeInstruction)
                .append(depthInstruction)
                .append("\n\nCode:\n")
                .append(code)
                .toString();
    }

    private boolean isSupportedMode(String mode) {
        return switch (mode) {
            case "explain", "teach", "quiz", "structure" -> true;
            default -> false;
        };
    }

    private boolean isSupportedDepth(String depth) {
        return switch (depth) {
            case "quick", "medium", "deep" -> true;
            default -> false;
        };
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
