import { SupabaseClient } from "@supabase/supabase-js";
import { RazorpayClient } from "./client.ts";
import { EkartService } from "../../ekart/src/service.ts";
import { Product, Order } from "../../_shared/types.ts";

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  productName: string;
}

export interface VerifyPaymentInput {
  userId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  items: Array<{
    productId: string;
    quantity?: number;
    size?: string | null;
    color?: string | null;
  }>;
  addressId?: string;
}

export class RazorpayService {
  private client: RazorpayClient;
  private supabaseAdmin: SupabaseClient;
  private ekartService: EkartService;

  constructor(supabaseAdmin: SupabaseClient) {
    this.client = new RazorpayClient();
    this.supabaseAdmin = supabaseAdmin;
    this.ekartService = new EkartService(supabaseAdmin);
  }

  async createOrder(
    items: Array<{ productId: string; quantity?: number }>
  ): Promise<CreateOrderResult> {
    // 1. Query product details from database for all items
    const productIds = items.map(item => item.productId);
    const { data: rawProducts, error: dbError } = await this.supabaseAdmin
      .from("products")
      .select("product_id, name, price")
      .in("product_id", productIds);
    const products = rawProducts as unknown as Product[] | null;

    if (dbError || !products || products.length === 0) {
      throw new Error(`Products not found or database query failed: ${dbError?.message || "Unknown error"}`);
    }

    // 2. Calculate amount in paise (including flat 800 charge for GST/Taxes/Platform Fee)
    let subtotal = 0;
    for (const item of items) {
      const product = products.find(p => p.product_id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      subtotal += Number(product.price) * Number(item.quantity || 1);
    }
    const grandTotal = subtotal + 800; // subtotal + taxes + gst + platformFee
    const amountInPaise = Math.round(grandTotal * 100);

    // 3. Create order on Razorpay
    const receiptId = `receipt_order_${Date.now()}`;
    const rzOrder = await this.client.createOrder(amountInPaise, receiptId);

    const mainItem = items[0];
    const mainProduct = products.find(p => p.product_id === mainItem.productId);
    const productName = items.length > 1
      ? `${mainProduct?.name} + ${items.length - 1} other(s)`
      : mainProduct?.name || "Anika Order";

    return {
      orderId: rzOrder.id,
      amount: amountInPaise,
      currency: "INR",
      productName,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<Order> {
    // 1. Verify Razorpay HMAC signature
    const isSignatureValid = this.client.verifySignature(
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature
    );

    if (!isSignatureValid) {
      throw new Error("Invalid signature verification failed");
    }

    // 2. Fetch authentic product details to record final order amount
    const productIds = input.items.map(item => item.productId);
    const { data: rawProducts, error: dbError } = await this.supabaseAdmin
      .from("products")
      .select("product_id, name, price, image_url, images")
      .in("product_id", productIds);
    const products = rawProducts as unknown as Product[] | null;

    if (dbError || !products || products.length === 0) {
      throw new Error(`Products not found or database query failed: ${dbError?.message || "Unknown error"}`);
    }

    let subtotal = 0;
    for (const item of input.items) {
      const product = products.find(p => p.product_id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      subtotal += Number(product.price) * Number(item.quantity || 1);
    }
    const grandTotal = subtotal + 800; // subtotal + taxes + gst + platformFee
    const mainItem = input.items[0];
    const mainProduct = products.find(p => p.product_id === mainItem.productId);
    const itemName = input.items.length > 1
      ? `${mainProduct?.name} + ${input.items.length - 1} other(s)`
      : mainProduct?.name || "Anika Order";

    // 3. Insert order record using admin client (bypasses RLS limits if any)
    const { data: rawOrder, error: insertError } = await this.supabaseAdmin
      .from("orders")
      .insert({
        user_id: input.userId,
        item_name: itemName,
        quantity: input.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
        total_price: grandTotal,
        payment: "Razorpay",
        type: "Regular",
        status: "Paid",
        razorpay_order_id: input.razorpay_order_id,
        razorpay_payment_id: input.razorpay_payment_id,
        razorpay_signature: input.razorpay_signature,
      } as unknown as never)
      .select()
      .single();
    const order = rawOrder as unknown as Order | null;

    if (insertError || !order) {
      throw new Error(`Failed to insert order: ${insertError?.message || "Unknown error"}`);
    }

    // 4. Insert child order items for each item in order
    const orderItemsToInsert = input.items.map(item => {
      const p = products.find(prod => prod.product_id === item.productId);
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: p?.name || "Unknown Product",
        quantity: Number(item.quantity || 1),
        price: Number(p?.price || 0),
        size: item.size || null,
        color: item.color || null,
        image_url: p?.image_url || (p?.images && p.images[0]) || null,
      };
    });

    const { error: itemsInsertError } = await this.supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert as unknown as never[]);

    if (itemsInsertError) {
      throw new Error(`Failed to insert order items: ${itemsInsertError.message}`);
    }

    // 5. Trigger automated shipment booking via Ekart
    let finalOrder = { ...order };
    const bookingResult = await this.ekartService.bookShipment(
      order.id,
      input.userId,
      true, // Bypass ownership check as this is system-level fulfillment
      input.addressId
    );

    if (bookingResult.success && bookingResult.order) {
      finalOrder = bookingResult.order;
    } else {
      console.error("Ekart automated shipment booking failed during payment verification:", bookingResult.error);
    }

    return finalOrder;
  }
}
