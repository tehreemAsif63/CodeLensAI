package com.codelensai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebMvcTest(AnalyzeController.class)
public class AnalyzeControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AiService aiService;

    @Test
    void testAnalyzeEndpointReturns200() throws Exception {
        when(aiService.analyze(any(AnalyzeRequest.class)))
            .thenReturn("Test response from AI");

        mockMvc.perform(post("/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\": \"test\", \"mode\": \"default\", \"depth\": \"basic\"}"))
            .andExpect(status().isOk());
    }
}
