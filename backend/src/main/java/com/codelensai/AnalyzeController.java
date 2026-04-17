package com.codelensai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyzeController {
    private static final String GEMINI_MODEL = "gemini-2.0-flash";
    private static final String GEMINI_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String OLLAMA_MODEL = "llama3.1";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody AnalyzeRequest body) {
        Map<String, Object> response = new LinkedHashMap<>();

        String apiKey = System.getenv("GEMINI_API_KEY");
        String mode = body.mode() != null ? body.mode() : "";
        String depth = body.depth() != null ? body.depth() : "";
        String code = body.code() != null ? body.code() : "";
        String prompt = "Analyze the following code.\n"
                + "Mode: " + mode + "\n"
                + "Depth: " + depth + "\n\n"
                + "Code:\n" + code;

        try {
            if (apiKey == null || apiKey.isBlank()) {
                callOllamaFallback(response, prompt, "Gemini key missing");
                response.put("echo", Map.of(
                        "mode", mode,
                        "depth", depth,
                        "codeLength", code.length()));
                return response;
            }

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt)))));
            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(GEMINI_URL_TEMPLATE, GEMINI_MODEL, apiKey)))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> geminiResponse = null;
            IOException lastIoException = null;
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    geminiResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    break;
                } catch (IOException ioEx) {
                    lastIoException = ioEx;
                    if (attempt == 2) {
                        throw ioEx;
                    }
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Interrupted while retrying Gemini request", interrupted);
                    }
                }
            }

            if (geminiResponse == null) {
                throw new IOException("Gemini response was not received", lastIoException);
            }
            JsonNode root = objectMapper.readTree(geminiResponse.body());
            JsonNode partsNode = root.path("candidates").path(0).path("content").path("parts");

            StringBuilder combinedText = new StringBuilder();
            if (partsNode.isArray()) {
                for (JsonNode part : partsNode) {
                    String partText = part.path("text").asText("");
                    if (!partText.isBlank()) {
                        if (!combinedText.isEmpty()) {
                            combinedText.append("\n");
                        }
                        combinedText.append(partText);
                    }
                }
            }

            int statusCode = geminiResponse.statusCode();
            boolean success = statusCode >= 200 && statusCode < 300 && !combinedText.isEmpty();
            response.put("status", success ? "ok" : "error");

            if (success) {
                response.put("message", combinedText.toString());
            } else {
                String apiErrorMessage = root.path("error").path("message").asText("");
                String blockReason = root.path("promptFeedback").path("blockReason").asText("");
                String finishReason = root.path("candidates").path(0).path("finishReason").asText("");

                if (!apiErrorMessage.isBlank()
                        && (apiErrorMessage.toLowerCase().contains("quota")
                        || apiErrorMessage.toLowerCase().contains("rate limit")
                        || apiErrorMessage.toLowerCase().contains("exceeded"))) {
                    callOllamaFallback(response, prompt, "Gemini quota exceeded");
                } else if (!apiErrorMessage.isBlank()) {
                    response.put("message", "Gemini API error: " + apiErrorMessage);
                } else if (!blockReason.isBlank()) {
                    response.put("message", "Gemini blocked the prompt: " + blockReason);
                } else if (!finishReason.isBlank() && !"STOP".equals(finishReason)) {
                    response.put("message", "Gemini returned no text (finishReason: " + finishReason + ").");
                } else {
                    String rawBodySnippet = geminiResponse.body();
                    if (rawBodySnippet.length() > 300) {
                        rawBodySnippet = rawBodySnippet.substring(0, 300) + "...";
                    }
                    response.put("message", "No response text returned from Gemini. Raw response: " + rawBodySnippet);
                }
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Gemini request failed: " + e.getMessage());
        }

        response.put("echo", Map.of(
                "mode", mode,
                "depth", depth,
                "codeLength", code.length()));
        return response;
    }

    private void callOllamaFallback(Map<String, Object> response, String prompt, String reason) {
        try {
            Map<String, Object> ollamaBody = Map.of(
                    "model", OLLAMA_MODEL,
                    "prompt", prompt,
                    "stream", false);
            String jsonBody = objectMapper.writeValueAsString(ollamaBody);

            HttpRequest ollamaRequest = HttpRequest.newBuilder()
                    .uri(URI.create(OLLAMA_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> ollamaResponse = httpClient.send(ollamaRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode ollamaRoot = objectMapper.readTree(ollamaResponse.body());
            String text = ollamaRoot.path("response").asText("");

            if (ollamaResponse.statusCode() >= 200 && ollamaResponse.statusCode() < 300 && !text.isBlank()) {
                response.put("status", "ok");
                response.put("message", text);
            } else {
                response.put("status", "error");
                response.put("message", reason + ". Ollama fallback failed.");
            }
        } catch (Exception ex) {
            response.put("status", "error");
            response.put("message", reason + ". Ollama fallback unavailable: " + ex.getMessage());
        }
    }
}
