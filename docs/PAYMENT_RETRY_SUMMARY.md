# Payment Retry Implementation - Summary

## What Was Implemented

A complete payment retry system for Midtrans Snap that allows customers to retry payment after cancellation or failure.

## Changes Made

### 1. Database Schema (`lib/db/schema.ts`)

- Added `midtransOrderId` column to track Midtrans-specific order IDs
- Added `snapToken` column to store Snap tokens for reuse
- Added index on `midtransOrderId` for fast webhook lookups

### 2. Payment Service (`lib/services/payment.service.ts`)

- Modified `createSnapToken()` to generate timestamped Midtrans order IDs
- Format: `{orderNumber}-{timestamp}` (e.g., `ORDER-2024-001-1737123456789`)
- Returns `midtransOrderId` along with token and redirectUrl

### 3. Webhook Handler (`app/api/payment/notification/route.ts`)

- Changed lookup from `orderNumber` to `midtransOrderId`
- Now correctly handles multiple payment attempts for same order

### 4. Checkout Routes

- **Authenticated** (`app/api/checkout/authenticated/route.ts`)
- **Guest** (`app/api/checkout/guest/route.ts`)
- Both now store `midtransOrderId` and `snapToken` after creating payment

### 5. Payment Retry Endpoint (`app/api/payment/retry/route.ts`)

- New endpoint: `POST /api/payment/retry`
- Generates new Snap token with fresh timestamp
- Validates order status (must be pending/unpaid, not cancelled)

### 6. Migration (`lib/db/migrations/0011_add_midtrans_fields_to_orders.sql`)

- SQL migration to add new columns
- Already applied via `npm run db:push`

### 7. Documentation

- `docs/PAYMENT_RETRY.md` - Complete technical documentation
- `docs/PAYMENT_RETRY_SUMMARY.md` - This summary

## How It Works

### Initial Payment

```
1. Customer checks out
2. Order created: ORDER-2024-001
3. Midtrans order ID: ORDER-2024-001-1737123456789
4. Stored in database: midtransOrderId, snapToken
5. Customer redirected to payment page
```

### Customer Cancels

```
1. Customer closes payment page or clicks back
2. Order remains in "pending" status
3. snapToken still valid (24 hours)
```

### Payment Retry

```
Option A: Reuse existing token (within 24 hours)
- Call window.snap.pay(snapToken)

Option B: Generate new token (after expiry or preference)
- POST /api/payment/retry with orderId
- New Midtrans order ID: ORDER-2024-001-1737199999999
- New snapToken generated
- Customer completes payment
```

### Webhook Processing

```
1. Midtrans sends notification with order_id: ORDER-2024-001-1737199999999
2. Webhook looks up by midtransOrderId
3. Finds correct order
4. Updates payment status
```

## Benefits

✅ **Clean Order Numbers** - Customer sees ORDER-2024-001, not the timestamped version
✅ **Unlimited Retries** - Same order can be retried multiple times
✅ **No Duplication** - Each attempt has unique Midtrans order ID
✅ **Audit Trail** - Track all payment attempts per order
✅ **Fast Lookups** - Indexed midtransOrderId for webhook performance

## API Usage

### Retry Payment

```typescript
POST /api/payment/retry
Content-Type: application/json

{
  "orderId": "uuid-of-order"
}

Response:
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORDER-2024-001",
    "paymentUrl": "https://...",
    "snapToken": "abc123..."
  }
}
```

### Frontend Implementation

```typescript
// Option 1: Redirect to payment URL
const retryPayment = async (orderId: string) => {
  const res = await fetch("/api/payment/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  window.location.href = data.data.paymentUrl;
};

// Option 2: Open Snap popup
const retryPayment = async (orderId: string) => {
  const res = await fetch("/api/payment/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  window.snap.pay(data.data.snapToken);
};

// Option 3: Reuse stored token (if not expired)
const continuePayment = (snapToken: string) => {
  window.snap.pay(snapToken);
};
```

## Testing Checklist

- [ ] Create order via checkout
- [ ] Cancel payment (close browser)
- [ ] Call retry endpoint
- [ ] Complete payment with new token
- [ ] Verify webhook updates order correctly
- [ ] Test multiple retries (3-4 times)
- [ ] Verify only successful payment is recorded
- [ ] Test token reuse within 24 hours
- [ ] Test expired token (after 24 hours)

## Migration Status

✅ Migration applied successfully
✅ Columns added: `midtrans_order_id`, `snap_token`
✅ Index created: `order_midtrans_order_id_idx`

## Next Steps

1. **Frontend Integration**
   - Add "Retry Payment" button to order detail page
   - Show payment status clearly
   - Handle expired tokens gracefully

2. **User Experience**
   - Display helpful messages when payment is cancelled
   - Show countdown for token expiry (24 hours)
   - Auto-redirect to retry if customer returns to order page

3. **Admin Dashboard**
   - Show payment attempt history
   - Display midtransOrderId for debugging
   - Track retry metrics

## Related Documentation

- Full technical docs: `docs/PAYMENT_RETRY.md`
- Midtrans Snap docs: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Midtrans Advanced Features: https://docs.midtrans.com/docs/snap-advanced-feature

## Questions Answered

**Q: How do we handle webhooks with timestamped order IDs?**
A: Webhook looks up by `midtransOrderId` instead of `orderNumber`

**Q: Can users change payment method after selecting one?**
A: Yes, by generating a new Snap token via retry endpoint. Each retry creates a fresh payment session where users can select any payment method.

**Q: What happens if customer is charged twice?**
A: Midtrans prevents duplicate charges for same `order_id`. Each retry has unique timestamped `order_id`, so no risk of duplicate charges.

**Q: How long can customer retry?**
A: Indefinitely, as long as order is not paid or cancelled. Each retry generates new 24-hour token.
