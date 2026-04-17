package com.codelensai;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyzeController {

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody AnalyzeRequest body) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("message", "Dummy analysis — AI not connected yet.");
        response.put("echo", Map.of(
                "mode", body.mode() != null ? body.mode() : "",
                "depth", body.depth() != null ? body.depth() : "",
                "codeLength", body.code() != null ? body.code().length() : 0));
        return response;
    }
}
