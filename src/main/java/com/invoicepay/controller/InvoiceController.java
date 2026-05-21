package com.invoicepay.controller;

import com.invoicepay.dto.InvoiceRequest;
import com.invoicepay.dto.InvoiceResponse;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // React dev server
public class InvoiceController {

    private final InvoiceService invoiceService;

    // POST /api/invoices
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(request));
    }

    // GET /api/invoices
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status) {
        if (status != null) {
            return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
        }
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
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    // DELETE /api/invoices/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
