package com.invoicepay.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private long totalInvoices;
    private long paidCount;
    private long pendingCount;
    private long overdueCount;
    private long draftCount;
}
