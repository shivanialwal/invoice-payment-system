package com.invoicepay.service;

import com.invoicepay.model.Invoice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    // ── Send invoice to client ────────────────────────────────────────────────

    public void sendInvoice(Invoice invoice) {
        String subject = "Invoice " + invoice.getInvoiceNumber() + " from InvoicePay";
        String html = buildInvoiceEmail(invoice);
        sendHtml(invoice.getClientEmail(), subject, html);
    }

    // ── Payment reminder ──────────────────────────────────────────────────────

    public void sendPaymentReminder(Invoice invoice) {
        String subject = "Payment Reminder: " + invoice.getInvoiceNumber() + " is due";
        String html = buildReminderEmail(invoice);
        sendHtml(invoice.getClientEmail(), subject, html);
    }

    // ── Core send method ──────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to {} — {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    // ── Email templates ───────────────────────────────────────────────────────

    private String buildInvoiceEmail(Invoice invoice) {
        String due = invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        return """
                <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;color:#1a1a2e">
                  <h2 style="color:#6c63ff">InvoicePay</h2>
                  <p>Hi %s,</p>
                  <p>Please find your invoice details below.</p>
                  <table style="width:100%%;border-collapse:collapse;margin:1.5rem 0">
                    <tr style="background:#f5f5f5">
                      <td style="padding:0.5rem 1rem;font-weight:600">Invoice #</td>
                      <td style="padding:0.5rem 1rem">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:0.5rem 1rem;font-weight:600">Amount Due</td>
                      <td style="padding:0.5rem 1rem;font-size:1.2rem;font-weight:700;color:#6c63ff">₹%s</td>
                    </tr>
                    <tr style="background:#f5f5f5">
                      <td style="padding:0.5rem 1rem;font-weight:600">Due Date</td>
                      <td style="padding:0.5rem 1rem">%s</td>
                    </tr>
                  </table>
                  %s
                  <p style="color:#888;font-size:0.85rem;margin-top:2rem">InvoicePay · Payment Management System</p>
                </div>
                """.formatted(
                invoice.getClientName(),
                invoice.getInvoiceNumber(),
                invoice.getTotalAmount().toPlainString(),
                due,
                invoice.getNotes() != null
                        ? "<p style=\"color:#555\"><em>" + invoice.getNotes() + "</em></p>"
                        : ""
        );
    }

    private String buildReminderEmail(Invoice invoice) {
        String due = invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        BigDecimal outstanding = invoice.getTotalAmount().subtract(
                invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO);
        return """
                <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:2rem;color:#1a1a2e">
                  <h2 style="color:#e11d48">Payment Reminder</h2>
                  <p>Hi %s,</p>
                  <p>This is a friendly reminder that invoice <strong>%s</strong> is due on <strong>%s</strong>.</p>
                  <div style="background:#fff0f3;border-left:4px solid #e11d48;padding:1rem;margin:1.5rem 0;border-radius:4px">
                    <p style="margin:0;font-size:1.1rem">Outstanding amount: <strong>₹%s</strong></p>
                  </div>
                  <p>Please process your payment at your earliest convenience.</p>
                  <p style="color:#888;font-size:0.85rem;margin-top:2rem">InvoicePay · Payment Management System</p>
                </div>
                """.formatted(
                invoice.getClientName(),
                invoice.getInvoiceNumber(),
                due,
                outstanding.toPlainString()
        );
    }
}
