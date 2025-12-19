# 🔥 Architecture Roast: Global Inovasi Industri

**Rating: 6.5/10** - "Decent foundation, tapi banyak yang bisa diperbaiki"

---

## 📊 Executive Summary

Project ini adalah Next.js 15 e-commerce app dengan App Router, Drizzle ORM, dan Neon PostgreSQL. Secara keseluruhan, arsitekturnya **cukup solid untuk MVP**, tapi ada beberapa red flags yang perlu diaddress sebelum scaling.

---

## 🎯 Expected Pattern vs Reality

**Target Pattern (1-person maintainable):**

```
Presentational Component (uncontrolled)
    ↓
Container (orchestrate)
    ↓
Hooks (Logic + Fetch - API bisa di file yang sama)
    ↓
API Route
    ↓
Service
    ↓
DB

+ Validation: Zod di file terpisah
```

---

## ✅ Module Analysis: Yang Udah Bener

### 1. **Auth Module** ⭐⭐⭐⭐⭐ (95%)

**Pattern compliance: EXCELLENT**

```
✅ Presentational: components/auth/login-form.tsx (uncontrolled, terima mutation via props)
✅ Presentational: components/auth/register-form.tsx (uncontrolled, terima registerMutation prop)
✅ Hooks: hooks/use-auth.tsx (authApi + useLogin/useRegister/useMe dalam 1 file)
✅ API: app/api/auth/login/route.ts
✅ Service: lib/services/auth.service.ts
✅ Validation: lib/validations/auth.validation.ts (Zod, file terpisah)
```

**Yang bagus:**

- `RegisterForm` terima `registerMutation` sebagai prop → truly presentational
- `LoginForm` pakai `useLogin()` hook langsung (acceptable untuk form sederhana)
- Validation schema di file terpisah dengan type inference
- Service layer clean, handle magic link flow dengan baik

**Minor improvement:**

- `LoginForm` bisa lebih presentational kalau `useLogin()` di-lift ke container

---

### 2. **Checkout Module** ⭐⭐⭐⭐⭐ (92%)

**Pattern compliance: EXCELLENT**

```
✅ Container: app/checkout/page.tsx (orchestrate semua logic)
✅ Presentational: components/checkout/address-form.tsx (uncontrolled, formRef pattern)
✅ Presentational: components/checkout/contact-info-form.tsx
✅ Presentational: components/checkout/order-summary-card.tsx
✅ Hooks: hooks/use-checkout.ts (checkoutApi + useGuestCheckout/useAuthenticatedCheckout)
✅ API: app/api/checkout/guest/route.ts
✅ Service: lib/services/order.service.ts
✅ Validation: lib/validations/checkout.validation.ts (Zod, comprehensive)
```

**Yang bagus:**

- `CheckoutPage` sebagai container yang orchestrate semua state
- `AddressForm` pakai `formRef` pattern untuk expose form ke parent → smart!
- Validation schema lengkap: `contactInfoSchema`, `addressSchema`, `guestCheckoutSchema`
- Clean separation antara guest vs authenticated checkout

**Contoh pattern yang bener:**

```typescript
// Container orchestrate
const contactFormRef = useRef<UseFormReturn<ContactInfoSchema> | null>(null);
const addressFormRef = useRef<UseFormReturn<AddressFormData> | null>(null);

// Presentational component expose form via ref
<AddressForm formRef={(form) => (addressFormRef.current = form)} />
```

---

### 3. **Address Module** ⭐⭐⭐⭐ (85%)

**Pattern compliance: VERY GOOD**

```
✅ Hooks: hooks/use-addresses.ts (addressApi + mutations dalam 1 file)
✅ API: app/api/addresses/route.ts
✅ Service: lib/services/address.service.ts (transaction-safe!)
⚠️ Validation: Inline di API route (harusnya pakai Zod schema)
```

**Yang bagus:**

- Service layer pakai transactions untuk default address handling
- Hook return clean interface dengan loading states

**Yang kurang:**

- Validation inline di API route, harusnya pakai schema dari `checkout.validation.ts`

---

### 4. **Shop/Product Display Module** ⭐⭐⭐⭐ (88%)

