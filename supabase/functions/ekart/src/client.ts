import "@supabase/functions-js/edge-runtime.d.ts";
import { ShipmentDetails } from "../../_shared/types.ts";

export interface PincodeCheckResult {
  serviceable: boolean;
  estimatedDeliveryDays?: number;
  codSupported?: boolean;
}

export interface BookingResult {
  success: boolean;
  waybill: string;
  shipmentId: string;
  estimatedDeliveryDate: string;
  error?: string;
}

export interface TrackingResult {
  waybill: string;
  status: string;
  statusDetails: string;
  updatedAt: string;
}

export class EkartClient {
  private baseUrl: string;
  private clientId: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.baseUrl = Deno.env.get("EKART_BASE_URL") || "https://app.elite.ekartlogistics.in";
    this.clientId = Deno.env.get("EKART_CLIENT_ID") || "";
  }

  private isSandbox(): boolean {
    return Deno.env.get("EKART_SANDBOX") === "true";
  }

  private async getAccessToken(): Promise<string> {
    if (this.isSandbox()) {
      return "mock-sandbox-token";
    }
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry && (this.tokenExpiry - now > 5 * 60 * 1000)) {
      return this.cachedToken;
    }

    try {
      const url = `${this.baseUrl}/integrations/v2/auth/token/${this.clientId}`;
      const username = Deno.env.get("EKART_USERNAME") || this.clientId;
      const password = Deno.env.get("EKART_PASSWORD") || "";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Token exchange failed with status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error("No access_token returned from token exchange");
      }

      this.cachedToken = data.access_token;
      const expiresSec = data.expires_in || 86400;
      this.tokenExpiry = now + (expiresSec * 1000);
      return data.access_token;
    } catch (err) {
      console.error("Failed to fetch Ekart access token:", err);
      throw err;
    }
  }

  private async getHeadersAsync(): Promise<HeadersInit> {
    const token = await this.getAccessToken();
    return {
      "Content-Type": "application/json",
      "HTTP_X_MERCHANT_CODE": this.clientId,
      "Authorization": `Bearer ${token}`,
    };
  }

  /**
   * Check if a pincode is serviceable by Ekart (GET /api/v2/serviceability/{pincode}).
   */
  async checkServiceability(pincode: string): Promise<PincodeCheckResult> {
    if (!pincode || pincode.length !== 6) {
      return { serviceable: false };
    }

    if (this.isSandbox()) {
      return {
        serviceable: !pincode.startsWith("999"),
        estimatedDeliveryDays: 3,
        codSupported: true,
      };
    }

    try {
      const url = `${this.baseUrl}/api/v2/serviceability/${pincode}`;
      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeadersAsync(),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ekart Serviceability V2 API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return {
        serviceable: data.status ?? false,
        estimatedDeliveryDays: 3,
        codSupported: data.details?.cod ?? true,
      };
    } catch (err) {
      console.error("Ekart serviceability fetch error:", err);
      throw err;
    }
  }

  /**
   * Book a shipment for an order (PUT /api/v1/package/create).
   */
  async bookShipment(details: ShipmentDetails): Promise<BookingResult> {
    if (this.isSandbox()) {
      return {
        success: true,
        waybill: `MOCK-${details.orderId}`,
        shipmentId: `SHP-${details.orderId}`,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const url = `${this.baseUrl}/api/v1/package/create`;
      
      const sellerName = Deno.env.get("SELLER_NAME") || "Anika Fashion";
      const sellerAddress = Deno.env.get("SELLER_ADDRESS") || "121A, Kottar-Parvathipuram Rd, Chetti Kulam, Simon Nagar, Nagercoil, Tamil Nadu - 629001";
      const sellerGst = Deno.env.get("SELLER_GST_TIN") || "33EFQPK1710A1ZZ";
      const sellerPhone = Number(Deno.env.get("SELLER_PHONE") || "9363631636");
      const sellerPin = Number(Deno.env.get("SELLER_PIN") || "629001");

      const totalAmount = details.amount;
      const taxValue = 800; // Flat tax/fee
      const taxableAmount = Math.max(0, totalAmount - taxValue);
      const codAmount = details.paymentMethod === "COD" ? totalAmount : 0;

      // Clean & format primary phone (consignee phone)
      let primaryPhone = details.customerPhone.replace(/\D/g, "");
      if (primaryPhone.length > 10) {
        primaryPhone = primaryPhone.slice(-10);
      }
      while (primaryPhone.length < 10) {
        primaryPhone = primaryPhone + "0";
      }

      // Clean & format alternate phone (cannot be the same as primary phone)
      let alternatePhone = (Deno.env.get("SELLER_PHONE") || "9363631636").replace(/\D/g, "");
      if (alternatePhone.length > 10) {
        alternatePhone = alternatePhone.slice(-10);
      }
      while (alternatePhone.length < 10) {
        alternatePhone = alternatePhone + "0";
      }

      if (alternatePhone === primaryPhone) {
        const lastDigit = primaryPhone.slice(-1);
        const newLastDigit = lastDigit === "9" ? "0" : String(Number(lastDigit) + 1);
        alternatePhone = primaryPhone.slice(0, -1) + newLastDigit;
      }

      const payload = {
        tax_value: taxValue,
        seller_name: sellerName,
        seller_address: sellerAddress,
        seller_gst_tin: sellerGst,
        consignee_gst_amount: 0,
        order_number: details.orderId,
        invoice_number: `INV-${details.orderId}`,
        invoice_date: new Date().toISOString().split("T")[0],
        consignee_name: details.customerName,
        consignee_alternate_phone: alternatePhone,
        payment_mode: details.paymentMethod === "COD" ? "COD" : "Prepaid",
        category_of_goods: "Jewelry",
        products_desc: "Jewelry Accessories",
        total_amount: totalAmount,
        cod_amount: codAmount,
        taxable_amount: taxableAmount,
        commodity_value: String(taxableAmount),
        quantity: details.quantity,
        weight: 500, // grams
        length: 10,  // cm
        width: 10,   // cm
        height: 10,  // cm
        drop_location: {
          name: details.customerName,
          phone: Number(primaryPhone),
          address: details.addressLine1 + (details.addressLine2 ? `, ${details.addressLine2}` : ""),
          pin: Number(details.pincode.replace(/\D/g, "")),
          country: "India",
        },
        pickup_location: {
          name: sellerName,
          phone: sellerPhone,
          address: sellerAddress,
          pin: sellerPin,
          country: "India",
        },
        return_location: {
          name: sellerName,
          phone: sellerPhone,
          address: sellerAddress,
          pin: sellerPin,
          country: "India",
        }
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: await this.getHeadersAsync(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ekart Creation API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return {
        success: data.status ?? false,
        waybill: data.barcodes?.wbn || data.tracking_id || "",
        shipmentId: data.tracking_id || "",
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (err) {
      console.error("Ekart booking error:", err);
      throw err;
    }
  }

  /**
   * Fetch current tracking status of a shipment (GET /api/v1/track/{id}).
   */
  async trackShipment(waybill: string): Promise<TrackingResult> {
    if (this.isSandbox()) {
      return {
        waybill,
        status: "Booked",
        statusDetails: "Mock shipment booked successfully (Sandbox)",
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const url = `${this.baseUrl}/api/v1/track/${waybill}`;
      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeadersAsync(),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Tracking failed with status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return {
        waybill,
        status: data.track?.status || "Booked",
        statusDetails: data.track?.desc || "Shipment booked successfully",
        updatedAt: data.track?.ctime ? new Date(data.track.ctime).toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.error("Ekart tracking fetch error:", err);
      throw err;
    }
  }

  /**
   * Cancel a shipment (DELETE /api/v1/package/cancel).
   */
  async cancelShipment(trackingId: string): Promise<boolean> {
    if (this.isSandbox()) {
      return true;
    }

    try {
      const url = `${this.baseUrl}/api/v1/package/cancel?tracking_id=${trackingId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: await this.getHeadersAsync(),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cancellation failed with status ${response.status}: ${errText}`);
      }

      await response.json();
      return true;
    } catch (err) {
      console.error("Ekart cancellation error:", err);
      throw err;
    }
  }
}

