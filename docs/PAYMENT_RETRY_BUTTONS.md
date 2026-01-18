# Payment Retry - Two Button Implementation

## Overview

The payment retry feature now has **two distinct buttons** to give users clear options:

1. **"Lanjutkan Pembayaran"** - Continue with existing payment session (reuses stored token)
2. **"Ganti Metode Pembayaran"** - Change payment method (generates new token)

## Button Behavior

### Button 1: Lanjutkan Pembayaran (Continue Payment)

**When it shows:**

- Order has `snapToken` stored in database
- Payment status is "pending" or "failed"
- Order is not cancelled

**What it does:**

- Opens Snap popup using stored `snapToken`
- No API call needed (instant)
- User continues with same payment session
- All payment methods still available in Snap UI

**Technical:**

```typescript
window.snap.pay(order.snapToken, {
  onSuccess: () => redirect to /user/orders,
  onPending: () => redirect to /user/orders,
  onError: () => show error toast,
  onClose: () => user closed popup
});
```

### Button 2: Ganti Metode Pembayaran (Change Payment Method)

**When it shows:**

- Always shows for unpaid orders (regardless of token)
- Payment status is "pending" or "failed"
- Order is not cancelled

**What it does:**

- Calls `/api/payment/retry` to generate new token
- Creates new timestamped Midtrans order ID
- Redirects to fresh Midtrans payment page
- All payment methods available

**Technical:**

```typescript
POST /api/payment/retry
Body: { orderId: "uuid" }
Response: { paymentUrl, snapToken, midtransOrderId }
→ Redirect to paymentUrl
```

## Visual Layout

### Desktop View

```
┌─────────────────────────────────────────────────────┐
│ ORDER-2024-001                        [Pending]     │
│ 18 Jan 2025, 15:30                    [Unpaid]      │
├─────────────────────────────────────────────────────┤
│ [Product Image] Product Name                        │
│                 1 x Rp 100.000                      │
│                                                      │
│ [Lihat Detail ▼]                                    │
│                                                      │
│ [💳 Lanjutkan Pembayaran] [🔄 Ganti Metode]        │
└─────────────────────────────────────────────────────┘
```

### Mobile View (Stacked)

```
┌──────────────────────────┐
│ ORDER-2024-001           │
│ [Pending] [Unpaid]       │
├──────────────────────────┤
│ [Image] Product          │
│         1 x Rp 100.000   │
│                          │
│ [Lihat Detail ▼]        │
│                          │
│ [💳 Lanjutkan]          │
│     [Pembayaran]         │
│                          │
│ [🔄 Ganti Metode]       │
│     [Pembayaran]         │
└──────────────────────────┘
```

## User Scenarios

### Scenario 1: Quick Continue (Token Still Valid)

```
1. User closes payment page accidentally
   ↓
2. Returns to /user/orders
   ↓
3. Clicks "Lanjutkan Pembayaran"
   ↓
4. Snap popup opens instantly (no loading)
   ↓
5. Completes payment
```

**Benefit:** Instant, no server round-trip needed

### Scenario 2: Change Payment Method

```
1. User selected Credit Card initially
   ↓
2. Realizes they want GoPay instead
   ↓
3. Closes payment page
   ↓
4. Returns to /user/orders
   ↓
5. Clicks "Ganti Metode Pembayaran"
   ↓
6. Loading state: "Memproses..."
   ↓
7. Redirected to fresh Midtrans page
   ↓
8. Selects GoPay
   ↓
9. Completes payment
```

**Benefit:** Full flexibility to change payment method

### Scenario 3: Token Expired (After 24 Hours)

```
1. User abandons payment for 2 days
   ↓
2. Returns to /user/orders
   ↓
3. Clicks "Lanjutkan Pembayaran"
   ↓
4. Snap.js shows error (token expired)
   ↓
5. User clicks "Ganti Metode Pembayaran"
   ↓
6. New token generated
   ↓
7. Fresh payment page opens
   ↓
8. Completes payment
```

**Note:** We could add token expiry check, but Snap.js handles it gracefully

## Button States

### Normal State

```
[💳 Lanjutkan Pembayaran]  [🔄 Ganti Metode Pembayaran]
```

### Loading State (Change Method Only)

```
[💳 Lanjutkan Pembayaran]  [⏳ Memproses...]
```

### Only Change Method (No Token)

```
[🔄 Ganti Metode Pembayaran]
```

## Technical Implementation

### 1. Payment Service - Redirect URL

