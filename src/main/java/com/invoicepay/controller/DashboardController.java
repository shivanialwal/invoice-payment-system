package com.invoicepay.controller;

import com.invoicepay.dto.DashboardStatsResponse;
import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.model.User;
import com.invoicepay.repository.InvoiceRepository;
import com.invoicepay.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        User user = getCurrentUser();
        List<Invoice> invoices = invoiceRepository.findByUser(user);

        BigDecimal totalRevenue = invoices.stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalInvoices(invoices.size())
                .paidCount(invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.PAID).count())
                .pendingCount(invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.PENDING).count())
                .overdueCount(invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.OVERDUE).count())
                .draftCount(invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.DRAFT).count())
                .build());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
