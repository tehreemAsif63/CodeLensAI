package com.codelensai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GitHubModelsService {
    private static final String GITHUB_MODELS_URL = "https://models.inference.ai.azure.com/chat/completions";
    private static final String MODEL = "gpt-4o-mini";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String analyze(String prompt) {
        String token = System.getenv("GITHUB_TOKEN");
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "GITHUB_TOKEN is missing.");
        }

        try {
            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", prompt)));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GITHUB_MODELS_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("choices").path(0).path("message").path("content").asText("");

            if (response.statusCode() >= 200 && response.statusCode() < 300 && !text.isBlank()) {
                return text;
            }

            String apiError = root.path("error").path("message").asText("");
            if (!apiError.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub Models API error: " + apiError);
            }

            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub Models returned no response text.");
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub Models request failed: " + ex.getMessage(), ex);
        }
    }
}
