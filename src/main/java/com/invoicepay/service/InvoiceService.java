package com.invoicepay.service;

import com.invoicepay.dto.InvoiceRequest;
import com.invoicepay.dto.InvoiceResponse;
import com.invoicepay.dto.LineItemDTO;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.model.LineItem;
import com.invoicepay.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    // ── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .clientName(request.getClientName())
                .clientEmail(request.getClientEmail())
                .clientPhone(request.getClientPhone())
                .clientAddress(request.getClientAddress())
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.PENDING)
                .notes(request.getNotes())
                .paidAmount(BigDecimal.ZERO)
                .build();

        // Build line items and calculate total
        List<LineItem> lineItems = request.getLineItems().stream().map(dto -> {
            BigDecimal amount = dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity()));
            return LineItem.builder()
                    .invoice(invoice)
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .amount(amount)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = lineItems.stream()
                .map(LineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setLineItems(lineItems);
        invoice.setTotalAmount(total);

        return toResponse(invoiceRepository.save(invoice));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request) {
        Invoice invoice = findOrThrow(id);

        invoice.setClientName(request.getClientName());
        invoice.setClientEmail(request.getClientEmail());
        invoice.setClientPhone(request.getClientPhone());
        invoice.setClientAddress(request.getClientAddress());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());

        if (request.getStatus() != null) {
            invoice.setStatus(request.getStatus());
        }

        // Replace line items
        invoice.getLineItems().clear();
        List<LineItem> lineItems = request.getLineItems().stream().map(dto -> {
            BigDecimal amount = dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity()));
            return LineItem.builder()
                    .invoice(invoice)
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .amount(amount)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = lineItems.stream()
                .map(LineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.getLineItems().addAll(lineItems);
        invoice.setTotalAmount(total);

        return toResponse(invoiceRepository.save(invoice));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new EntityNotFoundException("Invoice not found with id: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private Invoice findOrThrow(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = invoiceRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<LineItemDTO> lineItemDTOs = invoice.getLineItems().stream().map(item ->
                LineItemDTO.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .amount(item.getAmount())
                        .build()
        ).collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .clientName(invoice.getClientName())
                .clientEmail(invoice.getClientEmail())
                .clientPhone(invoice.getClientPhone())
                .clientAddress(invoice.getClientAddress())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .notes(invoice.getNotes())
                .lineItems(lineItemDTOs)
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
