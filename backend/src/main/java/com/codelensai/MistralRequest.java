package com.codelensai;

import java.util.List;

public record MistralRequest(String model, List<MistralMessage> messages, int max_tokens) {
	public record MistralMessage(String role, String content) {
	}
}

