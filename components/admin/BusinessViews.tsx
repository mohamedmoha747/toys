"use client";

import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import { adminJson } from "./AdminShell";

function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  function load() {
    if (!url) return;
    adminJson(url).then(setData).catch((err: Error) => setError(err.message));
  }
  useEffect(() => { load(); }, [url]);
  return { data, error, setError, load };
}

export function CustomersView() {
  const { data, error } = useLoad<{ customers: { id: string; name: string; mobile: string; email: string; orders: number; total: number; addresses: { line?: string }[] }[] }>("/api/admin/customers");
  if (!data) return <p>{error || "Loading customers…"}</p>;
  return (
    <div>
      <h1>Customers</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Orders</th><th>Total</th><th>Address</th></tr></thead>
          <tbody>
            {data.customers.map((customer) => (
              <tr key={customer.id}>
                <td data-label="Name">{customer.name}</td><td data-label="Mobile">{customer.mobile}</td><td data-label="Email">{customer.email}</td>
                <td data-label="Orders">{customer.orders}</td><td data-label="Total">{inr(customer.total)}</td><td data-label="Address">{customer.addresses?.[0]?.line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SuppliersView() {
  const { data, error, setError, load } = useLoad<{ suppliers: { id: string; name: string; company: string; phone: string; address: string }[] }>("/api/admin/suppliers");
  const [form, setForm] = useState({ name: "", company: "", phone: "", address: "", notes: "" });
  if (!data) return <p>{error || "Loading suppliers…"}</p>;
  return (
    <div>
      <h1>Suppliers</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="form-grid two" onSubmit={async (event) => {
        event.preventDefault();
        try { await adminJson("/api/admin/suppliers", { method: "POST", body: JSON.stringify(form) }); setForm({ name: "", company: "", phone: "", address: "", notes: "" }); load(); }
        catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        <label className="field"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label className="field"><span>Company</span><input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label>
        <label className="field"><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label className="field"><span>Address</span><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
        <button className="primary" type="submit">Add supplier</button>
      </form>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table><thead><tr><th>Name</th><th>Company</th><th>Phone</th><th>Address</th></tr></thead>
          <tbody>{data.suppliers.map((item) => <tr key={item.id}><td data-label="Name">{item.name}</td><td data-label="Company">{item.company}</td><td data-label="Phone">{item.phone}</td><td data-label="Address">{item.address}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function PurchasesView() {
  const { data, error, setError, load } = useLoad<{ purchases: { id: string; supplierName: string; total: number; amountPaid: number; balance: number; status: string }[] }>("/api/admin/purchases");
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("10");
  const [cost, setCost] = useState("100");
  const [amountPaid, setAmountPaid] = useState("0");
  useEffect(() => {
    adminJson("/api/admin/suppliers").then((result) => setSuppliers(result.suppliers));
    adminJson("/api/admin/products").then((result) => setProducts(result.products));
  }, []);
  if (!data) return <p>{error || "Loading purchases…"}</p>;
  return (
    <div>
      <h1>Purchases</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="form-grid two" onSubmit={async (event) => {
        event.preventDefault();
        try {
          await adminJson("/api/admin/purchases", { method: "POST", body: JSON.stringify({ supplierId, amountPaid, items: [{ productId, qty: Number(qty), cost: Number(cost) }] }) });
          load();
        } catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        <label className="field"><span>Supplier</span>
          <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} required>
            <option value="">Choose</option>
            {suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Product</span>
          <select value={productId} onChange={(event) => setProductId(event.target.value)} required>
            <option value="">Choose</option>
            {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Qty</span><input value={qty} onChange={(event) => setQty(event.target.value)} /></label>
        <label className="field"><span>Unit cost</span><input value={cost} onChange={(event) => setCost(event.target.value)} /></label>
        <label className="field"><span>Amount paid</span><input value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} /></label>
        <button className="primary" type="submit">Save draft</button>
      </form>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Supplier</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th><th></th></tr></thead>
          <tbody>
            {data.purchases.map((item) => (
              <tr key={item.id}>
                <td data-label="Supplier">{item.supplierName}</td><td data-label="Status">{item.status}</td><td data-label="Total">{inr(item.total)}</td><td data-label="Paid">{inr(item.amountPaid)}</td><td data-label="Balance">{inr(item.balance)}</td>
                <td className="actions">{item.status === "draft" ? <button className="text-btn" type="button" onClick={async () => {
                  try { await adminJson(`/api/admin/purchases/${item.id}`, { method: "PATCH", body: "{}" }); load(); }
                  catch (err) { setError(err instanceof Error ? err.message : "Approve failed"); }
                }}>Approve and add stock</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FinanceView({ superadmin }: { superadmin: boolean }) {
  const { data, error, setError, load } = useLoad<{ expenses: { id: string; category: string; amount: number; note: string; spentOn: string }[]; finance: { sales: number; collected: number; pendingCollection: number; cogs: number; expenses: number; grossProfit: number; netProfit: number; deliveryIncome: number; refunds: number } }>(superadmin ? "/api/admin/expenses" : "");
  const [category, setCategory] = useState("packaging");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  if (!superadmin) return <div><h1>Finance</h1><p className="muted">Finance reports are limited to the super admin.</p></div>;
  if (!data) return <p>{error || "Loading finance…"}</p>;
  const money = data.finance;
  return (
    <div>
      <h1>Finance</h1>
      <p className="muted">Net profit = net sales − cost of goods − operating expenses. Uncollected orders are not treated as cash.</p>
      <div className="stats">
        {[["Sales", money.sales], ["Collected", money.collected], ["Pending collection", money.pendingCollection], ["Delivery income", money.deliveryIncome], ["Refunds", money.refunds], ["Cost of goods", money.cogs], ["Expenses", money.expenses], ["Gross profit", money.grossProfit], ["Net profit", money.netProfit]].map(([label, value]) => (
          <article key={String(label)} className="stat"><span>{label}</span><strong>{inr(Number(value))}</strong></article>
        ))}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="form-grid two" style={{ marginTop: 12 }} onSubmit={async (event) => {
        event.preventDefault();
        try { await adminJson("/api/admin/expenses", { method: "POST", body: JSON.stringify({ category, amount, note }) }); setAmount(""); setNote(""); load(); }
        catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        <label className="field"><span>Expense</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {["packaging", "delivery", "transport", "marketing", "staff", "rent", "other"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="field"><span>Amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
        <label className="field"><span>Note</span><input value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <button className="primary" type="submit">Add expense</button>
      </form>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>{data.expenses.map((item) => <tr key={item.id}><td data-label="Date">{item.spentOn.slice(0, 10)}</td><td data-label="Category">{item.category}</td><td data-label="Amount">{inr(item.amount)}</td><td data-label="Note">{item.note}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function CouponsView() {
  const { data, error, setError, load } = useLoad<{ coupons: { id: string; code: string; type: string; value: number; minOrder: number; usedCount: number; usageLimit: number; active: boolean }[] }>("/api/admin/coupons");
  const [form, setForm] = useState({ code: "", type: "percent", value: "10", minOrder: "0", usageLimit: "0" });
  if (!data) return <p>{error || "Loading coupons…"}</p>;
  return (
    <div>
      <h1>Coupons</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="form-grid two" onSubmit={async (event) => {
        event.preventDefault();
        try { await adminJson("/api/admin/coupons", { method: "POST", body: JSON.stringify(form) }); load(); }
        catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        <label className="field"><span>Code</span><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required /></label>
        <label className="field"><span>Type</span>
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="percent">Percent</option><option value="fixed">Fixed ₹</option></select>
        </label>
        <label className="field"><span>Value</span><input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} /></label>
        <label className="field"><span>Minimum order</span><input value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: event.target.value })} /></label>
        <label className="field"><span>Usage limit (0 = unlimited)</span><input value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} /></label>
        <button className="primary" type="submit">Create coupon</button>
      </form>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min</th><th>Used</th></tr></thead>
          <tbody>{data.coupons.map((item) => <tr key={item.id}><td data-label="Code">{item.code}</td><td data-label="Type">{item.type}</td><td data-label="Value">{item.value}</td><td data-label="Min">{item.minOrder}</td><td data-label="Used">{item.usedCount}/{item.usageLimit || "∞"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function ReviewsView() {
  const { data, error, load } = useLoad<{ reviews: { id: string; authorName: string; rating: number; text: string; approved: boolean }[] }>("/api/admin/reviews");
  if (!data) return <p>{error || "Loading reviews…"}</p>;
  return (
    <div>
      <h1>Reviews</h1>
      {data.reviews.map((review) => (
        <article key={review.id} className="info-card" style={{ marginBottom: 8 }}>
          <strong>{review.authorName}</strong> {"★".repeat(review.rating)} · {review.approved ? "Published" : "Waiting"}
          <p>{review.text}</p>
          <button className="text-btn" type="button" onClick={async () => { await adminJson(`/api/admin/reviews/${review.id}`, { method: "PATCH", body: JSON.stringify({ approved: !review.approved }) }); load(); }}>
            {review.approved ? "Hide" : "Approve"}
          </button>
        </article>
      ))}
    </div>
  );
}

export function ReportsView({ superadmin }: { superadmin: boolean }) {
  const types = ["sales", "orders", "products", "categories", "customers", "stock", "purchases", ...(superadmin ? ["expenses", "collections", "profit"] : [])];
  const [type, setType] = useState("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<{ columns: string[]; rows: Record<string, string | number>[] } | null>(null);
  const [error, setError] = useState("");
  const query = `type=${type}&from=${from}&to=${to}`;
  return (
    <div>
      <h1>Reports</h1>
      <form className="shop-search" onSubmit={async (event) => {
        event.preventDefault();
        try { setReport(await adminJson(`/api/admin/reports?${query}`)); }
        catch (err) { setError(err instanceof Error ? err.message : "Report failed"); }
      }}>
        <select value={type} onChange={(event) => setType(event.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button className="primary" type="submit">Run</button>
        <a className="ghost" href={`/api/admin/reports?${query}&format=csv`}>Download CSV</a>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
      {report ? (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <button className="ghost no-print" type="button" onClick={() => window.print()}>Print / PDF</button>
          <table>
            <thead><tr>{report.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{report.rows.map((row, index) => <tr key={index}>{report.columns.map((column) => <td key={column} data-label={column}>{row[column]}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function SettingsView({ superadmin }: { superadmin: boolean }) {
  const [settings, setSettings] = useState<Record<string, string | number> | null>(null);
  const [policies, setPolicies] = useState({ shipping: "", returns: "", privacy: "", terms: "" });
  const [error, setError] = useState("");
  const [banners, setBanners] = useState<{ id: string; title: string; href: string; active: boolean }[]>([]);
  const [banner, setBanner] = useState({ eyebrow: "Offer", title: "", text: "", href: "/shop", cta: "Shop", tone: "#f5a524", kind: "parts" });

  useEffect(() => {
    if (!superadmin) return;
    adminJson("/api/admin/settings").then((data) => {
      setSettings(data.settings);
      setPolicies(data.settings.policies);
    }).catch((err: Error) => setError(err.message));
    adminJson("/api/admin/banners").then((data) => setBanners(data.banners)).catch(() => undefined);
  }, [superadmin]);
  if (!superadmin) return <div><h1>Settings</h1><p className="muted">Store settings are limited to the super admin.</p></div>;
  if (!settings) return <p>{error || "Loading settings…"}</p>;

  return (
    <div>
      <h1>Settings</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="form-grid two" onSubmit={async (event) => {
        event.preventDefault();
        try {
          const data = await adminJson("/api/admin/settings", { method: "PUT", body: JSON.stringify({ ...settings, policies }) });
          setSettings(data.settings);
        } catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        {["storeName", "phone", "whatsapp", "email", "address", "hours", "serviceAreas"].map((field) => (
          <label className="field" key={field}><span>{field}</span>
            <input value={String(settings[field] || "")} onChange={(event) => setSettings({ ...settings, [field]: event.target.value })} />
          </label>
        ))}
        <label className="field"><span>Delivery charge</span><input value={String(settings.deliveryCharge)} onChange={(event) => setSettings({ ...settings, deliveryCharge: Number(event.target.value) })} /></label>
        <label className="field"><span>Free delivery over</span><input value={String(settings.freeDeliveryOver)} onChange={(event) => setSettings({ ...settings, freeDeliveryOver: Number(event.target.value) })} /></label>
        {(["shipping", "returns", "privacy", "terms"] as const).map((field) => (
          <label className="field" key={field}><span>{field}</span><textarea rows={3} value={policies[field]} onChange={(event) => setPolicies({ ...policies, [field]: event.target.value })} /></label>
        ))}
        <button className="primary" type="submit">Save settings</button>
      </form>
      <h2 style={{ marginTop: 20 }}>Banners</h2>
      <form className="form-grid two" onSubmit={async (event) => {
        event.preventDefault();
        await adminJson("/api/admin/banners", { method: "POST", body: JSON.stringify(banner) });
        setBanners((await adminJson("/api/admin/banners")).banners);
      }}>
        <label className="field"><span>Title</span><input value={banner.title} onChange={(event) => setBanner({ ...banner, title: event.target.value })} required /></label>
        <label className="field"><span>Text</span><input value={banner.text} onChange={(event) => setBanner({ ...banner, text: event.target.value })} /></label>
        <label className="field"><span>Link</span><input value={banner.href} onChange={(event) => setBanner({ ...banner, href: event.target.value })} /></label>
        <button className="primary" type="submit">Add banner</button>
      </form>
      {banners.map((item) => (
        <div className="toy-row" key={item.id}>
          <span><strong>{item.title}</strong> · {item.href}</span>
          <button className="text-btn danger" type="button" onClick={async () => { await adminJson(`/api/admin/banners/${item.id}`, { method: "DELETE" }); setBanners((await adminJson("/api/admin/banners")).banners); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
