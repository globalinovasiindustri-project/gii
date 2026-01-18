# E-Commerce Platform - Global Inovasi Industri

Modern e-commerce platform built with Next.js 15, featuring Midtrans payment integration, real-time shipping calculation, and comprehensive order management.

## Features

- 🛍️ Product catalog with variants and combinations
- 🛒 Shopping cart (guest & authenticated)
- 💳 **Midtrans Snap payment integration**
- 📦 Real-time shipping cost calculation (RajaOngkir)
- 👤 User authentication (JWT magic link)
- 📍 Multiple shipping addresses
- 📊 Admin dashboard for order management
- 📧 Email notifications (Resend)

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 15 (App Router) |
| Language  | TypeScript              |
| Database  | PostgreSQL (Neon)       |
| ORM       | Drizzle                 |
| State     | TanStack Query          |
| Forms     | react-hook-form + Zod   |
| UI        | shadcn/ui + Tailwind    |
| Auth      | JWT (magic link)        |
| Payment   | **Midtrans Snap**       |
| Shipping  | RajaOngkir API          |
| Email     | Resend                  |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - Database URL (PostgreSQL)
   - JWT secrets
   - Midtrans credentials (see [Payment Setup](#payment-setup))
   - RajaOngkir API key
   - Resend API key
   - Vercel Blob token

5. Run database migrations:

```bash
pnpm db:push
```

6. Start development server:

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Payment Setup

This project uses **Midtrans Snap** for payment processing. The payment flow is simple:

1. User completes checkout → Order created
2. Midtrans payment page opens in new tab
3. User completes payment
4. Order status updated automatically via webhook

### Quick Setup

1. **Get Midtrans Account**
   - Sign up at [Midtrans](https://midtrans.com)
   - Access [Midtrans Dashboard](https://dashboard.midtrans.com)

2. **Get API Keys**
   - Go to Settings > Access Keys
   - Copy Server Key and Client Key
   - Use Sandbox keys for testing

3. **Configure Environment**

   ```env
   # Midtrans Configuration (Sandbox)
   MIDTRANS_SERVER_KEY='SB-Mid-server-YOUR_KEY'
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY='SB-Mid-client-YOUR_KEY'
   ```

   **Note:** Production mode is auto-detected:
   - Sandbox keys start with `SB-`
   - Production keys don't have `SB-` prefix

4. **Set Notification URL**
   - In Midtrans Dashboard: Settings > Configuration
   - Set Payment Notification URL to:
     ```
     https://your-domain.com/api/payment/notification
     ```
   - For local testing, use ngrok or similar tunnel

### Test Payment

Use these test credentials in Sandbox:

**Credit Card:**

- Card: `4811 1111 1111 1114`
- CVV: `123`
- Exp: Any future date
- OTP: `112233`

## Payment Flow

1. User completes checkout → Order created with `pending` status
2. Midtrans payment page opens in new tab automatically
3. User completes payment in Midtrans
4. Midtrans sends webhook to `/api/payment/notification`
5. Order status updated to `paid` and `processing`
6. User returns to order page

## Project Structure

```
app/
├── api/                    # API routes
│   ├── payment/            # Payment webhook
│   │   └── notification/   # Webhook handler
│   ├── checkout/           # Checkout flow
│   ├── orders/             # Order management
│   └── ...
├── checkout/               # Checkout page
├── shop/                   # Product listing
└── ...

lib/
├── services/
│   ├── payment.service.ts  # Midtrans integration
│   ├── order.service.ts    # Order logic
│   └── ...
└── ...

hooks/
├── use-checkout.ts         # Checkout hooks
└── ...
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push database schema
pnpm db:studio    # Open Drizzle Studio
```

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `MIDTRANS_SERVER_KEY` - Midtrans server key (backend only)
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` - Midtrans client key (frontend)
- `RAJAONGKIR_API_KEY` - Shipping API key
- `RESEND_API_KEY` - Email service key
- `BLOB_READ_WRITE_TOKEN` - File storage token

## Order Status Flow

```
pending → paid → processing → shipped → delivered
                    ↓
                cancelled
```

## Documentation

- [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md) - All env vars explained
- [Project Context](.kiro/steering/project-context.md) - Architecture overview
- [Coding Standards](.kiro/steering/coding-standards.md) - Code conventions

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Important for Production

- [ ] Switch to production Midtrans keys
- [ ] Set `MIDTRANS_IS_PRODUCTION='true'`
- [ ] Configure production notification URL
- [ ] Set up proper domain for webhook
- [ ] Test payment flow end-to-end
- [ ] Monitor webhook logs

## Troubleshooting

### Payment Issues

**Snap popup not opening:**

- Check `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is set
- Verify Snap.js script loads in browser console

**Order not updating after payment:**

- Check notification URL is configured in Midtrans Dashboard
- Verify webhook endpoint is accessible (use ngrok for local testing)
- Check server logs for webhook errors

**Invalid signature error:**

- Ensure `MIDTRANS_SERVER_KEY` matches dashboard
- Verify order number format is correct

See [docs/MIDTRANS_SETUP.md](docs/MIDTRANS_SETUP.md) for more troubleshooting tips.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
