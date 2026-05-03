# 🎨 Next.js Rendering Techniques Explained

Panduan lengkap memahami berbagai teknik rendering di Next.js App Router.

---

## 📚 Overview

Next.js App Router mendukung 4 teknik rendering utama:

| Teknik  | Symbol       | Kapan Render     | Cache   | Use Case             |
| ------- | ------------ | ---------------- | ------- | -------------------- |
| **SSG** | `○`          | Build time       | Forever | Static content       |
| **ISR** | `●`          | Build + periodic | Timed   | Semi-dynamic content |
| **SSR** | `ƒ`          | Every request    | None    | Dynamic content      |
| **CSR** | `○` (client) | Browser          | Browser | User-specific        |

---

## 1️⃣ SSG (Static Site Generation)

### Definisi

Halaman di-generate saat **build time** dan disimpan sebagai HTML statis.

### Karakteristik

- ⚡ **Super cepat** - Serve HTML statis
- 🔒 **Immutable** - Tidak berubah setelah build
- 📦 **Pre-rendered** - Semua halaman di-generate saat build
- 🌍 **CDN-friendly** - Bisa di-cache di edge

### Cara Implementasi

```typescript
// app/about/page.tsx
export default async function AboutPage() {
  return <div>About Us</div>;
}
```

### Build Output

```
○ /about    1.2 kB    120 kB
```

### Kapan Menggunakan

- ✅ Static pages (About, Contact, Terms)
- ✅ Marketing landing pages
- ✅ Documentation
- ❌ Content yang sering berubah
- ❌ User-specific content

---

## 2️⃣ ISR (Incremental Static Regeneration)

### Definisi

Halaman di-generate saat **build time** atau **first request**, kemudian di-regenerate secara **periodic** di background.

### Karakteristik

- ⚡ **Cepat** - Serve dari cache
- 🔄 **Auto-update** - Regenerate berkala
- 🎯 **On-demand** - Bisa trigger manual
- 📊 **Scalable** - Handle high traffic

### Cara Implementasi

```typescript
// app/product/[slug]/page.tsx

// Enable ISR dengan revalidation 5 menit
export const revalidate = 300;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductDetails product={product} />;
}
```

### Build Output

```
● /product/[slug]    11.7 kB    242 kB    5m    1y
```

### Kapan Menggunakan

- ✅ **Product pages** - Harga/stock update berkala
- ✅ **Blog posts** - Content jarang berubah
- ✅ **News articles** - Update setiap beberapa menit
- ❌ Real-time data
- ❌ User-specific content

### On-Demand Revalidation

```typescript
// Trigger manual revalidation
import { revalidatePath } from "next/cache";

revalidatePath("/product/iphone-15");
```

---

## 3️⃣ SSR (Server-Side Rendering)

### Definisi

Halaman di-render di **server setiap request**.

### Karakteristik

- 🔄 **Always fresh** - Data selalu terbaru
- 🐌 **Slower** - Query DB setiap request
- 🔥 **High load** - Server bekerja keras
- 🎯 **SEO-friendly** - Tetap server-rendered

### Cara Implementasi

```typescript
// app/dashboard/page.tsx

// Disable caching (force SSR)
export const revalidate = 0;

export default async function DashboardPage() {
  const data = await getRealTimeData();
  return <Dashboard data={data} />;
}
```

### Build Output

```
ƒ /dashboard    5.2 kB    180 kB
```

### Kapan Menggunakan

- ✅ **Real-time dashboards** - Analytics, monitoring
- ✅ **Personalized content** - User-specific data
- ✅ **Search results** - Dynamic queries
- ❌ High traffic pages (use ISR instead)
- ❌ Static content (use SSG instead)

---

## 4️⃣ CSR (Client-Side Rendering)

### Definisi

Halaman di-render di **browser** menggunakan JavaScript.

### Karakteristik

- 🖥️ **Client-side** - Render di browser
- 🔄 **Interactive** - Real-time updates
- ❌ **No SEO** - Search engines can't see content
- 🚀 **Fast navigation** - No page reload

### Cara Implementasi

```typescript
// app/cart/page.tsx
"use client"; // Mark as client component

import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const { items, isLoading } = useCart();

  if (isLoading) return <Spinner />;
  return <CartItems items={items} />;
}
```

### Build Output

