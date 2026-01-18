import { db } from "../lib/db/db";
import {
  users,
  orders,
  orderItems,
  products,
  orderStatusOptions,
  paymentStatusOptions,
} from "../lib/db/schema";
import { eq } from "drizzle-orm";

// Helper to generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Helper to get or create a test user
async function ensureTestUser() {
  const email = "customer@example.com";
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) return existing[0];

  const [created] = await db
    .insert(users)
    .values({
      name: "Test Customer",
      email,
      role: "user",
      isConfirmed: true,
      isActive: true,
    })
    .returning();
  return created;
}

// Helper to get existing products
async function getProducts() {
  return await db.select().from(products).limit(10);
}

async function main() {
  // Ensure we have a test user
  const user = await ensureTestUser();
  console.log(`Using user: ${user.email}`);

  // Get available products
  const availableProducts = await getProducts();
  if (availableProducts.length === 0) {
    console.error("No products found. Please run 'pnpm seed:products' first.");
    process.exit(1);
  }

  console.log(`Found ${availableProducts.length} products to use in orders`);

  // Sample addresses
  const shippingAddress = {
    recipientName: "John Doe",
    phoneNumber: "+62812345678",
    streetAddress: "Jl. Sudirman No. 123",
    addressLine2: "Apt 4B",
    city: "Jakarta",
    state: "DKI Jakarta",
    postalCode: "12190",
    country: "ID",
  };

  const billingAddress = {
    recipientName: "John Doe",
    phoneNumber: "+62812345678",
    streetAddress: "Jl. Sudirman No. 123",
    addressLine2: "Apt 4B",
    city: "Jakarta",
    state: "DKI Jakarta",
    postalCode: "12190",
    country: "ID",
  };

  // Create Order 1: Completed order
  const order1Number = generateOrderNumber();
  const order1Products = availableProducts.slice(0, 2);
  const order1Subtotal = order1Products.reduce(
    (sum, p) => sum + p.price * 1,
    0
  );
  const order1Tax = Math.floor(order1Subtotal * 0.11); // 11% tax
  const order1Shipping = 50000; // 50k IDR shipping
  const order1Total = order1Subtotal + order1Tax + order1Shipping;

  const [order1] = await db
    .insert(orders)
    .values({
      orderNumber: order1Number,
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      subtotal: order1Subtotal,
      tax: order1Tax,
      shippingCost: order1Shipping,
      discount: 0,
      total: order1Total,
      currency: "IDR",
      orderStatus: orderStatusOptions.DELIVERED,
      paymentStatus: paymentStatusOptions.PAID,
      paymentMethod: "stripe",
      paymentIntentId: "pi_" + Math.random().toString(36).substring(7),
      trackingNumber:
        "TRK" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      carrier: "JNE",
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    })
    .returning();

  // Add order items for order 1
  for (const product of order1Products) {
    const quantity = 1;
    await db.insert(orderItems).values({
      orderId: order1.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  console.log(`Pesanan dibuat: ${order1Number} (Selesai)`);

  // Create Order 2: Shipped order
  const order2Number = generateOrderNumber();
  const order2Products = availableProducts.slice(2, 4);
  const order2Subtotal = order2Products.reduce(
    (sum, p) => sum + p.price * 2,
    0
  );
  const order2Tax = Math.floor(order2Subtotal * 0.11);
  const order2Shipping = 75000;
  const order2Total = order2Subtotal + order2Tax + order2Shipping;

  const [order2] = await db
    .insert(orders)
    .values({
      orderNumber: order2Number,
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      subtotal: order2Subtotal,
      tax: order2Tax,
      shippingCost: order2Shipping,
      discount: 0,
      total: order2Total,
      currency: "IDR",
      orderStatus: orderStatusOptions.SHIPPED,
      paymentStatus: paymentStatusOptions.PAID,
      paymentMethod: "stripe",
      paymentIntentId: "pi_" + Math.random().toString(36).substring(7),
      trackingNumber:
        "TRK" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      carrier: "JNE",
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    })
    .returning();

  for (const product of order2Products) {
    const quantity = 2;
    await db.insert(orderItems).values({
      orderId: order2.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  console.log(`Pesanan dibuat: ${order2Number} (Dikirim)`);

  // Create Order 3: Processing order with discount
  const order3Number = generateOrderNumber();
  const order3Products = availableProducts.slice(0, 3);
  const order3Subtotal = order3Products.reduce(
    (sum, p) => sum + p.price * 1,
    0
  );
  const order3Discount = 500000; // 500k discount
  const order3Tax = Math.floor((order3Subtotal - order3Discount) * 0.11);
  const order3Shipping = 60000;
  const order3Total =
    order3Subtotal - order3Discount + order3Tax + order3Shipping;

  const [order3] = await db
    .insert(orders)
    .values({
      orderNumber: order3Number,
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      subtotal: order3Subtotal,
      tax: order3Tax,
      shippingCost: order3Shipping,
      discount: order3Discount,
      total: order3Total,
      currency: "IDR",
      orderStatus: orderStatusOptions.PROCESSING,
      paymentStatus: paymentStatusOptions.PAID,
      paymentMethod: "stripe",
      paymentIntentId: "pi_" + Math.random().toString(36).substring(7),
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      customerNotes: "Please deliver between 9 AM - 5 PM",
    })
    .returning();

  for (const product of order3Products) {
    const quantity = 1;
    await db.insert(orderItems).values({
      orderId: order3.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  console.log(`Pesanan dibuat: ${order3Number} (Diproses dengan diskon)`);

  // Create Order 4: Pending payment
  const order4Number = generateOrderNumber();
  const order4Products = [availableProducts[0]];
  const order4Subtotal = order4Products.reduce(
    (sum, p) => sum + p.price * 1,
    0
  );
  const order4Tax = Math.floor(order4Subtotal * 0.11);
  const order4Shipping = 45000;
  const order4Total = order4Subtotal + order4Tax + order4Shipping;

  const [order4] = await db
    .insert(orders)
    .values({
      orderNumber: order4Number,
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      subtotal: order4Subtotal,
      tax: order4Tax,
      shippingCost: order4Shipping,
      discount: 0,
      total: order4Total,
      currency: "IDR",
      orderStatus: orderStatusOptions.PROCESSING,
      paymentStatus: paymentStatusOptions.UNPAID,
      paymentMethod: "stripe",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    })
    .returning();

  for (const product of order4Products) {
    const quantity = 1;
    await db.insert(orderItems).values({
      orderId: order4.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  console.log(`Pesanan dibuat: ${order4Number} (Belum dibayar)`);

  // Create Order 5: Cancelled order
  const order5Number = generateOrderNumber();
  const order5Products = availableProducts.slice(1, 2);
  const order5Subtotal = order5Products.reduce(
    (sum, p) => sum + p.price * 3,
    0
  );
  const order5Tax = Math.floor(order5Subtotal * 0.11);
  const order5Shipping = 55000;
  const order5Total = order5Subtotal + order5Tax + order5Shipping;

  const [order5] = await db
    .insert(orders)
    .values({
      orderNumber: order5Number,
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      subtotal: order5Subtotal,
      tax: order5Tax,
      shippingCost: order5Shipping,
      discount: 0,
      total: order5Total,
      currency: "IDR",
      orderStatus: orderStatusOptions.CANCELLED,
      paymentStatus: paymentStatusOptions.FAILED,
      paymentMethod: "stripe",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      adminNotes: "Customer requested cancellation",
    })
    .returning();

  for (const product of order5Products) {
    const quantity = 3;
    await db.insert(orderItems).values({
      orderId: order5.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  console.log(`Pesanan dibuat: ${order5Number} (Dibatalkan)`);

  console.log(
    "\n✅ Seed selesai: 5 pesanan dengan berbagai status telah dibuat"
  );
  console.log(
    "Status pesanan: Selesai, Dikirim, Diproses, Belum Dibayar, Dibatalkan"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding orders:", err);
    process.exit(1);
  });