**Pattern compliance: VERY GOOD**

```
✅ Container: app/shop/page.tsx (SSR, orchestrate filters + products)
✅ Presentational: components/shop/product-grid.tsx (pure render)
✅ Presentational: components/shop/product-filters.tsx (controlled via props)
✅ Hooks: hooks/use-filter-state.ts (filter logic)
✅ Service: lib/services/product.service.ts (direct call, no API for SSR)
✅ Validation: lib/utils/parse-shop-params.ts (param parsing)
```

**Yang bagus:**

- SSR approach → service dipanggil langsung, skip API layer (correct!)
- `ProductFilters` fully controlled via `useFilterState` hook
- `ProductGrid` pure presentational, no internal state

**Pattern SSR yang bener:**

```typescript
// app/shop/page.tsx - Container (SSR)
const [categories, brands, priceRange] = await Promise.all([
  productService.getCategories(),
  productService.getBrands(),
  productService.getPriceRange(),
]);
```

---

## ⚠️ Module Analysis: Yang Perlu Diperbaiki

### 5. **Cart Module** ⭐⭐⭐ (70%)

**Pattern compliance: NEEDS IMPROVEMENT**

```
⚠️ Container: app/cart/page.tsx (terlalu banyak logic)
✅ Presentational: components/cart/cart-item.tsx (mostly good)
⚠️ Hooks: hooks/use-cart.ts (cartApi + hooks, tapi ada logic leak)
✅ API: app/api/cart/route.ts
✅ Service: lib/services/cart.service.ts
❌ Validation: Tidak ada Zod schema untuk cart operations
```

**Masalah:**

1. **Container terlalu fat:**

```typescript
// app/cart/page.tsx - Terlalu banyak logic di container
useEffect(() => {
  const validateCart = async () => {
    // 30+ lines of validation logic
    // Auto-apply suggested actions
    for (const error of result.errors) {
      if (error.suggestedAction === "REMOVE") {
        removeItem(error.itemId);
      }
      // ...
    }
  };
  validateCart();
}, [items.length]);
```

**Harusnya:** Extract ke custom hook `useCartValidation()`

2. **CartItem punya internal state yang complex:**

```typescript
// components/cart/cart-item.tsx
const [localQuantity, setLocalQuantity] = useState(quantity);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
```

**Ini acceptable** untuk optimistic UI, tapi debounce logic bisa di-extract ke hook.

3. **Tidak ada validation schema:**

```typescript
// Harusnya ada lib/validations/cart.validation.ts
export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  variantSelections: z.record(z.string(), z.string()).optional(),
});
```

---

### 6. **Product Admin Module** ⭐⭐⭐ (65%)

**Pattern compliance: NEEDS WORK**

```
⚠️ Hooks: hooks/use-products.ts (mixed admin + public concerns)
✅ API: app/api/admin/products/route.ts
✅ Service: lib/services/product.service.ts
✅ Validation: lib/validations/product.validation.ts (comprehensive!)
```

**Masalah:**

1. **Hook campur admin + public:**

```typescript
// hooks/use-products.ts
const productApi = {
  getProducts: async () => fetch(`/api/admin/products?${params}`), // Admin!
  createProduct: async () => fetch("/api/admin/products"), // Admin!
};

// Tapi juga dipakai untuk public product display
export interface CompleteProduct { ... } // Shared type
```

**Harusnya:** Split jadi `use-admin-products.ts` dan `use-products.ts`

2. **Service layer terlalu besar (1000+ lines):**

- `product.service.ts` handle terlalu banyak responsibility
- Bisa di-split: `product-query.service.ts`, `product-mutation.service.ts`

---

## 📊 Module Compliance Summary

| Module            | Pattern Score  | Notes                           |
| ----------------- | -------------- | ------------------------------- |
| **Auth**          | ⭐⭐⭐⭐⭐ 95% | Near perfect, minor lift needed |
| **Checkout**      | ⭐⭐⭐⭐⭐ 92% | Excellent formRef pattern       |
| **Shop/Display**  | ⭐⭐⭐⭐ 88%   | Good SSR approach               |
| **Address**       | ⭐⭐⭐⭐ 85%   | Missing Zod validation          |
| **Cart**          | ⭐⭐⭐ 70%     | Fat container, no validation    |
| **Product Admin** | ⭐⭐⭐ 65%     | Mixed concerns, large service   |

