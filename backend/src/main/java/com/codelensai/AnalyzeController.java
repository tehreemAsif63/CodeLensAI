package com.codelensai;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalyzeController {
    private final AiService aiService;

    public AnalyzeController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    public String analyze(@RequestBody AnalyzeRequest body) {
        return aiService.analyze(body);
    }
}
