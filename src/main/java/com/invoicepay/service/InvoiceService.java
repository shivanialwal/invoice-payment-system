package com.invoicepay.service;

import com.invoicepay.dto.InvoiceRequest;
import com.invoicepay.dto.InvoiceResponse;
import com.invoicepay.dto.LineItemDTO;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.model.LineItem;
import com.invoicepay.model.User;
import com.invoicepay.repository.InvoiceRepository;
import com.invoicepay.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final UserRepository userRepository;

    // ── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        User currentUser = getCurrentUser();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber(currentUser))
                .clientName(request.getClientName())
                .clientEmail(request.getClientEmail())
                .clientPhone(request.getClientPhone())
                .clientAddress(request.getClientAddress())
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.PENDING)
                .notes(request.getNotes())
                .paidAmount(BigDecimal.ZERO)
                .user(currentUser)
                .build();

        List<LineItem> lineItems = buildLineItems(request, invoice);
        invoice.setLineItems(lineItems);
        invoice.setTotalAmount(sumAmount(lineItems));

        return toResponse(invoiceRepository.save(invoice));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findByUser(getCurrentUser()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByUserAndStatus(getCurrentUser(), status).stream()
                .map(this::toResponse).collect(Collectors.toList());
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
        if (request.getStatus() != null) invoice.setStatus(request.getStatus());

        invoice.getLineItems().clear();
        List<LineItem> lineItems = buildLineItems(request, invoice);
        invoice.getLineItems().addAll(lineItems);
        invoice.setTotalAmount(sumAmount(lineItems));

        return toResponse(invoiceRepository.save(invoice));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = findOrThrow(id);
        invoiceRepository.delete(invoice);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private Invoice findOrThrow(Long id) {
        return invoiceRepository.findByIdAndUser(id, getCurrentUser())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber(User user) {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = invoiceRepository.countByUser(user) + 1;
        return prefix + String.format("%04d", count);
    }

    private List<LineItem> buildLineItems(InvoiceRequest request, Invoice invoice) {
        return request.getLineItems().stream().map(dto -> {
            BigDecimal amount = dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity()));
            return LineItem.builder()
                    .invoice(invoice)
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .amount(amount)
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal sumAmount(List<LineItem> items) {
        return items.stream().map(LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
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