---

## 🛠️ Quick Fixes untuk Pattern Compliance

### Fix 1: Extract Cart Validation Hook

```typescript
// hooks/use-cart-validation.ts
export function useCartValidation(items: CartItem[]) {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { mutate: updateQuantity } = useUpdateCartQuantity();
  const { mutate: removeItem } = useRemoveFromCart();

  useEffect(() => {
    if (items.length === 0) {
      setValidationResult(null);
      return;
    }

    const validate = async () => {
      setIsValidating(true);
      try {
        const response = await cartApi.validateCart(items);
        setValidationResult(response.data);

        // Auto-apply fixes
        for (const error of response.data.errors) {
          if (error.suggestedAction === "REMOVE") {
            removeItem(error.itemId);
          } else if (error.suggestedAction === "UPDATE_QUANTITY") {
            updateQuantity({
              itemId: error.itemId,
              quantity: error.currentStock!,
            });
          }
        }
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [items.length]);

  return { validationResult, isValidating };
}
```

### Fix 2: Add Cart Validation Schema

```typescript
// lib/validations/cart.validation.ts
import { z } from "zod";

export const addToCartSchema = z.object({
  product: z.object({
    productId: z.string().uuid(),
    variantSelections: z.record(z.string(), z.string()).default({}),
  }),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
```

### Fix 3: Split Product Hooks

```typescript
// hooks/use-admin-products.ts (admin only)
export function useAdminProducts(filters: ProductFilters) { ... }
export function useCreateProduct() { ... }
export function useUpdateProduct() { ... }

// hooks/use-products.ts (public only)
export function usePublicProducts(filters: ProductFilters) { ... }
export function useProductBySlug(slug: string) { ... }
```

---

## 🔴 Yang Bikin Gue Cringe (Critical Issues)

### 1. **Component Folder = Dumpster Fire** 🗑️

```
components/
├── CircularText/          # PascalCase folder? Kenapa?
├── auth/                  # Feature-based ✓
├── cart/                  # Feature-based ✓
├── checkout/              # Feature-based ✓
├── common/                # Generic dump
├── kibo-ui/               # Apa ini?
├── landing-page/          # Feature-based ✓
├── shadcn-studio/         # Another mystery folder
├── ui/                    # shadcn components
├── app-sidebar.tsx        # Loose file
├── bundle-showcase-section.tsx  # Loose file
├── cart-drawer.tsx        # Harusnya di cart/
├── hero-section.tsx       # Harusnya di landing-page/
├── product-card.tsx       # Loose file
├── ... 15+ more loose files
```

**Masalah:**

- Inconsistent naming convention (PascalCase vs kebab-case folders)
- Banyak loose files yang harusnya grouped by feature
- `cart-drawer.tsx` di root tapi `cart/` folder juga ada
- `kibo-ui/` dan `shadcn-studio/` - mystery folders tanpa clear purpose

### 2. **JSON String Abuse di Database** 💀

```typescript
// lib/db/schema.ts
images: text("images"), // JSON array of image objects
additionalDescriptions: text("additional_descriptions"), // JSON array
shippingAddress: text("shipping_address").notNull(), // JSON string
billingAddress: text("billing_address").notNull(), // JSON string
variantSelections: text("variant_selections").notNull().default("{}"),
```

**Kenapa ini buruk:**

- Gak bisa di-query efficiently
- No type safety at database level
- Manual JSON.parse() everywhere = bug waiting to happen
- PostgreSQL punya `jsonb` type yang proper!

### 3. **Duplicate Code di Cart Service** 🔄

```typescript
// lib/services/cart.service.ts
async getCart(identifier: string): Promise<CartItem[]> {
  // ... 50 lines of code
}

async getCartByUserId(userId: string): Promise<CartItem[]> {
  // ... literally the same 50 lines with minor difference
}
```

DRY principle? Never heard of her.

