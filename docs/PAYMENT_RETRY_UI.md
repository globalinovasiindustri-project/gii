# Payment Retry UI - User Guide

## User Interface Changes

### Order List Page (`/user/orders`)

#### Before (No Payment Button)

```
┌─────────────────────────────────────────────┐
│ ORDER-2024-001                    [Pending] │
│ 18 Jan 2025, 15:30                  [Unpaid]│
├─────────────────────────────────────────────┤
│ [Product Image] Product Name                │
│                 1 x Rp 100.000              │
│                                              │
│ [Lihat Detail ▼]                            │
└─────────────────────────────────────────────┘
```

#### After (With Payment Button)

```
┌─────────────────────────────────────────────┐
│ ORDER-2024-001                    [Pending] │
│ 18 Jan 2025, 15:30                  [Unpaid]│
├─────────────────────────────────────────────┤
│ [Product Image] Product Name                │
│                 1 x Rp 100.000              │
│                                              │
│ [Lihat Detail ▼] [💳 Lanjutkan Pembayaran] │
└─────────────────────────────────────────────┘
```

## Button Visibility Rules

### ✅ Button Shows When:

- Payment Status: `pending` OR `failed`
- Order Status: NOT `cancelled`

### ❌ Button Hidden When:

- Payment Status: `paid`
- Order Status: `cancelled`
- Order Status: `delivered`

## User Flow

### Scenario 1: Customer Cancels Payment

```
1. Customer completes checkout
   ↓
2. Redirected to Midtrans payment page
   ↓
3. Customer closes browser/clicks back
   ↓
4. Returns to /user/orders
   ↓
5. Sees "Lanjutkan Pembayaran" button
   ↓
6. Clicks button
   ↓
7. New payment page opens with ALL payment methods available
   ↓
8. Customer selects different payment method
   ↓
9. Completes payment
```

### Scenario 2: Payment Method Change

```
1. Customer initially selected Credit Card
   ↓
2. Realizes they want to use GoPay instead
   ↓
3. Closes payment page
   ↓
4. Goes to /user/orders
   ↓
5. Clicks "Lanjutkan Pembayaran"
   ↓
6. New Snap page opens
   ↓
7. Selects GoPay (or any other method)
   ↓
8. Completes payment
```

### Scenario 3: Payment Expired (After 24 Hours)

```
1. Customer abandons payment for 2 days
   ↓
2. Returns to /user/orders
   ↓
3. Clicks "Lanjutkan Pembayaran"
   ↓
4. System generates NEW token automatically
   ↓
5. Fresh payment page opens
   ↓
6. Customer completes payment
```

## Button States

### Normal State

```
┌──────────────────────────────┐
│ 💳 Lanjutkan Pembayaran      │
└──────────────────────────────┘
```

### Loading State (While Generating Token)

```
┌──────────────────────────────┐
│ ⏳ Memproses...              │
└──────────────────────────────┘
```

### After Click

- User is redirected to Midtrans payment page
- Full payment method selection available
- Can choose any payment method (not limited to previous choice)

## Technical Details

### What Happens Behind the Scenes

1. **User Clicks Button**

   ```typescript
   onClick={() => retryPayment.mutate(order.id)}
   ```

2. **API Call**

   ```
   POST /api/payment/retry
   Body: { orderId: "uuid" }
   ```

3. **Backend Process**
   - Validates order status
   - Generates new Midtrans order ID: `ORDER-2024-001-1737199999999`
   - Creates new Snap token
   - Stores in database
   - Returns payment URL

4. **Frontend Redirect**

   ```typescript
   window.location.href = data.data.paymentUrl;
   ```

5. **User Completes Payment**
   - Midtrans sends webhook to `/api/payment/notification`
   - Webhook looks up by `midtransOrderId`
   - Updates order status to `paid`

## Error Handling

### Error: Order Already Paid

```
Toast: "Order sudah dibayar"
Button: Disabled/Hidden
```

### Error: Order Cancelled

```
Toast: "Order sudah dibatalkan"
Button: Disabled/Hidden
```

### Error: Network Issue

```
Toast: "Gagal membuat token pembayaran"
Button: Remains clickable (user can retry)
```

## Mobile Responsive

### Mobile View

```
┌─────────────────────────┐
│ ORDER-2024-001          │
│ [Pending] [Unpaid]      │
├─────────────────────────┤
│ [Image] Product         │
│         1 x Rp 100.000  │
│                         │
│ [Lihat Detail ▼]       │
│ [💳 Lanjutkan]         │
│     [Pembayaran]        │
└─────────────────────────┘
```

Buttons stack vertically on mobile for better UX.

## Testing Checklist

### Manual Testing Steps

1. **Create Unpaid Order**
   - [ ] Go to checkout
   - [ ] Complete order creation
   - [ ] Close payment page immediately
   - [ ] Verify order appears in /user/orders

2. **Test Payment Button**
   - [ ] Verify "Lanjutkan Pembayaran" button is visible
   - [ ] Click button
   - [ ] Verify redirected to Midtrans
   - [ ] Verify all payment methods available

3. **Test Payment Method Change**
   - [ ] Select Credit Card initially
   - [ ] Close payment page
   - [ ] Click "Lanjutkan Pembayaran"
   - [ ] Select GoPay instead
   - [ ] Complete payment
   - [ ] Verify order status updates to paid

4. **Test Multiple Retries**
   - [ ] Create order
   - [ ] Retry payment 3 times (cancel each time)
   - [ ] Complete on 4th attempt
   - [ ] Verify only one payment recorded

5. **Test Button Visibility**
   - [ ] Paid order: Button should NOT show
   - [ ] Cancelled order: Button should NOT show
   - [ ] Pending order: Button SHOULD show
   - [ ] Failed order: Button SHOULD show

6. **Test Error Cases**
   - [ ] Try to retry paid order (should show error)
   - [ ] Try to retry cancelled order (should show error)
   - [ ] Test with network offline (should show error)

## User Benefits

✅ **No Need to Re-order** - Customer can retry payment for same order
✅ **Change Payment Method** - Full flexibility to choose different method
✅ **Unlimited Retries** - No limit on payment attempts
✅ **Clean Order History** - Same order number throughout
✅ **Better Conversion** - Reduces abandoned carts

## Admin View

Admins can see payment retry history:

- Original Midtrans Order ID: `ORDER-2024-001-1737123456789`
- Retry 1 Midtrans Order ID: `ORDER-2024-001-1737199999999`
- Retry 2 Midtrans Order ID: `ORDER-2024-001-1737288888888`

All attempts linked to same customer order: `ORDER-2024-001`

## Related Files

- Frontend: `app/user/orders/_components/order-card.tsx`
- Hook: `hooks/use-orders.ts` (useRetryPayment)
- API: `app/api/payment/retry/route.ts`
- Backend: `lib/services/payment.service.ts`

## Support

If users encounter issues:

1. Check order status in database
2. Verify `midtransOrderId` is stored
3. Check webhook logs for payment updates
4. Verify Midtrans credentials are correct
