# ISR (Incremental Static Regeneration) Implementation

Dokumentasi implementasi ISR untuk halaman product detail di e-commerce.

---

## 🎯 Tujuan

Mengoptimalkan performa halaman product detail dengan:

- **Kecepatan tinggi** seperti static site (serve dari cache)
- **Data selalu fresh** dengan revalidation otomatis
- **Update instant** saat admin edit product

---

## 📋 Implementasi

### 1. ISR di Product Page

**File:** `app/product/[slug]/page.tsx`

```typescript
// Enable ISR dengan revalidation setiap 5 menit
export const revalidate = 300;
```

**Cara kerja:**

- Halaman di-generate saat pertama kali diakses
- Disimpan di cache selama 5 menit
- Request berikutnya serve dari cache (super cepat)
- Setelah 5 menit, Next.js regenerate halaman di background
- User tetap dapat cache lama sambil menunggu regeneration

---

### 2. On-Demand Revalidation API

**File:** `app/api/revalidate/route.ts`

API endpoint untuk trigger revalidation secara manual (instant update).

**Usage:**

```typescript
// Revalidate single path
POST / api / revalidate;
Body: {
  path: "/product/iphone-15";
}

// Revalidate multiple paths
POST / api / revalidate;
Body: {
  paths: ["/product/iphone-15", "/shop"];
}
```

**Response:**

```json
{
  "success": true,
  "message": "Revalidated: /product/iphone-15",
  "data": {
    "revalidated": ["/product/iphone-15"]
  }
}
```

**Auth:** Requires admin authentication (JWT token)

---

### 3. Auto-Revalidation pada Admin Actions

#### Create Product

**File:** `app/api/admin/products/route.ts`

```typescript
const result = await productService.createCompleteProduct(validatedData);

// Revalidate shop listing to show new product
revalidatePath("/shop");
revalidatePath(`/product/${result.productGroup.slug}`);
```

#### Update Product

**File:** `app/api/admin/products/[id]/route.ts`

```typescript
const result = await productService.updateCompleteProduct(id, validatedData);

// Revalidate product page and shop listing instantly
revalidatePath(`/product/${result.productGroup.slug}`);
revalidatePath("/shop");
```

**Benefit:** Admin tidak perlu tunggu 5 menit, perubahan langsung terlihat!

---

## 🚀 Performa

### Sebelum ISR (SSR)

```
Request → Database Query → Render → Response
Time: ~500-1000ms per request
Server Load: High (query setiap request)
```

### Setelah ISR

```
Request → Serve from Cache → Response
Time: ~50-100ms (10x lebih cepat!)
Server Load: Low (cache hit)

Background: Revalidate setiap 5 menit
Admin Update: Instant revalidation
```

---

## 📊 Comparison Table

| Metric          | SSR          | ISR            | ISR + On-Demand |
| --------------- | ------------ | -------------- | --------------- |
| **Speed**       | 🐌 500ms     | ⚡ 50ms        | ⚡ 50ms         |
| **Freshness**   | ✅ Real-time | ⚠️ 5 min delay | ✅ Instant      |
| **SEO**         | ✅ Perfect   | ✅ Perfect     | ✅ Perfect      |
| **Server Load** | 🔥 High      | ⚡ Low         | ⚡ Low          |
| **Admin UX**    | ✅ Instant   | ❌ 5 min wait  | ✅ Instant      |

---

## 🔧 Configuration

### Revalidation Time

Ubah waktu revalidation di `app/product/[slug]/page.tsx`:

```typescript
// 5 menit (default)
export const revalidate = 300;

// 10 menit
export const revalidate = 600;

// 1 jam
export const revalidate = 3600;

// Disable ISR (pure SSR)
export const revalidate = 0;
```

### Revalidation Paths

Tambahkan path lain yang perlu di-revalidate:

```typescript
// Revalidate homepage juga
revalidatePath("/");

// Revalidate category page
revalidatePath(`/shop?category=${product.category}`);

// Revalidate all shop pages (use with caution!)
revalidatePath("/shop", "page");
```

---

## 🧪 Testing

### 1. Test ISR Cache

```bash
# First request (cache miss - slow)
curl http://localhost:3000/product/iphone-15

# Second request (cache hit - fast!)
curl http://localhost:3000/product/iphone-15
```

### 2. Test On-Demand Revalidation

```bash
# Login as admin first to get JWT token
# Then trigger revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"path": "/product/iphone-15"}'
```

### 3. Test Admin Update

1. Login ke dashboard admin
2. Edit product (ubah harga/stock)
3. Save changes
4. Buka halaman product → perubahan langsung terlihat!

---

## 📝 Best Practices

### ✅ DO

- Use ISR untuk halaman yang jarang berubah (product details, blog posts)
- Set revalidation time sesuai kebutuhan bisnis (5-15 menit untuk e-commerce)
- Trigger revalidation setelah admin update data
- Monitor cache hit rate di production

### ❌ DON'T

- Jangan set revalidation terlalu pendek (< 60 detik) → waste resources
- Jangan revalidate terlalu banyak paths sekaligus → server overload
- Jangan gunakan ISR untuk user-specific pages (cart, checkout)
- Jangan lupa handle error saat revalidation gagal

---

## 🐛 Troubleshooting

### Cache tidak update setelah 5 menit

**Penyebab:** Development mode tidak cache secara konsisten

**Solusi:** Test di production build

```bash
npm run build
npm run start
```

### Revalidation API return 401

**Penyebab:** JWT token tidak valid atau expired

**Solusi:** Login ulang untuk mendapatkan token baru

### Perubahan tidak terlihat setelah admin update

**Penyebab:** `revalidatePath()` tidak dipanggil atau path salah

**Solusi:**

1. Check console log untuk error
2. Pastikan path match dengan route yang di-cache
3. Gunakan absolute path (e.g., `/product/slug` bukan `product/slug`)

---

## 🔮 Future Improvements

1. **Cache Warming**: Pre-generate popular products saat build
2. **Stale-While-Revalidate**: Show stale content while fetching fresh data
3. **Edge Caching**: Deploy to Vercel Edge untuk global CDN
4. **Analytics**: Track cache hit/miss rate
5. **Smart Revalidation**: Only revalidate affected pages (e.g., category pages)

---

## 📚 References

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
