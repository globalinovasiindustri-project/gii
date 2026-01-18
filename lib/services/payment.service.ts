import midtransClient from "midtrans-client";
import { ValidationError } from "../errors";

export interface CreateSnapTokenInput {
  orderId: string;
  orderNumber: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface SnapTokenResponse {
  token: string;
  redirectUrl: string;
  midtransOrderId: string;
}

/**
 * Payment service for Midtrans Snap integration
 */
export const paymentService = {
  /**
   * Create Snap payment token for checkout
   * Generates unique Midtrans order ID with timestamp to support payment retries
   */
  async createSnapToken(
    input: CreateSnapTokenInput
  ): Promise<SnapTokenResponse> {
    try {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

      // Initialize Snap client
      const snap = new midtransClient.Snap({
        isProduction: false, // Always use sandbox
        serverKey,
      });

      // Generate unique Midtrans order ID with timestamp
      // This allows multiple payment attempts for the same order
      const midtransOrderId = `${input.orderNumber}-${Date.now()}`;

      // Get finish redirect URL from environment
      const finishUrl = `${process.env.NEXT_PUBLIC_APP_URL}/user/orders`;

      // Prepare transaction parameters
      const parameter = {
        transaction_details: {
          order_id: midtransOrderId, // Use timestamped order ID for Midtrans
          gross_amount: input.grossAmount,
        },
        customer_details: {
          first_name: input.customerDetails.firstName,
          last_name: input.customerDetails.lastName || "",
          email: input.customerDetails.email,
          phone: input.customerDetails.phone,
        },
        item_details: input.itemDetails,
        credit_card: {
          secure: true,
        },
        callbacks: {
          finish: finishUrl,
        },
      };

      // Create transaction and get token
      const transaction = await snap.createTransaction(parameter);

      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        midtransOrderId, // Return for storage in database
      };
    } catch (error) {
      console.error("Midtrans Snap token creation error:", error);
      throw new ValidationError(
        "Gagal membuat token pembayaran. Silakan coba lagi."
      );
    }
  },

  /**
   * Verify transaction status from Midtrans
   */
  async getTransactionStatus(orderNumber: string) {
    try {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

      const snap = new midtransClient.Snap({
        isProduction: false, // Always use sandbox
        serverKey,
      });

      const status = await snap.transaction.status(orderNumber);
      return status;
    } catch (error) {
      console.error("Midtrans transaction status error:", error);
      throw new ValidationError("Gagal memeriksa status pembayaran");
    }
  },
};
