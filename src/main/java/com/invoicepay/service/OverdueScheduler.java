package com.invoicepay.service;

import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueScheduler {

    private final InvoiceRepository invoiceRepository;

    /**
     * Runs every day at midnight.
     * Marks any PENDING invoice whose due date has passed as OVERDUE.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueInvoices() {
        List<Invoice> pending = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING
                        && inv.getDueDate().isBefore(LocalDate.now()))
                .toList();

        if (pending.isEmpty()) {
            log.info("Overdue check: no invoices to update");
            return;
        }

        pending.forEach(inv -> inv.setStatus(InvoiceStatus.OVERDUE));
        invoiceRepository.saveAll(pending);
        log.info("Overdue check: marked {} invoice(s) as OVERDUE", pending.size());
    }
}
