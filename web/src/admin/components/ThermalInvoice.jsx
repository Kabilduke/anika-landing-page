import React from "react";
import "./ThermalInvoice.css";

const ThermalInvoice = React.forwardRef(({ order, address, isPreview = false }, ref) => {
  if (!order) return null;
  const o = order;
  const orderItems =
    o.order_items && o.order_items.length > 0
      ? o.order_items
      : [{
          product_name: o.item_name || "Item",
          quantity: o.quantity || 1,
          price: o.total_price || 0,
          size: o.size || null,
          color: o.color || null,
          variant: o.variant || null,
        }];

  const total = Number(o.total_price || 0);
  const invoiceDate = o.order_date
    ? new Date(o.order_date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";
  const orderId = o.id ? "#" + String(o.id).slice(-8).toUpperCase() : "#UNKNOWN";

  return (
    <div className={`thermal-invoice ${isPreview ? "thermal-invoice--preview" : ""}`} ref={ref}>
      <div className="ti__header">
        <div className="ti__store-name">ANIKA FASHION</div>
        <div className="ti__tagline">Handcrafted Jewellery</div>
        <div className="ti__divider">================================</div>
      </div>
      <div className="ti__meta">
        <div className="ti__meta-row"><span>Invoice:</span><span>{orderId}</span></div>
        <div className="ti__meta-row"><span>Date:</span><span>{invoiceDate}</span></div>
        <div className="ti__meta-row"><span>Payment:</span><span>{o.payment || "COD"}</span></div>
      </div>
      <div className="ti__divider">--------------------------------</div>
      <div className="ti__section-title">CUSTOMER</div>
      <div className="ti__customer">
        <div>{o.customer?.name || "N/A"}</div>
        <div>{o.customer?.phone || "N/A"}</div>
      </div>
      {address && (
        <>
          <div className="ti__divider">--------------------------------</div>
          <div className="ti__section-title">SHIP TO</div>
          <div className="ti__address">
            <div>{address.full_name || o.customer?.name}</div>
            <div>{address.address_line1}</div>
            {address.address_line2 && <div>{address.address_line2}</div>}
            <div>{address.city}, {address.state} - {address.postal_code}</div>
            <div>{address.country}</div>
            {address.phone_number && <div>Ph: {address.phone_number}</div>}
          </div>
        </>
      )}
      <div className="ti__divider">--------------------------------</div>
      <div className="ti__section-title">ITEMS</div>
      <div className="ti__items">
        {orderItems.map((item, idx) => {
          const rawSize = item.size || item.selected_size || item.sizeDimension || (!o.order_items ? o.size : null);
          const rawVariant = item.variant || item.variant_name || (!o.order_items ? o.variant : null);
          const rawColor = item.color || item.selected_color || (!o.order_items ? o.color : null);

          const sizeStr = rawSize ? String(rawSize).replace(/^size[:\s-]+/i, "").trim() : null;
          const variantStr = rawVariant
            ? String(rawVariant).replace(/^(variant|color)[:\s-]+/i, "").trim()
            : (rawColor ? String(rawColor).replace(/^(variant|color)[:\s-]+/i, "").trim() : null);
          const colorStr = rawColor ? String(rawColor).replace(/^(variant|color)[:\s-]+/i, "").trim() : null;

          const showVariant = variantStr && (!sizeStr || variantStr.toLowerCase() !== sizeStr.toLowerCase());
          const showColor = colorStr && rawVariant && colorStr.toLowerCase() !== variantStr.toLowerCase();

          return (
            <div key={idx} className="ti__item">
              <div className="ti__item-name">{item.product_name}</div>
              <div className="ti__item-price-row">
                <span className="ti__item-qty-meta">
                  Qty: {item.quantity || 1}
                  {sizeStr && ` · Size: ${sizeStr}`}
                  {showVariant && ` · Variant: ${variantStr}`}
                  {showColor && ` · Color: ${colorStr}`}
                </span>
                <span className="ti__item-price">
                  Rs.{Number(item.price || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ti__divider">================================</div>
      <div className="ti__total-row">
        <span className="ti__total-label">TOTAL</span>
        <span className="ti__total-amount">Rs.{total.toLocaleString("en-IN")}</span>
      </div>
      <div className="ti__divider">================================</div>
      <div className="ti__footer">
        <div>Thank you for your order!</div>
        <div>www.anikafashion.in</div>
      </div>
      <div className="ti__cut">- - - - - - - - - - - - - -</div>
    </div>
  );
});

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;
