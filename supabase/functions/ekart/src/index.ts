import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { handleCorsPreflight, corsHeaders } from "../../_shared/cors.ts";
import { EkartService } from "./service.ts";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // 1. Handle CORS preflight request
    const corsResponse = handleCorsPreflight(req);
    if (corsResponse) return corsResponse;

    const sendResponse = (data: unknown, status = 200) => {
      const payload = JSON.stringify(data);
      return new Response(payload, {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return sendResponse({ error: "Missing Authorization header" }, 401);
      }

      // Verify user auth
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser(token);
      if (authError || !user) {
        return sendResponse({ error: "Unauthorized user" }, 401);
      }

      // Parse request body
      const body = await req.json();
      const { action } = body;

      // Instantiate service with injected admin client
      const ekartService = new EkartService(ctx.supabaseAdmin);

      if (action === "check_serviceability") {
        const { pincode } = body;
        if (!pincode || pincode.length !== 6) {
          return sendResponse({ error: "Invalid or missing 6-digit pincode" }, 400);
        }

        const serviceability = await ekartService.checkServiceability(pincode);
        return sendResponse(serviceability);
      }

      if (action === "book_shipment") {
        const { orderId, addressId } = body;
        if (!orderId) {
          return sendResponse({ error: "Missing orderId" }, 400);
        }

        const isAdmin = user.app_metadata?.role === "admin";
        const result = await ekartService.bookShipment(orderId, user.id, isAdmin, addressId);

        if (!result.success) {
          return sendResponse({ error: result.error }, result.status || 500);
        }

        return sendResponse({ success: true, order: result.order });
      }

      if (action === "track_shipment") {
        const { waybill } = body;
        if (!waybill) {
          return sendResponse({ error: "Missing waybill tracking number" }, 400);
        }

        const tracking = await ekartService.trackShipment(waybill);
        return sendResponse(tracking);
      }

      if (action === "cancel_order") {
        const { orderId } = body;
        if (!orderId) {
          return sendResponse({ error: "Missing orderId" }, 400);
        }

        const isAdmin = user.app_metadata?.role === "admin";
        const result = await ekartService.cancelOrder(orderId, user.id, isAdmin);

        if (!result.success) {
          return sendResponse({ error: result.error }, result.status || 500);
        }

        return sendResponse({ success: true });
      }

      return sendResponse({ error: `Unknown action: ${action}` }, 400);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return sendResponse({ error: errMsg }, 500);
    }
  }),
};

