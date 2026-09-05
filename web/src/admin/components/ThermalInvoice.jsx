import React from "react";
import "./ThermalInvoice.css";

const ThermalInvoice = React.forwardRef(({ order, address }, ref) => {
  if (!order) return null;
  const o = order;
  const orderItems =
    o.order_items && o.order_items.length > 0
      ? o.order_items
      : [{ product_name: o.item_name || "Item", quantity: o.quantity || 1, price: o.total_price || 0 }];

  const total = Number(o.total_price || 0);
  const invoiceDate = o.order_date
    ? new Date(o.order_date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";
  const orderId = o.id ? "#" + String(o.id).slice(-8).toUpperCase() : "#UNKNOWN";

  return (
    <div className="thermal-invoice" ref={ref}>
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
        {orderItems.map((item, idx) => (
          <div key={idx} className="ti__item">
            <div className="ti__item-name">{item.product_name}</div>
            {(item.size || item.color) && (
              <div className="ti__item-variant">
                {item.size && "Size: " + item.size}
                {item.size && item.color && " · "}
                {item.color && "Color: " + item.color}
              </div>
            )}
            <div className="ti__item-price-row">
              <span>Qty: {item.quantity || 1}</span>
              <span>Rs.{Number(item.price || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
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
