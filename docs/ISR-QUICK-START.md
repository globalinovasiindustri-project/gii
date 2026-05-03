# 🚀 ISR Quick Start Guide

Panduan cepat untuk memahami dan menggunakan ISR di project ini.

---

## ❓ Apa itu ISR?

**ISR (Incremental Static Regeneration)** adalah teknik rendering di Next.js yang menggabungkan kecepatan **Static Site Generation (SSG)** dengan fleksibilitas **Server-Side Rendering (SSR)**.

### Analogi Sederhana

Bayangkan sebuah restoran:

**SSR (Server-Side Rendering):**

- Chef masak pesanan dari awal setiap kali ada order
- ✅ Selalu fresh
- ❌ Lambat (tunggu masak)

**SSG (Static Site Generation):**

- Chef masak semua menu di pagi hari, simpan di display
- ✅ Super cepat (tinggal ambil)
- ❌ Tidak fresh (masakan pagi)

**ISR (Incremental Static Regeneration):**

- Chef masak menu di pagi hari, simpan di display
- Setiap 5 menit, chef update menu yang sudah lama
- Customer tetap dapat menu lama sambil chef masak yang baru
- ✅ Cepat + Fresh!

---

## 🎯 Kapan Menggunakan ISR?

### ✅ Cocok untuk:

- **Product pages** - Harga/stock jarang berubah
- **Blog posts** - Konten statis dengan update berkala
- **Landing pages** - Marketing content
- **Documentation** - Technical docs

### ❌ Tidak cocok untuk:

- **Cart page** - User-specific, real-time
- **Checkout** - Payment flow, security-sensitive
- **Dashboard** - Real-time analytics
- **Chat/Messages** - Real-time communication

---

## 📖 Cara Menggunakan

### 1. Enable ISR di Page

```typescript
// app/product/[slug]/page.tsx

// Tambahkan satu baris ini:
export const revalidate = 300; // 5 menit

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductDetails product={product} />;
}
```

**That's it!** Next.js akan otomatis:

- Generate page saat pertama kali diakses
- Cache hasilnya
- Regenerate setiap 5 menit

---

### 2. Trigger Manual Revalidation

Saat admin update product, trigger revalidation instant:

```typescript
// app/api/admin/products/[id]/route.ts
import { revalidatePath } from "next/cache";

export async function PATCH(request, { params }) {
  // Update product
  const result = await updateProduct(params.id, data);

  // Revalidate instantly
  revalidatePath(`/product/${result.slug}`);

  return NextResponse.json({ success: true });
}
```

---

## 🔧 Configuration Options

### Revalidation Time

```typescript
// 5 menit (recommended untuk e-commerce)
export const revalidate = 300;

// 10 menit
export const revalidate = 600;

// 1 jam
export const revalidate = 3600;

// 1 hari
export const revalidate = 86400;

// Disable ISR (pure SSR)
export const revalidate = 0;

// Never revalidate (pure SSG)
export const revalidate = false;
```

### Revalidation Scope

```typescript
// Revalidate single page
revalidatePath("/product/iphone-15");

// Revalidate all pages in a route
revalidatePath("/product/[slug]", "page");

// Revalidate layout (affects all nested pages)
revalidatePath("/shop", "layout");
```

---

## 🧪 Testing ISR

### Development Mode

```bash
npm run dev
```

⚠️ **Note:** ISR tidak bekerja sempurna di dev mode. Cache sering di-bypass untuk development experience yang lebih baik.

### Production Mode

```bash
# Build production
npm run build

# Start production server
npm run start

# Test di browser
open http://localhost:3000/product/iphone-15
```

### Verify ISR is Working

1. **First request** - Check Network tab, should be slower (~500ms)
2. **Second request** - Should be instant (~50ms) - served from cache
3. **Wait 5 minutes** - Next request triggers background regeneration
4. **Admin update** - Changes visible immediately

---

## 📊 Monitoring

### Check Build Output

```bash
npm run build
```

Look for symbol `●` in build output:

```
● /product/[slug]    11.7 kB    242 kB    5m    1y
```

- `●` = ISR enabled
- `5m` = Revalidate every 5 minutes
- `1y` = Cache expires after 1 year

### Production Logs

```bash
# Check Next.js logs
npm run start

# Look for:
# "Regenerating /product/iphone-15"
# "Cache hit for /product/iphone-15"
```

---

## 🐛 Common Issues

### Issue: Changes not visible after admin update

**Cause:** `revalidatePath()` not called or wrong path

**Solution:**

```typescript
// Make sure path is correct
revalidatePath(`/product/${product.slug}`); // ✅ Correct
revalidatePath(`product/${product.slug}`); // ❌ Wrong (missing /)
```

### Issue: Page still slow after first request

**Cause:** Running in development mode

**Solution:** Test in production mode:

```bash
npm run build && npm run start
```

### Issue: ISR not working at all

**Cause:** Dynamic functions used in page

**Solution:** Avoid these in ISR pages:

```typescript
// ❌ Don't use in ISR pages
cookies()
headers()
searchParams (without generateStaticParams)
```

---

## 💡 Best Practices

### 1. Set Appropriate Revalidation Time

```typescript
// E-commerce products: 5-15 minutes
export const revalidate = 300;

// Blog posts: 1 hour
export const revalidate = 3600;

// Static content: 1 day
export const revalidate = 86400;
```

### 2. Always Revalidate on Admin Updates

```typescript
// After create/update/delete
revalidatePath(`/product/${product.slug}`);
revalidatePath("/shop"); // Also revalidate listing
```

### 3. Use ISR with generateStaticParams

```typescript
// Pre-generate popular products at build time
export async function generateStaticParams() {
  const products = await getPopularProducts();
  return products.map((p) => ({ slug: p.slug }));
}
```

### 4. Monitor Cache Performance

```typescript
// Add logging
console.log(`[ISR] Regenerating /product/${slug}`);
```

---

## 🎓 Learn More

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Full Implementation Guide](./ISR-IMPLEMENTATION.md)

---

## 📞 Need Help?

Check the full documentation:

- **Quick Start:** This file
- **Full Guide:** `docs/ISR-IMPLEMENTATION.md`
- **Summary:** `IMPLEMENTATION-SUMMARY.md`
