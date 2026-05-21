# InvoicePay — Invoice & Payment Management System

A full-stack invoice management system with Razorpay/UPI payment integration and AI-powered line item generation.

---

## Features

- **Invoice Management** — Create, edit, and delete invoices with multiple line items. Auto-generated invoice numbers (`INV-YYYYMM-XXXX`).
- **Payment Status Tracking** — Real-time status: Draft → Pending → Paid / Overdue / Cancelled.
- **Auto-Overdue Detection** — Scheduled job runs daily at midnight and marks past-due invoices as overdue automatically.
- **Razorpay Integration** — Full checkout flow with HMAC signature verification. One click opens the payment modal.
- **UPI Payments** — Generates a UPI deep link that opens any UPI app (GPay, PhonePe, Paytm) on mobile.
- **Email Notifications** — Send invoices and payment reminders directly to clients via Gmail SMTP.
- **AI Line Items** — Describe the work in plain English, get back structured line items powered by the Anthropic API.
- **JWT Authentication** — Secure login, signup, forgot password, and reset password flows. Each user sees only their own invoices.
- **Dashboard** — Live stats: collected revenue, paid/pending/overdue counts, and recent invoices.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5, Java 17 |
| Database | PostgreSQL 16 |
| Auth | JWT (jjwt 0.12) + BCrypt |
| Payments | Razorpay Java SDK |
| Email | Spring Mail (Gmail SMTP) |
| AI | Anthropic Claude API |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Plain CSS (no framework) |

---

## Project Structure

```
invoice-payment-system/
├── src/main/java/com/invoicepay/
│   ├── config/          # Security, JWT filter, app config
│   ├── controller/      # REST controllers (Auth, Invoice, Payment, Dashboard)
│   ├── dto/             # Request / Response objects
│   ├── enums/           # InvoiceStatus
│   ├── model/           # JPA entities (User, Invoice, LineItem)
│   ├── repository/      # Spring Data JPA repositories
│   └── service/         # Business logic (Auth, Invoice, Email, AI, Payment, Scheduler)
├── src/main/resources/
│   └── application.properties
└── frontend/
    └── src/
        ├── api/         # Typed API client
        ├── components/  # Layout, InvoiceTable, StatCard, StatusBadge
        ├── context/     # AuthContext (JWT + localStorage)
        ├── pages/       # Dashboard, Invoices, Create, Detail, Auth pages
        └── types/       # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16

### 1. Clone the repo

```bash
git clone https://github.com/shivanialwal/invoice-payment-system.git
cd invoice-payment-system
```

### 2. Set up PostgreSQL

```bash
# Start PostgreSQL
brew services start postgresql@16

# Create the database
psql postgres -c "CREATE DATABASE invoice_db;"
```

### 3. Configure credentials

Open `src/main/resources/application.properties` and fill in:

```properties
# Database
spring.datasource.username=your_postgres_user

# JWT
jwt.secret=your-256-bit-secret

# Gmail (use an App Password — myaccount.google.com/apppasswords)
spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_app_password
app.mail.from=your_gmail@gmail.com

# Razorpay (dashboard.razorpay.com → Settings → API Keys)
razorpay.key-id=rzp_test_...
razorpay.key-secret=your_secret
upi.merchant-vpa=yourname@upi
upi.merchant-name=Your Business Name

# Anthropic (console.anthropic.com → API Keys)
anthropic.api-key=sk-ant-...
```

### 4. Run the backend

```bash
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Hibernate auto-creates tables on first run
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# /api requests are proxied to :8080
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, returns JWT |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password` | Reset with token |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all (scoped to user) |
| GET | `/api/invoices?status=OVERDUE` | Filter by status |
| GET | `/api/invoices/{id}` | Get single invoice |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/{id}` | Update invoice |
| DELETE | `/api/invoices/{id}` | Delete invoice |
| POST | `/api/invoices/{id}/send` | Email invoice to client |
| POST | `/api/invoices/{id}/remind` | Send payment reminder |
| POST | `/api/invoices/ai/line-items` | AI-generate line items |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/order/{invoiceId}` | Create Razorpay order + UPI link |
| POST | `/api/payments/verify/{invoiceId}` | Verify payment signature, mark paid |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Revenue + status counts |

> All endpoints except `/api/auth/**` require `Authorization: Bearer <token>`.

---

## Environment Variables (Production)

Never commit credentials. Use environment variables in production:

```bash
export DB_PASSWORD=...
export JWT_SECRET=...
export ANTHROPIC_API_KEY=...
export RAZORPAY_KEY_SECRET=...
export MAIL_PASSWORD=...
```

And reference them in `application.properties`:
```properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

Also set `spring.jpa.hibernate.ddl-auto=validate` in production and manage schema changes with Flyway.

---

## Roadmap

- [ ] Flyway database migrations
- [ ] PDF invoice generation
- [ ] Razorpay live mode + webhook endpoint
- [ ] Real email domain via Resend/SendGrid
- [ ] Docker + docker-compose setup
- [ ] Deploy backend to Railway, frontend to Vercel

---

## License

MIT
