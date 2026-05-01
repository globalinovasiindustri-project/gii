# AnimatedButton Component

A reusable animated button component with smooth hover effects and morphing background animation.

## Features

- 🎨 Smooth morphing background animation on hover
- ⚡ Optimized with Framer Motion
- 🔗 Supports `asChild` pattern for Link components
- ♿ Accessible with focus states
- 📱 Touch-friendly with tap animation

## Usage

### Basic Button

```tsx
import { AnimatedButton } from "@/components/ui/animated-button";

<AnimatedButton onClick={() => console.log("clicked")}>
  <span className="text-[15px] font-medium">Click Me</span>
</AnimatedButton>;
```

### With Link (asChild pattern)

```tsx
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";

<AnimatedButton asChild>
  <Link href="/checkout">
    <span className="text-[15px] font-medium">Go to Checkout</span>
  </Link>
</AnimatedButton>;
```

### With Icon

```tsx
import { AnimatedButton } from "@/components/ui/animated-button";
import { ShoppingCart } from "lucide-react";

<AnimatedButton>
  <ShoppingCart className="h-5 w-5" />
  <span className="text-[15px] font-medium">Add to Cart</span>
</AnimatedButton>;
```

### Disabled State

```tsx
<AnimatedButton disabled className="opacity-50 cursor-not-allowed">
  <span className="text-[15px] font-medium">Disabled</span>
</AnimatedButton>
```

### Custom Styling

```tsx
<AnimatedButton className="w-full px-12 py-4">
  <span className="text-[16px] font-semibold">Custom Size</span>
</AnimatedButton>
```

## Props

| Prop        | Type                                      | Default | Description                                         |
| ----------- | ----------------------------------------- | ------- | --------------------------------------------------- |
| `children`  | `React.ReactNode`                         | -       | Button content                                      |
| `className` | `string`                                  | `""`    | Additional CSS classes                              |
| `asChild`   | `boolean`                                 | `false` | Render as wrapper div (for Link components)         |
| `...props`  | `React.ButtonHTMLAttributes<HTMLElement>` | -       | All standard button props (onClick, disabled, etc.) |

## Animation Details

- **Hover Enter**: Background morphs from bottom with rounded top edges
- **Hover Exit**: Background morphs to top with rounded bottom edges
- **Text Color**: Transitions from white to dark on hover
- **Tap**: Slight scale down effect (0.98)

## Accessibility

- Supports keyboard navigation (focus/blur states)
- Maintains semantic button element (unless `asChild` is used)
- Respects disabled state

## Examples in Project

See implementation in:

- `components/cart/order-summary.tsx` - Checkout button
