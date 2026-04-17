package com.codelensai;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyzeController {
    private final GitHubModelsService gitHubModelsService;

    public AnalyzeController(GitHubModelsService gitHubModelsService) {
        this.gitHubModelsService = gitHubModelsService;
    }

    @PostMapping("/analyze")
    public String analyze(@RequestBody AnalyzeRequest body) {
        String mode = body.mode() != null ? body.mode() : "";
        String depth = body.depth() != null ? body.depth() : "";
        String code = body.code() != null ? body.code() : "";

        String prompt = "Analyze the following code.\n\n"
                + "Mode: " + mode + "\n"
                + "Depth: " + depth + "\n\n"
                + "Code:\n" + code;

        return gitHubModelsService.analyze(prompt);
    }
}
