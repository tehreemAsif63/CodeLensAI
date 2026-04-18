package com.codelensai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class AiServiceTest {
    private RestTemplate restTemplate;
    private AiService aiService;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        aiService = new AiService(
                restTemplate,
                "",
                "https://api.mistral.ai/v1/chat/completions",
                "mistral-small-latest");
    }

    @Test
    void testAnalyzeWithoutApiKeyReturnsServiceUnavailable() {
        AnalyzeRequest request = new AnalyzeRequest("hello world", "explain", "medium");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> aiService.analyze(request));

        assertEquals(503, ex.getStatusCode().value());
    }

    @Test
    void testAnalyzeWithNullRequestReturnsBadRequest() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> aiService.analyze(null));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void testAnalyzeWithApiKeyCallsMistralAndReturnsContent() {
        aiService = new AiService(
                restTemplate,
                "test-key",
                "https://api.mistral.ai/v1/chat/completions",
                "mistral-small-latest");

        var response = new MistralResponse(
                new MistralResponse.MistralChoice[] {
                        new MistralResponse.MistralChoice(
                                new MistralResponse.MistralChoice.MistralMessage("hello from mistral"))
                });

        when(restTemplate.postForObject(
                eq("https://api.mistral.ai/v1/chat/completions"),
                any(HttpEntity.class),
                eq(MistralResponse.class))).thenReturn(response);

        String result = aiService.analyze(new AnalyzeRequest("System.out.println()", "explain", "medium"));

        assertEquals("hello from mistral", result);
    }
}
