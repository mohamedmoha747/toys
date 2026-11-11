"use client";

import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import type { CategoryView, ProductView } from "@/lib/types";
import { adminJson } from "./AdminShell";

const emptyProduct = {
  title: "", name: "", categoryId: "", brand: "Limee Toys", description: "",
  price: "", discountPrice: "", stock: "10", minStock: "5",
  featured: false, isNew: false, bestSeller: false, active: true, tone: "#ff7a18", images: ["", "", ""] as string[],
};

export function ProductsView({ superadmin }: { superadmin: boolean }) {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [draft, setDraft] = useState<typeof emptyProduct & { id?: string } | null>(null);
  const [error, setError] = useState("");

  function load() {
    Promise.all([adminJson("/api/admin/products"), adminJson("/api/admin/categories")]).then(([productData, categoryData]) => {
      setProducts(productData.products);
      setCategories(categoryData.categories);
    }).catch((err: Error) => setError(err.message));
  }
  useEffect(() => { load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setError("");
    try {
      await adminJson(draft.id ? `/api/admin/products/${draft.id}` : "/api/admin/products", {
        method: draft.id ? "PATCH" : "POST",
        body: JSON.stringify(draft),
      });
      setDraft(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <h1>Products</h1>
      {error ? <p className="form-error">{error}</p> : null}
      {superadmin ? <button className="primary" type="button" onClick={() => setDraft({ ...emptyProduct, categoryId: categories[0]?.id || "" })}>Add product</button> : <p className="muted">Staff can edit descriptions and visibility. Prices and stock stay with the super admin.</p>}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Toy</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td data-label="Toy"><strong>{product.name}</strong><div className="muted">{product.sku}</div></td>
                <td data-label="Category">{product.categoryName}</td>
                <td data-label="Price">{inr(product.price)}</td>
                <td data-label="Stock">{product.stock}</td>
                <td data-label="Active">{product.active ? "Yes" : "Hidden"}</td>
                <td className="actions">
                  <button className="text-btn" type="button" onClick={() => setDraft({
                    id: product.id, title: product.title, name: product.name, categoryId: product.categoryId, brand: product.brand,
                    description: product.description,
                    price: String(product.comparePrice || product.price),
                    discountPrice: product.comparePrice ? String(product.price) : "",
                    stock: String(product.stock), minStock: String(product.minStock), featured: product.featured,
                    isNew: product.isNew, bestSeller: product.bestSeller, active: product.active, tone: product.tone,
                    images: [product.images[0] || "", product.images[1] || "", product.images[2] || ""],
                  })}>Edit</button>
                  {superadmin ? <button className="text-btn danger" type="button" onClick={async () => {
                    if (!confirm(`Delete ${product.name}?`)) return;
                    await adminJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
                    load();
                  }}>Delete</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {draft ? (
        <form className="panel" style={{ marginTop: 12 }} onSubmit={save}>
          <h2>{draft.id ? "Edit product" : "New product"}</h2>
          <div className="image-slots">
            {[0, 1, 2].map((index) => (
              <label className="image-slot" key={index}>
                {draft.images[index] ? <img src={draft.images[index]} alt="" /> : <span>Image {index + 1}</span>}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file || !draft) return;
                    const body = new FormData();
                    body.set("file", file);
                    const res = await fetch("/api/admin/uploads", { method: "POST", body });
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data.error || "Upload failed");
                      return;
                    }
                    const images = [...draft.images];
                    images[index] = data.url;
                    setDraft({ ...draft, images });
                  }}
                />
              </label>
            ))}
          </div>
          <div className="form-grid two">
            <label className="field"><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <label className="field"><span>Product name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
          </div>
          <label className="field"><span>Description</span><textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          <div className="form-grid two">
            <label className="field"><span>MRP rate</span><input inputMode="decimal" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} disabled={!superadmin && Boolean(draft.id)} required /></label>
            <label className="field"><span>Our price</span><input inputMode="decimal" value={draft.discountPrice} onChange={(event) => setDraft({ ...draft, discountPrice: event.target.value })} disabled={!superadmin && Boolean(draft.id)} /></label>
            <label className="field"><span>Category</span>
              <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="field"><span>Brand</span><input value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} /></label>
            <label className="field"><span>Stock</span><input value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} disabled={!superadmin && Boolean(draft.id)} /></label>
            <label className="field"><span>Alert at</span><input value={draft.minStock} onChange={(event) => setDraft({ ...draft, minStock: event.target.value })} disabled={!superadmin && Boolean(draft.id)} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
          <label className="check"><input type="checkbox" checked={draft.isNew} onChange={(event) => setDraft({ ...draft, isNew: event.target.checked })} /> New arrival</label>
          <label className="check"><input type="checkbox" checked={draft.bestSeller} onChange={(event) => setDraft({ ...draft, bestSeller: event.target.checked })} /> Best seller</label>
          <label className="check"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Visible in the shop</label>
          <div className="actions">
            <button className="primary" type="submit">Save</button>
            <button className="ghost" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

