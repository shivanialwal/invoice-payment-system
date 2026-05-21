package com.invoicepay.controller;

import com.invoicepay.dto.PaymentOrderResponse;
import com.invoicepay.dto.PaymentVerifyRequest;
import com.invoicepay.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    // POST /api/payments/order/{invoiceId} — create Razorpay order
    @PostMapping("/order/{invoiceId}")
    public ResponseEntity<PaymentOrderResponse> createOrder(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.createOrder(invoiceId));
    }

    // POST /api/payments/verify/{invoiceId} — verify payment signature
    @PostMapping("/verify/{invoiceId}")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @PathVariable Long invoiceId,
            @RequestBody PaymentVerifyRequest request) {
        paymentService.verifyPayment(invoiceId, request);
        return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
    }
}
