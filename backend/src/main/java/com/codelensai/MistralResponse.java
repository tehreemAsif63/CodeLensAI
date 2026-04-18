package com.codelensai;

public record MistralResponse(MistralChoice[] choices) {
	public record MistralChoice(MistralMessage message) {
		public record MistralMessage(String content) {
		}
	}
}