### 4. **No Proper Error Boundaries** ⚠️

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}  // No error boundary!
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

Kalau ada error, whole app crash. No graceful degradation.

---

## 🟡 Yang Bikin Gue Geleng-Geleng (Medium Issues)

### 5. **API Routes Tanpa Rate Limiting**

```typescript
// app/api/cart/route.ts
export async function POST(request: NextRequest) {
  // No rate limiting
  // No request validation middleware
  // Langsung process
}
```

Bot bisa spam add-to-cart sampai database mati.

### 6. **Middleware Terlalu Simpel**

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const isProtectedRoute = pathname.startsWith("/d");
  // Only protects /d routes
  // No CSRF protection
  // No security headers
}
```

### 7. **Mixed Concerns di Hooks**

```typescript
// hooks/use-cart.ts
export const cartApi = {
  getCart: async () => {
    /* API call */
  },
  addItem: async () => {
    /* API call */
  },
  // ...
};

export function useCart() {
  /* React Query hook */
}
export function useAddToCart() {
  /* Mutation hook */
}
```

API functions dan hooks di file yang sama. Harusnya dipisah.

### 8. **No Proper Caching Strategy**

```typescript
// app/page.tsx
export const revalidate = 3600; // 1 hour

// Tapi di QueryProvider:
staleTime: 5 * 60 * 1000, // 5 minutes
```

Server-side cache 1 jam, client-side 5 menit. Inconsistent.

### 9. **Scripts Folder = Migration Graveyard** 💀

```
scripts/
├── add-variant-selections-to-cart-items.ts
├── add-village-column.ts
├── apply-migration.ts
├── apply-new-migration.ts
├── apply-session-id-migration.ts
├── apply-slug-migration.ts
├── fix-duplicate-slugs.ts
├── run-migration.ts
├── test-cart-constraint.ts
├── test-variant-cart.ts
├── verify-carts-schema.ts
├── verify-schema.ts
```

12 migration scripts yang kayaknya gak pernah di-cleanup. Technical debt accumulating.

---

## 🟢 Yang Bikin Gue Proud (Good Stuff)

### ✅ Proper Service Layer Architecture

```
lib/
├── services/
│   ├── address.service.ts
│   ├── auth.service.ts
│   ├── cart.service.ts
│   ├── email.service.ts
│   ├── order.service.ts
│   ├── product.service.ts
│   └── user.service.ts
```

Clean separation of concerns. API routes → Services → Database.

### ✅ Custom Error Handling

```typescript
// lib/errors/
├── custom-errors.ts
├── error-handler.ts
└── index.ts
```

Proper error classes dengan `formatErrorResponse()`. Nice!

### ✅ Type-Safe Database Schema

```typescript
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
```

Drizzle ORM dengan proper type inference. 👍

### ✅ Guest Cart → User Cart Migration

```typescript
async migrateGuestCart(sessionId: string, userId: string): Promise<void> {
  // Proper transaction handling
  // Merge logic for duplicate items
}
```

Well thought-out guest checkout flow.

### ✅ Proper Database Indexes

```typescript
(table) => ({
  productGroupIdIdx: index("pv_product_group_id_idx").on(table.productGroupId),
  cartProductIdx: index("ci_cart_product_idx").on(
    table.cartId,
    table.productId
  ),
});
```

Composite indexes untuk common queries. Good performance thinking.

---

## 📐 How It Should Be (Recommended Architecture)

### 1. **Restructure Components**

```
components/
├── features/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── index.ts
│   ├── cart/
│   │   ├── cart-drawer.tsx      # Move from root
│   │   ├── cart-item.tsx
│   │   ├── cart-item-skeleton.tsx
│   │   └── index.ts
│   ├── checkout/
│   ├── product/
│   │   ├── product-card.tsx     # Move from root
│   │   ├── product-gallery.tsx
│   │   ├── product-details.tsx
│   │   └── index.ts
│   └── landing/
│       ├── hero-section.tsx     # Move from root
│       ├── brand-section.tsx
│       └── index.ts
├── layout/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── main-navigation.tsx
│   └── app-sidebar.tsx
├── ui/                          # shadcn primitives only
└── shared/                      # Truly shared components
```

### 2. **Fix Database Schema**

```typescript
// Use JSONB instead of TEXT for JSON data
images: jsonb("images").$type<ImageObject[]>(),
additionalDescriptions: jsonb("additional_descriptions").$type<Description[]>(),

