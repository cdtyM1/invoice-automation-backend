# Invoice Automation Backend

Backend sistem tagihan otomatis dengan reminder H-7, H-1, overdue untuk integrasi WordPress.

## Fitur

- ✓ REST API untuk invoice dan customer
- ✓ Database PostgreSQL via Prisma ORM
- ✓ Scheduler reminder otomatis setiap jam
- ✓ Kirim email reminder (H-7, H-1, overdue)
- ✓ Kirim WhatsApp reminder via Fonnte API
- ✓ Log setiap pengiriman reminder
- ✓ Status tracking invoice

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi kamu:

```env
DATABASE_URL="postgresql://user:password@host:5432/invoice_db"
PORT=4000

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

FONNTE_TOKEN="your-token-from-fonnte"
```

### 3. Setup database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Jalankan development

```bash
npm run dev
```

API akan running di `http://localhost:4000`

## API Endpoints

### Health Check

```
GET /health
```

### Customers

```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
```

### Invoices

```
GET    /api/invoices
GET    /api/invoices/:id
GET    /api/invoices/number/:invoiceNumber
POST   /api/invoices
PATCH  /api/invoices/:id/status
```

## Contoh Request

### Buat Customer

```bash
curl -X POST http://localhost:4000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PT Maju Jaya",
    "phone": "628123456789",
    "email": "admin@majujaya.com",
    "address": "Jl. Raya No.1"
  }'
```

### Buat Invoice

```bash
curl -X POST http://localhost:4000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id-dari-step-1",
    "invoiceNumber": "INV-001",
    "dueDate": "2025-01-20",
    "notes": "Jasa konsultasi",
    "items": [
      {
        "description": "Layanan konsultasi IT",
        "qty": 1,
        "price": 1500000
      }
    ]
  }'
```

### Update Status Invoice

```bash
curl -X PATCH http://localhost:4000/api/invoices/invoice-id/status \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

## Deployment

### Railway

1. Push repo ke GitHub
2. Connect repo ke Railway
3. Set environment variables di Railway
4. Deploy

### Neon Database

1. Buat akun di neon.tech
2. Buat project PostgreSQL
3. Copy connection string ke `DATABASE_URL`
4. Run migrations

## Scheduler

Reminder checker berjalan setiap jam:
- H-7 sebelum due date
- H-1 sebelum due date
- Overdue setelah due date

Bisa dikustomisasi di `src/jobs/reminderJob.js`

## License

MIT
