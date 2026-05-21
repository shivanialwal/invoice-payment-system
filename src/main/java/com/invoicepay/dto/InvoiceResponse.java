package com.invoicepay.dto;

import com.invoicepay.enums.InvoiceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String clientAddress;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private String notes;
    private List<LineItemDTO> lineItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