// Or better: normalize into separate tables
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productGroupId: uuid("product_group_id").references(() => productGroups.id),
  url: text("url").notNull(),
  isThumbnail: boolean("is_thumbnail").default(false),
  sortOrder: integer("sort_order").default(0),
});
```

### 3. **Separate API Layer**

```
lib/
├── api/
│   ├── cart.api.ts      # API call functions
│   ├── product.api.ts
│   └── auth.api.ts
├── hooks/
│   ├── use-cart.ts      # React Query hooks only
│   ├── use-products.ts
│   └── use-auth.ts
└── services/            # Keep as-is (server-side only)
```

### 4. **Add Proper Middleware**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await rateLimit(req);
  if (!rateLimitResult.success) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 2. Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 3. Auth check for protected routes
  if (isProtectedRoute(req.nextUrl.pathname)) {
    const token = req.cookies.get("token")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return response;
}
```

### 5. **Add Error Boundary**

```typescript
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 6. **Cleanup Scripts Folder**

```
scripts/
├── seed/
│   ├── products.ts
│   └── orders.ts
└── README.md            # Document what each script does
```

Move one-time migrations to `lib/db/migrations/` atau delete kalau sudah applied.

---

## 📈 Priority Action Items

| Priority | Issue                           | Effort            | Impact |
| -------- | ------------------------------- | ----------------- | ------ | ---- |
| 🔴 HIGH  | Add Error Boundaries            | Low               | High   |
| 🔴 HIGH  | Fix JSON string abuse           | Medium            | High   |
| 🟡 MED   | Extract cart validation hook    | Low               | Medium |
| 🟡 MED   | Add cart validation schema      | Low               | Medium |
| 🟡 MED   | Split product hooks (admin/pub) | Low               | Medium |
| � MED    |                                 | Add rate limiting | Low    | High |
| 🟢 LOW   | Restructure components folder   | Medium            | Low    |
| 🟢 LOW   | Cleanup scripts folder          | Low               | Low    |

---

## 🎯 Final Verdict

**Rating: 6.5/10**

### Pattern Compliance Summary

**Yang Udah Bener (Keep it up!):**

- ✅ **Auth Module (95%)** - Near perfect pattern implementation
- ✅ **Checkout Module (92%)** - Excellent formRef pattern untuk presentational forms
- ✅ **Shop Module (88%)** - Correct SSR approach (service langsung, skip API)
- ✅ **Address Module (85%)** - Good service layer, minor validation gap
- ✅ **Validation** - Zod schemas di file terpisah (auth, checkout, product)
- ✅ **Service Layer** - Clean separation, proper error handling
- ✅ **Hooks** - API + hooks dalam 1 file (maintainable untuk 1 orang)

**Yang Perlu Diperbaiki:**

- ⚠️ **Cart Module (70%)** - Fat container, extract validation ke hook
- ⚠️ **Product Hooks (65%)** - Mixed admin/public concerns, perlu split
- ⚠️ **Cart Validation** - Tidak ada Zod schema
- ⚠️ **Address Validation** - Inline di API, harusnya pakai schema

### Untuk 1-Person Maintainability

Pattern yang lu expect **sudah mostly implemented** di:

- Auth (95%) → Reference pattern
- Checkout (92%) → Reference pattern
- Shop (88%) → Good SSR pattern

Yang perlu di-align:

- Cart → Extract `useCartValidation()` hook
- Product → Split `use-admin-products.ts` vs `use-products.ts`
- Add missing Zod schemas untuk cart operations

**Bottom Line:** Arsitektur ini **maintainable untuk 1 orang** dengan minor fixes. Auth dan Checkout bisa jadi reference pattern untuk module lain. Focus on extracting cart validation logic dan adding missing Zod schemas.

---

_Generated by Kiro - December 7, 2025_
