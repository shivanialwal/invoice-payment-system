package com.invoicepay.repository;

import com.invoicepay.enums.InvoiceStatus;
import com.invoicepay.model.Invoice;
import com.invoicepay.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUser(User user);

    List<Invoice> findByUserAndStatus(User user, InvoiceStatus status);

    Optional<Invoice> findByIdAndUser(Long id, User user);

    boolean existsByInvoiceNumber(String invoiceNumber);

    long countByUser(User user);
}
