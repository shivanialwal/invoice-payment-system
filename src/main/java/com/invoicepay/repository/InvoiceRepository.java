package com.invoicepay.repository;

import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByStatus(InvoiceStatus status);

    List<Invoice> findByClientEmail(String clientEmail);

    boolean existsByInvoiceNumber(String invoiceNumber);
}
