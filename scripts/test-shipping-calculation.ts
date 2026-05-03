/**
 * Test script for shipping calculation
 * Tests RajaOngkir integration with real-world scenarios
 *
 * Usage: npx tsx scripts/test-shipping-calculation.ts
 */

import { config } from "dotenv";
import { shippingService } from "@/lib/services/shipping.service";

// Load environment variables
config();

// Test cases
const testCases = [
  {
    name: "Tangerang → Jakarta (Short distance)",
    destinationRegencyCode: "3171", // Jakarta Selatan
    weightInGrams: 1000, // 1kg
    expectedBehavior: "Should be relatively cheap (< 50k)",
  },
  {
    name: "Tangerang → Surabaya (Medium distance)",
    destinationRegencyCode: "3578", // Surabaya
    weightInGrams: 1000, // 1kg
    expectedBehavior: "Should be moderate (50k-100k)",
  },
  {
    name: "Tangerang → Papua (Very long distance)",
    destinationRegencyCode: "9401", // Merauke, Papua
    weightInGrams: 1000, // 1kg
    expectedBehavior: "Should be expensive (> 100k)",
  },
  {
    name: "Heavy package to Papua",
    destinationRegencyCode: "9401", // Merauke, Papua
    weightInGrams: 5000, // 5kg
    expectedBehavior: "Should be very expensive (> 500k)",
  },
];

async function runTests() {
  console.log("🚀 Testing Shipping Calculation\n");
  console.log("=".repeat(80));

  // Check environment variables
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const originDistrictId = process.env.RAJAONGKIR_ORIGIN_DISTRICT_ID;
  const baseUrl = process.env.RAJAONGKIR_BASE_URL;

  console.log("\n📋 Configuration:");
  console.log(`API Key: ${apiKey ? "✅ Set" : "❌ Not set"}`);
  console.log(
    `Origin District ID: ${originDistrictId || "❌ Not set (using fallback)"}`,
  );
  console.log(`Base URL: ${baseUrl || "❌ Not set (using fallback)"}`);

  if (!apiKey || !originDistrictId) {
    console.log(
      "\n⚠️  RajaOngkir not configured - will use fallback flat rates",
    );
    console.log("To test real API, set these environment variables:");
    console.log("  - RAJAONGKIR_API_KEY");
    console.log("  - RAJAONGKIR_ORIGIN_DISTRICT_ID");
    console.log("  - RAJAONGKIR_BASE_URL");
  }

  console.log("\n" + "=".repeat(80));

  // Run test cases
  for (const testCase of testCases) {
    console.log(`\n\n📦 Test: ${testCase.name}`);
    console.log(`Destination Code: ${testCase.destinationRegencyCode}`);
    console.log(
      `Weight: ${testCase.weightInGrams}g (${testCase.weightInGrams / 1000}kg)`,
    );
    console.log(`Expected: ${testCase.expectedBehavior}`);
    console.log("-".repeat(80));

    try {
      const startTime = Date.now();
      const options = await shippingService.getShippingOptions(
        testCase.destinationRegencyCode,
        testCase.weightInGrams,
      );
      const duration = Date.now() - startTime;

      if (options.length === 0) {
        console.log("❌ No shipping options returned");
        continue;
      }

      console.log(
        `✅ Got ${options.length} shipping options (${duration}ms)\n`,
      );

      // Display results in table format
      console.log(
        "Courier".padEnd(20) + "Service".padEnd(30) + "Cost".padEnd(15) + "ETD",
      );
      console.log("-".repeat(80));

      for (const option of options) {
        const courierService = `${option.courierName} ${option.serviceCode}`;
        const cost = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(option.cost);

        console.log(
          courierService.padEnd(20) +
            option.serviceName.padEnd(30) +
            cost.padEnd(15) +
            option.etd,
        );
      }

      // Find cheapest and most expensive
      const cheapest = options.reduce((min, opt) =>
        opt.cost < min.cost ? opt : min,
      );
      const mostExpensive = options.reduce((max, opt) =>
        opt.cost > max.cost ? opt : max,
      );

      console.log("\n💰 Price Range:");
      console.log(
        `   Cheapest: ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(
          cheapest.cost,
        )} (${cheapest.courierName} ${cheapest.serviceCode})`,
      );
      console.log(
        `   Most Expensive: ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(
          mostExpensive.cost,
        )} (${mostExpensive.courierName} ${mostExpensive.serviceCode})`,
      );
    } catch (error) {
      console.log(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log("\n\n" + "=".repeat(80));
  console.log("✅ Test completed");
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
