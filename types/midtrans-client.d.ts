declare module "midtrans-client" {
  export interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface CustomerDetails {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  }

  export interface ItemDetail {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }

  export interface CreditCardOptions {
    secure: boolean;
  }

  export interface SnapParameter {
    transaction_details: TransactionDetails;
    customer_details: CustomerDetails;
    item_details: ItemDetail[];
    credit_card?: CreditCardOptions;
  }

  export interface SnapResponse {
    token: string;
    redirect_url: string;
  }

  export interface TransactionStatus {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: SnapParameter): Promise<SnapResponse>;
    transaction: {
      status(orderId: string): Promise<TransactionStatus>;
    };
  }

  export class CoreApi {
    constructor(config: SnapConfig);
  }

  export class Iris {
    constructor(config: SnapConfig);
  }
}
