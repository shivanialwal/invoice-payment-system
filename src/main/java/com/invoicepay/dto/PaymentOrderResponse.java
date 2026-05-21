package com.invoicepay.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentOrderResponse {
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;  // sent to frontend to init checkout
    private String upiLink;
}
