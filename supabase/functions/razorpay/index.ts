import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Missing Authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user auth
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized user" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse request body
      const body = await req.json();
      const { action } = body;

      if (action === "create_order") {
        const { items } = body;
        if (!items || !Array.isArray(items) || items.length === 0) {
          return new Response(
            JSON.stringify({ error: "Missing or empty items array" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Query product details from database for all items
        const productIds = items.map(item => item.productId);
        const { data: products, error: dbError } = await ctx.supabase
          .from("products")
          .select("product_id, name, price")
          .in("product_id", productIds);

        if (dbError || !products || products.length === 0) {
          return new Response(
            JSON.stringify({ error: "Products not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate amount in paise (including flat 800 charge for GST/Taxes/Platform Fee)
        let subtotal = 0;
        for (const item of items) {
          const product = products.find(p => p.product_id === item.productId);
          if (!product) {
            return new Response(
              JSON.stringify({ error: `Product not found: ${item.productId}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          subtotal += Number(product.price) * Number(item.quantity || 1);
        }
        const grandTotal = subtotal + 800; // subtotal + taxes + gst + platformFee
        const amountInPaise = Math.round(grandTotal * 100);

        const keyId = Deno.env.get("RAZORPAY_KEY_ID");
        const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({ error: "Razorpay keys not configured in server secrets" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Call Razorpay API
        const basicAuth = btoa(`${keyId}:${keySecret}`);
        const rzResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
          }),
        });

        if (!rzResponse.ok) {
          const errorText = await rzResponse.text();
          return new Response(
            JSON.stringify({ error: `Razorpay order creation failed: ${errorText}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const rzOrder = await rzResponse.json();
        const mainItem = items[0];
        const mainProduct = products.find(p => p.product_id === mainItem.productId);
        return new Response(
          JSON.stringify({
            success: true,
            orderId: rzOrder.id,
            amount: amountInPaise,
            currency: "INR",
            productName: items.length > 1
              ? `${mainProduct?.name} + ${items.length - 1} other(s)`
              : mainProduct?.name || "Anika Order",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } 
      
      if (action === "verify_payment") {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          items,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !items || !Array.isArray(items) || items.length === 0) {
          return new Response(
            JSON.stringify({ error: "Missing required payment verification details" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
        if (!keySecret) {
          return new Response(
            JSON.stringify({ error: "Razorpay secret key not configured in server secrets" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify Razorpay HMAC signature
        const hmac = crypto.createHmac("sha256", keySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
          return new Response(
            JSON.stringify({ error: "Invalid signature verification failed" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch authentic product details to record final order amount
        const productIds = items.map(item => item.productId);
        const { data: products, error: dbError } = await ctx.supabase
          .from("products")
          .select("product_id, name, price, image_url, images")
          .in("product_id", productIds);

        if (dbError || !products || products.length === 0) {
          return new Response(
            JSON.stringify({ error: "Products not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let subtotal = 0;
        for (const item of items) {
          const product = products.find(p => p.product_id === item.productId);
          if (!product) {
            return new Response(
              JSON.stringify({ error: `Product not found: ${item.productId}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          subtotal += Number(product.price) * Number(item.quantity || 1);
        }
        const grandTotal = subtotal + 800; // subtotal + taxes + gst + platformFee
        const mainItem = items[0];
        const mainProduct = products.find(p => p.product_id === mainItem.productId);
        const itemName = items.length > 1
          ? `${mainProduct?.name} + ${items.length - 1} other(s)`
          : mainProduct?.name || "Anika Order";

        // Insert order record using admin client (bypasses RLS limits if any)
        // id is omitted — DB trigger auto-generates: ORD{YYYYMMDD}{NNNN}
        const { data: order, error: insertError } = await ctx.supabaseAdmin
          .from("orders")
          .insert({
            user_id: user.id,
            item_name: itemName,
            quantity: items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
            total_price: grandTotal,
            payment: "Razorpay",
            type: "Regular",
            status: "Paid",
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            razorpay_signature: razorpay_signature,
          })
          .select()
          .single();

        if (insertError) {
          return new Response(
            JSON.stringify({ error: `Failed to insert order: ${insertError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Insert child order items for each item in order
        const orderItemsToInsert = items.map(item => {
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

        const { error: itemsInsertError } = await ctx.supabaseAdmin
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsInsertError) {
          return new Response(
            JSON.stringify({ error: `Failed to insert order items: ${itemsInsertError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, order }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
};
