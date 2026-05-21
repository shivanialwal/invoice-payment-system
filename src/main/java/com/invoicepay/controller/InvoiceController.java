package com.invoicepay.controller;

import com.invoicepay.dto.InvoiceRequest;
import com.invoicepay.dto.InvoiceResponse;
import com.invoicepay.dto.LineItemDTO;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.repository.InvoiceRepository;
import com.invoicepay.service.AiService;
import com.invoicepay.service.EmailService;
import com.invoicepay.service.InvoiceService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final AiService aiService;
    private final EmailService emailService;
    private final InvoiceRepository invoiceRepository;

    // POST /api/invoices
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(request));
    }

    // GET /api/invoices
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status) {
        if (status != null) return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    // GET /api/invoices/{id}
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    // PUT /api/invoices/{id}
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable Long id, @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    // DELETE /api/invoices/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/invoices/{id}/send — email invoice to client
    @PostMapping("/{id}/send")
    public ResponseEntity<Map<String, String>> sendInvoice(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        emailService.sendInvoice(invoice);
        return ResponseEntity.ok(Map.of("message", "Invoice emailed to " + invoice.getClientEmail()));
    }

    // POST /api/invoices/{id}/remind — send payment reminder
    @PostMapping("/{id}/remind")
    public ResponseEntity<Map<String, String>> sendReminder(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        emailService.sendPaymentReminder(invoice);
        return ResponseEntity.ok(Map.of("message", "Reminder sent to " + invoice.getClientEmail()));
    }

    // POST /api/invoices/ai/line-items
    @PostMapping("/ai/line-items")
    public ResponseEntity<List<LineItemDTO>> generateLineItems(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(aiService.generateLineItems(prompt));
    }
}
