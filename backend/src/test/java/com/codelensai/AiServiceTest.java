package com.codelensai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

public class AiServiceTest {
    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
    }

    @Test
    void testAnalyzeWithValidRequest() {
        AnalyzeRequest request = new AnalyzeRequest("hello world", "default", "basic");
        String result = aiService.analyze(request);
        
        assertNotNull(result, "Result should not be null");
        assertFalse(result.isEmpty(), "Result should not be empty");
    }

    @Test
    void testAnalyzeWithNullRequest() {
        String result = aiService.analyze(null);
        
        assertNotNull(result, "Result should not be null even with null request");
        assertFalse(result.isEmpty(), "Result should not be empty");
    }

    @Test
    void testAnalyzeReturnsString() {
        AnalyzeRequest request = new AnalyzeRequest("System.out.println()", "default", "detailed");
        String result = aiService.analyze(request);
        
        assertIsInstance(result, String.class, "Result should be a String");
    }
}
