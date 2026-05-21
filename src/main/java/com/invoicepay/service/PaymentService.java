package com.invoicepay.service;

import com.invoicepay.dto.PaymentOrderResponse;
import com.invoicepay.dto.PaymentVerifyRequest;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.repository.InvoiceRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class PaymentService {

    private final InvoiceRepository invoiceRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${upi.merchant-vpa}")
    private String merchantVpa;

    @Value("${upi.merchant-name}")
    private String merchantName;

    public PaymentService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // ── Create Razorpay order ─────────────────────────────────────────────────

    @Transactional
    public PaymentOrderResponse createOrder(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));

        // Amount in paise (Razorpay requires smallest currency unit)
        int amountInPaise = invoice.getTotalAmount()
                .subtract(invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO)
                .multiply(BigDecimal.valueOf(100))
                .intValue();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", invoice.getInvoiceNumber());
            orderRequest.put("notes", new JSONObject().put("invoiceId", invoiceId));

            Order order = client.orders.create(orderRequest);
            String orderId = order.get("id");

            invoice.setRazorpayOrderId(orderId);
            invoiceRepository.save(invoice);

            String upiLink = buildUpiLink(invoice);
            invoice.setUpiLink(upiLink);
            invoiceRepository.save(invoice);

            return PaymentOrderResponse.builder()
                    .orderId(orderId)
                    .amount(invoice.getTotalAmount())
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .upiLink(upiLink)
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment order creation failed", e);
        }
    }

    // ── Verify payment after checkout ─────────────────────────────────────────

    @Transactional
    public void verifyPayment(Long invoiceId, PaymentVerifyRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));

        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();

        if (!verifySignature(payload, request.getRazorpaySignature())) {
            throw new SecurityException("Payment signature verification failed");
        }

        invoice.setRazorpayPaymentId(request.getRazorpayPaymentId());
        invoice.setPaidAmount(invoice.getTotalAmount());
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        log.info("Payment verified for invoice {} — {}", invoice.getInvoiceNumber(), request.getRazorpayPaymentId());
    }

    // ── UPI deep link ─────────────────────────────────────────────────────────

    private String buildUpiLink(Invoice invoice) {
        String amount = invoice.getTotalAmount().toPlainString();
        String note = URLEncoder.encode("Payment for " + invoice.getInvoiceNumber(), StandardCharsets.UTF_8);
        String name = URLEncoder.encode(merchantName, StandardCharsets.UTF_8);
        return "upi://pay?pa=" + merchantVpa
                + "&pn=" + name
                + "&am=" + amount
                + "&cu=INR"
                + "&tn=" + note;
    }

    // ── HMAC-SHA256 signature verification ───────────────────────────────────

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
