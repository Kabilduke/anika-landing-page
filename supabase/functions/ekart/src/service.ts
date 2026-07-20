import { SupabaseClient } from "@supabase/supabase-js";
import { EkartClient, PincodeCheckResult, TrackingResult } from "./client.ts";
import { Order, Address, ShipmentDetails } from "../../_shared/types.ts";

export class EkartService {
  private client: EkartClient;
  private supabaseAdmin: SupabaseClient;

  constructor(supabaseAdmin: SupabaseClient) {
    this.client = new EkartClient();
    this.supabaseAdmin = supabaseAdmin;
  }

  async checkServiceability(pincode: string): Promise<PincodeCheckResult> {
    return await this.client.checkServiceability(pincode);
  }

  async bookShipment(
    orderId: string,
    userId: string,
    isAdmin: boolean,
    addressId?: string
  ): Promise<{ success: boolean; order?: Order; error?: string; status?: number }> {
    // 1. Fetch order details using admin client
    const { data: rawOrder, error: orderError } = await this.supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    const order = rawOrder as unknown as Order | null;

    if (orderError || !order) {
      return { success: false, error: `Order not found: ${orderError?.message || "Unknown error"}`, status: 404 };
    }

    // Security check: ensure order belongs to the user OR user is an admin
    if (order.user_id !== userId && !isAdmin) {
      return { success: false, error: "Forbidden: Order does not belong to user", status: 403 };
    }

    // 2. Fetch shipping address details
    let address: Address | null = null;
    if (addressId) {
      const { data: rawAddr, error: addrError } = await this.supabaseAdmin
        .from("addresses")
        .select("*")
        .eq("address_id", addressId)
        .single();
      if (!addrError && rawAddr) {
        address = rawAddr as unknown as Address;
      }
    }

    // Fallback: fetch user default address
    if (!address) {
      const { data: rawAddresses } = await this.supabaseAdmin
        .from("addresses")
        .select("*")
        .eq("user_id", order.user_id);
      const addresses = rawAddresses as unknown as Address[] | null;
      address = addresses?.find((a) => a.is_default) || addresses?.[0] || null;
    }

    if (!address) {
      return { success: false, error: "No shipping address found for this order", status: 400 };
    }

    // 3. Compile shipment details
    const shipmentDetails: ShipmentDetails = {
      orderId: order.id,
      customerName: address.full_name,
      customerPhone: address.phone_number,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || "",
      pincode: address.postal_code,
      city: address.city,
      state: address.state,
      paymentMethod: order.payment,
      amount: Number(order.total_price),
      quantity: order.quantity,
    };

    // 4. Book with Ekart API
    const bookingResult = await this.client.bookShipment(shipmentDetails);

    if (!bookingResult.success) {
      // Update order delivery status to booking failed
      await this.supabaseAdmin
        .from("orders")
        .update({
          delivery_status: "Booking Failed",
        } as unknown as never)
        .eq("id", order.id);

      return { success: false, error: `Ekart booking failure: ${bookingResult.error || "Unknown API error"}`, status: 500 };
    }

    // 5. Update order record in database with delivery details
    const { data: rawUpdatedOrder, error: updateError } = await this.supabaseAdmin
      .from("orders")
      .update({
        delivery_provider: "Ekart",
        waybill: bookingResult.waybill,
        shipment_id: bookingResult.shipmentId,
        delivery_status: "Booked",
        estimated_delivery_date: bookingResult.estimatedDeliveryDate,
      } as unknown as never)
      .eq("id", order.id)
      .select()
      .single();
    const updatedOrder = rawUpdatedOrder as unknown as Order | null;

    if (updateError || !updatedOrder) {
      return { success: false, error: `Failed to update order tracking details: ${updateError?.message || "Unknown error"}`, status: 500 };
    }

    return { success: true, order: updatedOrder };
  }

  async trackShipment(waybill: string): Promise<TrackingResult> {
    return await this.client.trackShipment(waybill);
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    // 1. Fetch order details using admin client
    const { data: rawOrder, error: orderError } = await this.supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    const order = rawOrder as unknown as Order | null;

    if (orderError || !order) {
      return { success: false, error: `Order not found: ${orderError?.message || "Unknown error"}`, status: 404 };
    }

    // Security check: ensure order belongs to the user OR user is an admin
    if (order.user_id !== userId && !isAdmin) {
      return { success: false, error: "Forbidden: Order does not belong to user", status: 403 };
    }

    // 2. Validate current order status - cannot cancel if already Shipped or Delivered
    const currentStatus = order.status?.toLowerCase();
    if (currentStatus === "shipped" || currentStatus === "delivered" || currentStatus === "cancelled" || currentStatus === "returned") {
      return { success: false, error: `Order cannot be cancelled in its current state: ${order.status}`, status: 400 };
    }

    // 3. Cancel with Ekart if waybill/shipment_id is present
    if (order.waybill) {
      try {
        await this.client.cancelShipment(order.waybill);
      } catch (err) {
        console.error("Failed to cancel shipment on Ekart, proceeding with database update anyway:", err);
      }
    }

    // 4. Update order status in DB to Cancelled
    const { error: updateError } = await this.supabaseAdmin
      .from("orders")
      .update({
        status: "Cancelled",
        delivery_status: "Cancelled",
      } as unknown as never)
      .eq("id", order.id);

    if (updateError) {
      return { success: false, error: `Failed to update order status: ${updateError.message}`, status: 500 };
    }

    return { success: true };
  }
}

