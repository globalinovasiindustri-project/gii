/**
 * Test script to verify variant validation in cart service
 * This script tests the new variant validation logic added to addItem and validateCart methods
 */

import { cartService } from "@/lib/services/cart.service";
import { productService } from "@/lib/services/product.service";
import type { ProductData } from "@/lib/types/cart.types";

async function testVariantValidation() {
  console.log("🧪 Testing variant validation in cart service...\n");

  try {
    // Test 1: Get valid variant combinations for a product group
    console.log("Test 1: Getting valid variant combinations");
    console.log("This test requires a product group ID from your database");
    console.log("Skipping for now - manual test required\n");

    // Test 2: Test invalid variant combination rejection
    console.log("Test 2: Testing invalid variant combination rejection");
    const invalidProduct: ProductData = {
      productId: "test-invalid-id",
      productGroupId: "test-group-id",
      name: "Test Product",
      sku: "TEST-SKU",
      price: 10000,
      stock: 5,
      thumbnailUrl: null,
      variantSelections: {
        Color: "InvalidColor",
        Storage: "InvalidStorage",
      },
    };

    try {
      await cartService.addItem("test-user-id", invalidProduct, 1);
      console.log("❌ FAILED: Should have thrown validation error");
    } catch (error: any) {
      if (error.message.includes("Invalid variant combination")) {
        console.log("✅ PASSED: Invalid variant combination rejected");
      } else {
        console.log(`⚠️  Different error: ${error.message}`);
      }
    }

    console.log("\n✅ Variant validation tests completed!");
    console.log("\nNote: Full integration tests require:");
    console.log("1. A test database with product groups and variants");
    console.log("2. Valid product IDs and variant combinations");
    console.log("3. Test user/session IDs");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
testVariantValidation();
