package com.invoicepay.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicepay.dto.LineItemDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${anthropic.api-key}")
    private String apiKey;

    @Value("${anthropic.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<LineItemDTO> generateLineItems(String prompt) {
        String systemPrompt = """
                You are an invoice assistant. When given a description of work done,
                return ONLY a JSON array of line items. Each item must have:
                - description (string)
                - quantity (integer)
                - unitPrice (number in INR)

                Return ONLY the JSON array, no explanation, no markdown.
                Example: [{"description":"Web design","quantity":1,"unitPrice":25000}]
                """;

        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(new AnthropicRequest(
                    model,
                    1024,
                    systemPrompt,
                    List.of(new Message("user", prompt))
            ));
        } catch (Exception e) {
            throw new RuntimeException("Failed to build AI request", e);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Anthropic API error {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("AI service error: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("content").get(0).path("text").asText();

            JsonNode items = objectMapper.readTree(content);
            List<LineItemDTO> result = new ArrayList<>();
            for (JsonNode item : items) {
                BigDecimal unitPrice = new BigDecimal(item.path("unitPrice").asText());
                int quantity = item.path("quantity").asInt(1);
                result.add(LineItemDTO.builder()
                        .description(item.path("description").asText())
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .amount(unitPrice.multiply(BigDecimal.valueOf(quantity)))
                        .build());
            }
            return result;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI service", e);
        }
    }

    // ── Inner record types for request serialization ──────────────────────────

    record AnthropicRequest(String model, int max_tokens, String system, List<Message> messages) {}
    record Message(String role, String content) {}
}
