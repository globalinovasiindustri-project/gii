import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// Helper to escape CSV values
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to format currency (from smallest unit to display)
function formatCurrency(value: number): string {
  return (value / 1).toLocaleString("id-ID");
}

// Helper to format date
function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper to parse shipping address JSON
function parseShippingAddress(addressJson: string): string {
  try {
    const addr = JSON.parse(addressJson);
    return [
      addr.fullAddress,
      addr.village,
      addr.district,
      addr.city,
      addr.province,
      addr.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  } catch {
    return addressJson;
  }
}

export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);

    // Check admin permission
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      orderStatus: searchParams.get("orderStatus") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
    };

    const orders = await orderService.getOrdersForExport(filters);

    // CSV headers
    const headers = [
      "No. Order",
      "Tanggal",
      "Nama Pelanggan",
      "Email",
      "Alamat Pengiriman",
      "Produk",
      "SKU",
      "Qty",
      "Harga Satuan",
      "Subtotal Item",
      "Subtotal Order",
      "Ongkir",
      "Total",
      "Status Order",
      "Status Pembayaran",
      "Kurir",
      "No. Resi",
      "Catatan Pelanggan",
      "Catatan Admin",
    ];

    // Build CSV rows
    const rows = orders.map((row) => [
      escapeCSV(row.orderNumber),
      escapeCSV(formatDate(row.createdAt)),
      escapeCSV(row.customerName),
      escapeCSV(row.customerEmail),
      escapeCSV(parseShippingAddress(row.shippingAddress)),
      escapeCSV(row.productName),
      escapeCSV(row.productSku),
      escapeCSV(row.quantity),
      escapeCSV(formatCurrency(row.unitPrice ?? 0)),
      escapeCSV(formatCurrency(row.itemSubtotal ?? 0)),
      escapeCSV(formatCurrency(row.subtotal)),
      escapeCSV(formatCurrency(row.shippingCost)),
      escapeCSV(formatCurrency(row.total)),
      escapeCSV(row.orderStatus),
      escapeCSV(row.paymentStatus),
      escapeCSV(row.carrier),
      escapeCSV(row.trackingNumber),
      escapeCSV(row.customerNotes),
      escapeCSV(row.adminNotes),
    ]);

    // Combine headers and rows
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `orders-export-${date}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