const kindOptions = [
  ["parts", "General"],
  ["car", "Car"],
  ["drone", "Gadget"],
  ["boat", "Outdoor"],
  ["plane", "Learning"],
  ["heli", "Soft toy"],
] as const;

export function CategoriesView({ superadmin }: { superadmin: boolean }) {
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [products, setProducts] = useState<ProductView[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("parts");
  const [description, setDescription] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryView | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function toysIn(categoryId: string) {
    return products.filter((product) => product.categoryId === categoryId);
  }

  function load() {
    Promise.all([adminJson("/api/admin/categories"), adminJson("/api/admin/products")])
      .then(([categoryData, productData]) => {
        setCategories(categoryData.categories);
        setProducts(productData.products);
      })
      .catch((err: Error) => setError(err.message));
  }
  useEffect(() => { load(); }, []);

  async function removeToy(categoryName: string, product: ProductView) {
    if (!confirm(`Remove ${product.name} from ${categoryName}? This deletes that one toy. The other toys in this category stay.`)) return;
    setError("");
    setNote("");
    try {
      const result = await adminJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (result.hidden) setNote(`${product.name} is already on an order, so it was hidden instead of deleted.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }

  return (
    <div>
      <h1>Categories</h1>
      {error ? <p className="form-error">{error}</p> : null}
      {note ? <p className="banner-ok">{note}</p> : null}
      <form className="stack-form" style={{ maxWidth: 480 }} onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        try {
          await adminJson("/api/admin/categories", { method: "POST", body: JSON.stringify({ name, kind, description }) });
          setName(""); setDescription(""); load();
        } catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
      }}>
        <label className="field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="field"><span>Illustration</span>
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            {kindOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="field"><span>Description</span><input value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
        <button className="primary" type="submit">Add category</button>
      </form>
      <div className="category-list">
        {categories.map((category) => {
          const toys = toysIn(category.id);
          const open = openId === category.id;
          return (
            <article className="panel category-card" key={category.id}>
              <div className="admin-top">
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <strong>{category.name}</strong>
                  <span className="count-pill">{toys.length} toy{toys.length === 1 ? "" : "s"}</span>
                </div>
                <div className="actions">
                  <button className="text-btn" type="button" onClick={() => setOpenId(open ? null : category.id)}>{open ? "Hide toys" : "Toys"}</button>
                  <button className="text-btn" type="button" onClick={() => { setEditing(category); setOpenId(category.id); }}>Edit</button>
                  {superadmin ? <button className="text-btn danger" type="button" onClick={async () => {
                    if (!confirm(`Delete ${category.name}? Remove its toys first if any are still listed.`)) return;
                    setError("");
                    try { await adminJson(`/api/admin/categories/${category.id}`, { method: "DELETE" }); if (openId === category.id) setOpenId(null); load(); }
                    catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
                  }}>Delete</button> : null}
                </div>
              </div>
              {open && editing?.id === category.id ? (
                <form className="stack-form" onSubmit={async (event) => {
                  event.preventDefault();
                  setError("");
                  try {
                    await adminJson(`/api/admin/categories/${category.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ name: editing.name, kind: editing.kind, description: editing.description }),
                    });
                    setEditing(null);
                    load();
                  } catch (err) { setError(err instanceof Error ? err.message : "Update failed"); }
                }}>
                  <label className="field"><span>Name</span><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required /></label>
                  <label className="field"><span>Illustration</span>
                    <select value={editing.kind} onChange={(event) => setEditing({ ...editing, kind: event.target.value as CategoryView["kind"] })}>
                      {kindOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="field"><span>Description</span><input value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} required /></label>
                  <div className="actions">
                    <button className="primary" type="submit">Save category</button>
                    <button className="ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </form>
              ) : null}
              {open ? (
                <div>
                  {toys.length === 0 ? <p className="muted">No toys in this category.</p> : toys.map((toy) => (
                    <div className="toy-row" key={toy.id}>
                      <span><strong>{toy.name}</strong>{toy.active ? "" : " · Hidden"}</span>
                      {superadmin ? <button className="text-btn danger" type="button" onClick={() => removeToy(category.name, toy)}>Remove</button> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function InventoryView({ superadmin }: { superadmin: boolean }) {
  const [data, setData] = useState<{ products: ProductView[]; movements: { id: string; productName: string; qty: number; reason: string; note: string }[]; stockValue: number; low: ProductView[]; out: ProductView[] } | null>(null);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [direction, setDirection] = useState("in");
  const [reason, setReason] = useState("adjustment");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function load() { adminJson("/api/admin/inventory").then(setData).catch((err: Error) => setError(err.message)); }
  useEffect(() => { load(); }, []);
  if (!data) return <p>{error || "Loading inventory…"}</p>;

  return (
    <div>
      <h1>Inventory</h1>
      <div className="stats">
        <article className="stat"><span>Stock value</span><strong>{inr(data.stockValue)}</strong></article>
        <article className="stat"><span>Low stock</span><strong>{data.low.length}</strong></article>
        <article className="stat"><span>Out of stock</span><strong>{data.out.length}</strong></article>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {superadmin ? <form className="panel" style={{ marginTop: 12 }} onSubmit={async (event) => {
        event.preventDefault();
        try {
          await adminJson("/api/admin/inventory", { method: "POST", body: JSON.stringify({ productId, qty, direction, reason, note }) });
          setNote(""); load();
        } catch (err) { setError(err instanceof Error ? err.message : "Adjustment failed"); }
      }}>
        <h2>Stock movement</h2>
        <div className="form-grid two">
          <label className="field"><span>Product</span>
            <select value={productId} onChange={(event) => setProductId(event.target.value)} required>
              <option value="">Choose</option>
              {data.products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.stock})</option>)}
            </select>
          </label>
          <label className="field"><span>Quantity</span><input value={qty} onChange={(event) => setQty(event.target.value)} /></label>
          <label className="field"><span>Direction</span>
            <select value={direction} onChange={(event) => setDirection(event.target.value)}><option value="in">Stock in</option><option value="out">Stock out</option></select>
          </label>
          <label className="field"><span>Reason</span>
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="purchase">Purchase</option><option value="damage">Damage</option><option value="return">Return</option><option value="adjustment">Adjustment</option>
            </select>
          </label>
        </div>
        <label className="field"><span>Note</span><input value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <button className="primary" type="submit">Record</button>
      </form> : <p className="muted">Stock adjustments are limited to the super admin.</p>}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Reason</th><th>Note</th></tr></thead>
          <tbody>{data.movements.map((row) => <tr key={row.id}><td data-label="Product">{row.productName}</td><td data-label="Qty">{row.qty}</td><td data-label="Reason">{row.reason}</td><td data-label="Note">{row.note}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
