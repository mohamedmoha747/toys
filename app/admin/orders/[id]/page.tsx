import Link from "next/link";
import { notFound } from "next/navigation";
import { inr } from "@/lib/format";
import { requireStaffPage } from "@/lib/guard";
import { getOrder } from "@/lib/orders";
import { getSettings } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage();
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrder(id), getSettings()]);
  if (!order) notFound();
  return (
    <article className="wrap page prose">
      <p className="no-print"><Link className="linkish" href="/admin/orders">Back to orders</Link> · Use the browser print dialog to save this invoice as PDF.</p>
      <h1>{settings.storeName} invoice</h1>
      <p>{order.code} · {order.status} · {order.createdAt.slice(0, 10)}</p>
      <p>{order.customerName}<br />{order.mobile}<br />{order.address}</p>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId}><td>{item.name}</td><td>{item.qty}</td><td>{inr(item.unitPrice)}</td><td>{inr(item.subtotal)}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Items {order.itemCount}</p>
      <p>Delivery {inr(order.deliveryCharge)}</p>
      <p>Discount {inr(order.discount)}</p>
      <p><strong>Grand total {inr(order.grandTotal)}</strong></p>
      <p>Payment preference: {order.paymentPreference === "upi" ? "UPI" : "Cash on delivery"}</p>
      <p>Collected {inr(order.amountCollected)} · Refund {inr(order.refundAmount)}</p>
      <p className="muted">{settings.address} · {settings.phone}</p>
    </article>
  );
}
