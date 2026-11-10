"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inr } from "@/lib/format";
import { categoryKinds, kindLabel, type CategoryKind, type CategoryView, type ProductView } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

const tones = ["#ff7a18", "#ff4d6d", "#f5c518", "#3ddc97", "#4cc9f0", "#7c5cff", "#00d4ff", "#1d9bf0", "#14b8a6", "#f43f5e", "#f59e0b", "#111827"];

type ProductDraft = {
  id?: string;
  name: string;
  categoryId: string;
  price: string;
  comparePrice: string;
  stock: string;
  description: string;
  tone: string;
  featured: boolean;
  badge: string;
};

type CategoryDraft = {
  id?: string;
  name: string;
  kind: CategoryKind;
  description: string;
};

const emptyProduct = (categoryId = ""): ProductDraft => ({
  name: "",
  categoryId,
  price: "",
  comparePrice: "",
  stock: "10",
  description: "",
  tone: "#ff7a18",
  featured: false,
  badge: "",
});

export function AdminPanel() {
  const router = useRouter();
  const [keyInput, setKeyInput] = useState("");
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<ProductView[]>([]);
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("lms-admin-key");
    if (saved) {
      setKey(saved);
      setAuthed(true);
    }
  }, []);

  async function call(url: string, options?: RequestInit) {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": key,
        ...(options?.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      sessionStorage.removeItem("lms-admin-key");
      setAuthed(false);
      throw new Error(data.error || "Wrong password");
    }
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function refresh() {
    const data = await call("/api/products");
    setProducts(data.products);
    setCategories(data.categories);
  }

  useEffect(() => {
    if (!authed) return;
    refresh().catch((err: Error) => setError(err.message));
    // refresh identity changes with key; run when the session opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, key]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": keyInput },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wrong password");
      sessionStorage.setItem("lms-admin-key", keyInput);
      setKey(keyInput);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("lms-admin-key");
    setAuthed(false);
    setKey("");
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!productDraft) return;
    setBusy(true);
    setError("");
    try {
      await call(productDraft.id ? `/api/products/${productDraft.id}` : "/api/products", {
        method: productDraft.id ? "PUT" : "POST",
        body: JSON.stringify(productDraft),
      });
      setNotice(productDraft.id ? "Product updated." : "Product added.");
      setProductDraft(null);
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product: ProductView) {
    if (!confirm(`Delete ${product.name}?`)) return;
    setError("");
    try {
      await call(`/api/products/${product.id}`, { method: "DELETE" });
      setNotice("Product deleted.");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryDraft) return;
    setBusy(true);
    setError("");
    try {
      await call(categoryDraft.id ? `/api/categories/${categoryDraft.id}` : "/api/categories", {
        method: categoryDraft.id ? "PUT" : "POST",
        body: JSON.stringify(categoryDraft),
      });
      setNotice(categoryDraft.id ? "Category updated." : "Category added.");
      setCategoryDraft(null);
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(category: CategoryView) {
    if (!confirm(`Delete ${category.name}?`)) return;
    setError("");
    try {
      await call(`/api/categories/${category.id}`, { method: "DELETE" });
      setNotice("Category deleted.");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (!authed) {
    return (
      <form className="login-card" onSubmit={login}>
        <p className="eyebrow">LMS store admin</p>
        <h1>Manage the catalog</h1>
        <p className="muted">Add, edit and delete products and categories. Demo password: lms-admin</p>
        <label className="field">
          <span>Password</span>
          <input type="password" value={keyInput} onChange={(event) => setKeyInput(event.target.value)} required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Enter admin"}
        </button>
      </form>
    );
  }

  const previewKind = categories.find((item) => item.id === productDraft?.categoryId)?.kind ?? "car";

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div>
          <p className="eyebrow">LMS admin</p>
          <h1>Catalog</h1>
        </div>
        <button className="ghost" type="button" onClick={logout}>
          Log out
        </button>
      </div>
      {error ? <p className="banner-error">{error}</p> : null}
      {notice ? <p className="banner-ok">{notice}</p> : null}
      <div className="tabs">
        <button className={`tab ${tab === "products" ? "on" : ""}`} type="button" onClick={() => setTab("products")}>
          Products
        </button>
        <button className={`tab ${tab === "categories" ? "on" : ""}`} type="button" onClick={() => setTab("categories")}>
          Categories
        </button>
      </div>

      {tab === "products" ? (
        <section className="split">
          <div>
            <button className="primary" type="button" onClick={() => setProductDraft(emptyProduct(categories[0]?.id ?? ""))}>
              Add product
            </button>
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <div className="muted">{product.slug}</div>
                      </td>
                      <td>{product.categoryName}</td>
                      <td>{inr(product.price)}</td>
                      <td>{product.stock}</td>
                      <td className="actions">
                        <button
                          className="text-btn"
                          type="button"
                          onClick={() =>
                            setProductDraft({
                              id: product.id,
                              name: product.name,
                              categoryId: product.categoryId,
                              price: String(product.price),
                              comparePrice: product.comparePrice ? String(product.comparePrice) : "",
                              stock: String(product.stock),
                              description: product.description,
                              tone: product.tone,
                              featured: product.featured,
                              badge: product.badge ?? "",
                            })
                          }
                        >
                          Edit
                        </button>
                        <button className="text-btn danger" type="button" onClick={() => removeProduct(product)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {productDraft ? (
            <form className="panel" onSubmit={saveProduct}>
              <h2>{productDraft.id ? "Edit product" : "New product"}</h2>
              <div className="mini-visual">
                <ProductVisual kind={previewKind} tone={productDraft.tone} />
              </div>
              <label className="field">
                <span>Name</span>
                <input value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} required />
              </label>
              <div className="form-grid two">
                <label className="field">
                  <span>Category</span>
                  <select value={productDraft.categoryId} onChange={(event) => setProductDraft({ ...productDraft, categoryId: event.target.value })} required>
                    <option value="">Choose</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Badge</span>
                  <input value={productDraft.badge} onChange={(event) => setProductDraft({ ...productDraft, badge: event.target.value })} placeholder="New" />
                </label>
                <label className="field">
                  <span>Price (₹)</span>
                  <input inputMode="numeric" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} required />
                </label>
                <label className="field">
                  <span>Compare price</span>
                  <input inputMode="numeric" value={productDraft.comparePrice} onChange={(event) => setProductDraft({ ...productDraft, comparePrice: event.target.value })} />
                </label>
                <label className="field">
                  <span>Stock</span>
                  <input inputMode="numeric" value={productDraft.stock} onChange={(event) => setProductDraft({ ...productDraft, stock: event.target.value })} required />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea rows={4} value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} required />
              </label>
              <div>
                <span className="field"><span>Colour</span></span>
                <div className="swatches">
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className={`swatch ${productDraft.tone === tone ? "on" : ""}`}
                      style={{ background: tone }}
                      aria-label={tone}
                      onClick={() => setProductDraft({ ...productDraft, tone })}
                    />
                  ))}
                </div>
              </div>
              <label className="check">
                <input type="checkbox" checked={productDraft.featured} onChange={(event) => setProductDraft({ ...productDraft, featured: event.target.checked })} />
                Featured on the shop sort
              </label>
              <div className="actions">
                <button className="primary" type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save product"}
                </button>
                <button className="ghost" type="button" onClick={() => setProductDraft(null)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </section>
      ) : (
        <section className="split">
          <div>
            <button
              className="primary"
              type="button"
              onClick={() => setCategoryDraft({ name: "", kind: "car", description: "" })}
            >
              Add category
            </button>
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Products</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.name}</strong>
                        <div className="muted">{category.slug}</div>
                      </td>
                      <td>{kindLabel[category.kind]}</td>
                      <td>{category.productCount}</td>
                      <td className="actions">
                        <button
                          className="text-btn"
                          type="button"
                          onClick={() =>
                            setCategoryDraft({
                              id: category.id,
                              name: category.name,
                              kind: category.kind,
                              description: category.description,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button className="text-btn danger" type="button" onClick={() => removeCategory(category)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {categoryDraft ? (
            <form className="panel" onSubmit={saveCategory}>
              <h2>{categoryDraft.id ? "Edit category" : "New category"}</h2>
              <label className="field">
                <span>Name</span>
                <input value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} required />
              </label>
              <label className="field">
                <span>Type</span>
                <select value={categoryDraft.kind} onChange={(event) => setCategoryDraft({ ...categoryDraft, kind: event.target.value as CategoryKind })}>
                  {categoryKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kindLabel[kind]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={4} value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} required />
              </label>
              <div className="actions">
                <button className="primary" type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save category"}
                </button>
                <button className="ghost" type="button" onClick={() => setCategoryDraft(null)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </section>
      )}
    </div>
  );
}