**File:** `lib/services/payment.service.ts`

```typescript
const finishUrl = `${process.env.NEXT_PUBLIC_APP_URL}/user/orders`;

const parameter = {
  // ... other params
  callbacks: {
    finish: finishUrl,
  },
};
```

**Result:** After payment, Midtrans redirects to `/user/orders`

### 2. Order Card Component

**File:** `app/user/orders/_components/order-card.tsx`

```typescript
// Check if token exists
const hasStoredToken = !!order.snapToken;

// Continue with existing token
const handleContinuePayment = () => {
  window.snap.pay(order.snapToken, {
    onSuccess: () => (window.location.href = "/user/orders"),
    onPending: () => (window.location.href = "/user/orders"),
    onError: () => toast.error("Pembayaran gagal"),
  });
};

// Generate new token
const handleChangePaymentMethod = () => {
  retryPayment.mutate(order.id);
};
```

### 3. Snap.js Loading

**File:** `app/user/orders/page.tsx`

```typescript
<Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
  strategy="lazyOnload"
/>
```

**Note:** Loads Snap.js only on orders page (lazy loading)

### 4. Order Type Update

**File:** `hooks/use-orders.ts`

```typescript
export interface UserOrder {
  // ... other fields
  snapToken: string | null; // Added for continue payment
}
```

## Environment Variables

Required in `.env`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-xxx"
MIDTRANS_SERVER_KEY="Mid-server-xxx"
```

## Redirect Flow

### After Payment Completion

```
Midtrans Payment Page
    ↓
User completes payment
    ↓
Midtrans redirects to: {NEXT_PUBLIC_APP_URL}/user/orders
    ↓
User sees order list
    ↓
Webhook updates order status in background
    ↓
User refreshes to see updated status
```

**Note:** Status update happens via webhook, not redirect. Redirect is just for UX.

## Error Handling

### Snap.js Not Loaded

```typescript
if (!window.snap) {
  toast.error("Snap.js belum dimuat. Silakan muat ulang halaman.");
  return;
}
```

### Token Not Found

```typescript
if (!order.snapToken) {
  toast.error("Token pembayaran tidak ditemukan");
  return;
}
```

### API Error (Change Method)

```typescript
onError: (error) => {
  toast.error(error.message || "Gagal membuat token pembayaran");
};
```

## Testing Checklist

### Test Continue Payment

- [ ] Create order, close payment page
- [ ] Verify "Lanjutkan Pembayaran" button shows
- [ ] Click button
- [ ] Verify Snap popup opens instantly
- [ ] Complete payment
- [ ] Verify redirected to /user/orders

### Test Change Payment Method

- [ ] Create order with Credit Card
- [ ] Close payment page
- [ ] Click "Ganti Metode Pembayaran"
- [ ] Verify loading state shows
- [ ] Verify redirected to Midtrans
- [ ] Select different payment method (GoPay)
- [ ] Complete payment
- [ ] Verify redirected to /user/orders

### Test Button Visibility

- [ ] Unpaid order with token: Both buttons show
- [ ] Unpaid order without token: Only "Ganti Metode" shows
- [ ] Paid order: No buttons show
- [ ] Cancelled order: No buttons show

### Test Redirect URL

- [ ] Complete payment on Midtrans
- [ ] Verify redirected to localhost:3000/user/orders
- [ ] Not example.com or other URL

### Test Token Expiry

- [ ] Create order
- [ ] Wait 24+ hours (or manually expire token)
- [ ] Click "Lanjutkan Pembayaran"
- [ ] Verify Snap shows error
- [ ] Click "Ganti Metode Pembayaran"
- [ ] Verify new token works

## Benefits

✅ **Clear User Intent** - Two buttons for two different actions
✅ **Instant Continue** - No API call for existing token
✅ **Full Flexibility** - Can change payment method anytime
✅ **Better UX** - User knows exactly what each button does
✅ **Proper Redirect** - Returns to app after payment

## Related Files

- `lib/services/payment.service.ts` - Added finish URL
- `app/user/orders/page.tsx` - Added Snap.js script
- `app/user/orders/_components/order-card.tsx` - Two button implementation
- `hooks/use-orders.ts` - Added snapToken to UserOrder type

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Change Midtrans to production mode in payment service
- [ ] Update Snap.js URL to production: `https://app.midtrans.com/snap/snap.js`
- [ ] Test redirect URL works with production domain
- [ ] Verify webhook URL is accessible from Midtrans servers
