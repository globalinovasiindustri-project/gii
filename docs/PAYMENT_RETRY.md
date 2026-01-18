# Payment Retry Implementation

This document explains how payment retry works with Midtrans Snap integration.

## Overview

When a customer cancels payment or encounters issues during checkout, they can retry payment for the same order. This implementation uses timestamped Midtrans order IDs to support multiple payment attempts while maintaining a clean order number for customers.

## Architecture

### Database Schema

Two new columns added to the `orders` table:

- `midtrans_order_id` (text): The actual order_id sent to Midtrans (includes timestamp for retries)
- `snap_token` (text): The Snap token for reopening payment page
- Index on `midtrans_order_id` for fast webhook lookups

### Flow Diagram

```
Customer Order: ORDER-2024-001
    ↓
First Payment Attempt:
    Midtrans Order ID: ORDER-2024-001-1737123456789
    Snap Token: abc123...
    ↓
Customer Cancels
    ↓
Retry Payment:
    Midtrans Order ID: ORDER-2024-001-1737123999999
    Snap Token: xyz789...
    ↓
Payment Success → Webhook uses midtrans_order_id to find order
```

## Implementation Details

### 1. Payment Token Creation

**File:** `lib/services/payment.service.ts`

```typescript
// Generates unique Midtrans order ID with timestamp
const midtransOrderId = `${input.orderNumber}-${Date.now()}`;

// Returns token, redirectUrl, and midtransOrderId
return {
  token: transaction.token,
  redirectUrl: transaction.redirect_url,
  midtransOrderId,
};
```

### 2. Storing Payment Data

**Files:**

- `app/api/checkout/authenticated/route.ts`
- `app/api/checkout/guest/route.ts`

After creating Snap token, both checkout routes store:

```typescript
await db.update(orders).set({
  midtransOrderId: paymentToken.midtransOrderId,
  snapToken: paymentToken.token,
  updatedAt: new Date(),
});
```

### 3. Webhook Handler

**File:** `app/api/payment/notification/route.ts`

Webhook looks up orders by `midtransOrderId` instead of `orderNumber`:

```typescript
const midtransOrderId = notification.order_id; // e.g., "ORDER-2024-001-1737123456789"

const [order] = await db
  .select()
  .from(orders)
  .where(eq(orders.midtransOrderId, midtransOrderId))
  .limit(1);
```

### 4. Payment Retry Endpoint

**File:** `app/api/payment/retry/route.ts`

**Endpoint:** `POST /api/payment/retry`

**Request Body:**

```json
{
  "orderId": "uuid-of-order"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token pembayaran berhasil dibuat",
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORDER-2024-001",
    "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
    "snapToken": "abc123..."
  }
}
```

**Validations:**

- Order must exist
- Order must not be paid already
- Order must not be cancelled

## Usage Examples

### Frontend: Retry Payment Button

```typescript
// In your order detail page
const retryPayment = async (orderId: string) => {
  const response = await fetch("/api/payment/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  const result = await response.json();

  if (result.success) {
    // Option 1: Redirect to payment URL
    window.location.href = result.data.paymentUrl;

    // Option 2: Open Snap popup (if using snap.js)
    window.snap.pay(result.data.snapToken);
  }
};
```

### Frontend: Reuse Stored Snap Token

If customer closes payment page without completing:

```typescript
// Reuse the stored snapToken from order
const continuePayment = (snapToken: string) => {
  window.snap.pay(snapToken);
};
```

## Benefits

1. **Clean Order Numbers**: Customer-facing order numbers stay clean (e.g., ORDER-2024-001)
2. **Multiple Retries**: Same order can have unlimited payment attempts
3. **Audit Trail**: Each payment attempt has unique Midtrans order ID
4. **No Duplication**: Prevents order duplication issues
5. **Fast Lookups**: Indexed `midtrans_order_id` for webhook performance

## Limitations

### Snap Token Expiry

- Default Snap token lifetime: 24 hours
- After expiry, must call `/api/payment/retry` to generate new token
- Cannot reuse expired token

### Order Status

Payment retry only works for orders with:

- `paymentStatus`: "pending" or "failed"
- `orderStatus`: NOT "cancelled"

## Testing

### Test Scenario 1: Cancel and Retry

1. Create order via checkout
2. Open payment page
3. Cancel payment (close browser/click back)
4. Call `/api/payment/retry` with orderId
5. Complete payment with new token
6. Verify webhook updates order correctly

### Test Scenario 2: Multiple Retries

1. Create order
2. Retry payment 3 times (cancel each time)
3. Complete payment on 4th attempt
4. Verify only the successful payment is recorded

### Test Scenario 3: Token Reuse

1. Create order
2. Store snapToken from response
3. Close payment page
4. Reopen with same snapToken (within 24 hours)
5. Complete payment

## Migration

Run the migration to add new columns:

```bash
npm run db:push
```

Or manually apply:

```sql
ALTER TABLE "orders" ADD COLUMN "midtrans_order_id" text;
ALTER TABLE "orders" ADD COLUMN "snap_token" text;
CREATE INDEX "order_midtrans_order_id_idx" ON "orders" ("midtrans_order_id");
```

## Troubleshooting

### Webhook Returns 404

**Problem:** Order not found in webhook handler

**Solution:** Check that `midtransOrderId` was stored correctly during checkout

```sql
SELECT id, order_number, midtrans_order_id, snap_token
FROM orders
WHERE order_number = 'ORDER-2024-001';
```

### Cannot Retry Payment

**Problem:** Retry endpoint returns validation error

**Possible Causes:**

- Order already paid (`paymentStatus = 'paid'`)
- Order cancelled (`orderStatus = 'cancelled'`)
- Order not found

**Solution:** Check order status before allowing retry

### Duplicate Payments

**Problem:** Customer charged twice for same order

**Prevention:**

- Midtrans prevents duplicate payments for same `order_id`
- Each retry generates new timestamped `order_id`
- Webhook updates order based on `midtransOrderId`

## Related Files

- `lib/services/payment.service.ts` - Payment token generation
- `lib/db/schema.ts` - Orders table schema
- `app/api/checkout/authenticated/route.ts` - Authenticated checkout
- `app/api/checkout/guest/route.ts` - Guest checkout
- `app/api/payment/notification/route.ts` - Webhook handler
- `app/api/payment/retry/route.ts` - Payment retry endpoint
- `lib/db/migrations/0011_add_midtrans_fields_to_orders.sql` - Migration

## References

- [Midtrans Snap Documentation](https://docs.midtrans.com/docs/snap-snap-integration-guide)
- [Midtrans Advanced Features](https://docs.midtrans.com/docs/snap-advanced-feature)