```
○ /cart    2.85 kB    187 kB
```

### Kapan Menggunakan

- ✅ **Cart** - User-specific, no SEO needed
- ✅ **Checkout** - Payment flow
- ✅ **Admin dashboard** - Auth-protected
- ✅ **Interactive forms** - Real-time validation
- ❌ Public pages (need SEO)
- ❌ Static content

---

## 🎯 Decision Tree

```
Apakah halaman perlu SEO?
├─ No → CSR (Client-Side Rendering)
│   └─ Example: Cart, Checkout, Dashboard
│
└─ Yes → Apakah data sering berubah?
    ├─ No (static) → SSG (Static Site Generation)
    │   └─ Example: About, Terms, Landing pages
    │
    ├─ Jarang (periodic) → ISR (Incremental Static Regeneration)
    │   └─ Example: Product pages, Blog posts
    │
    └─ Yes (real-time) → SSR (Server-Side Rendering)
        └─ Example: Search results, Personalized content
```

---

## 📊 Comparison Table

| Feature         | SSG    | ISR  | SSR | CSR  |
| --------------- | ------ | ---- | --- | ---- |
| **Speed**       | ⚡⚡⚡ | ⚡⚡ | 🐌  | ⚡⚡ |
| **SEO**         | ✅     | ✅   | ✅  | ❌   |
| **Freshness**   | ❌     | ⚠️   | ✅  | ✅   |
| **Server Load** | ⚡     | ⚡   | 🔥  | ⚡   |
| **Build Time**  | 🔥     | ⚡   | ⚡  | ⚡   |
| **Scalability** | ✅     | ✅   | ❌  | ✅   |

---

## 🏗️ Project Implementation

### Current Setup

```typescript
// Frontstore (SEO important)
/                    → SSG (static homepage)
/shop                → SSR (dynamic filters)
/product/[slug]      → ISR (5 min revalidation) ✨

// User-specific (no SEO)
/cart                → CSR
/checkout            → CSR
/user/*              → CSR

// Admin (auth-protected)
/d/*                 → CSR
```

---

## 💡 Best Practices

### 1. Use ISR for E-commerce Products

```typescript
// ✅ Good - Fast + Fresh
export const revalidate = 300; // 5 minutes

// ❌ Bad - Too slow
export const revalidate = 0; // SSR

// ❌ Bad - Stale data
// No revalidate (SSG)
```

### 2. Combine Techniques

```typescript
// Server Component (ISR)
export const revalidate = 300;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  return (
    <>
      {/* Static content - ISR */}
      <ProductDetails product={product} />

      {/* Dynamic content - CSR */}
      <ProductStock productId={product.id} />
      <AddToCartButton productId={product.id} />
    </>
  );
}
```

### 3. Use generateStaticParams with ISR

```typescript
// Pre-generate popular products at build time
export async function generateStaticParams() {
  const products = await getPopularProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export const revalidate = 300;
```

---

## 🔍 How to Check

### Build Output Symbols

```bash
npm run build
```

```
Route (app)                              Size    First Load JS
┌ ○ /about                              1.2 kB         120 kB    # SSG
├ ● /product/[slug]                    11.7 kB         242 kB    # ISR
├ ƒ /shop                               9.4 kB         201 kB    # SSR
└ ○ /cart                               2.8 kB         187 kB    # CSR (client)
```

### Runtime Behavior

```typescript
// Add logging to check
export default async function Page() {
  console.log("[Render]", new Date().toISOString());
  // ...
}
```

- **SSG:** Log only appears during build
- **ISR:** Log appears on first request + every revalidation
- **SSR:** Log appears on every request
- **CSR:** No server log (runs in browser)

---

## 🎓 Learn More

- [Next.js Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

## 📝 Summary

| Halaman             | Teknik     | Alasan                         |
| ------------------- | ---------- | ------------------------------ |
| **Homepage**        | SSG        | Static content, SEO            |
| **Product Detail**  | **ISR** ✨ | SEO + Performance + Fresh data |
| **Shop Listing**    | SSR        | Dynamic filters, search        |
| **Cart**            | CSR        | User-specific, no SEO          |
| **Checkout**        | CSR        | Payment flow, security         |
| **Admin Dashboard** | CSR        | Auth-protected, real-time      |

**Recommendation:** Use **ISR** untuk semua product pages di e-commerce! 🚀
