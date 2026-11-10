"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Category, PublicSettings } from "@/lib/types";
import { waLink } from "@/lib/site";
import { Brand } from "./Brand";
import { IconBag, IconClose, IconHeart, IconMenu } from "./Icons";
import { SearchBar } from "./SearchBar";
import { useStore } from "./StoreProvider";

export function Header({ categories, settings }: { categories: Category[]; settings: PublicSettings }) {
  const { count } = useStore();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="topbar">
          <div className="topbar-inner">
            <div className="top-links">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/track">Track order</Link>
              <Link href="/faq">FAQ</Link>
            </div>
            <div className="top-meta">
              <span>{settings.hours}</span>
              <span className="dot" />
              <a href={`tel:+${settings.phoneTel}`}>{settings.phone}</a>
              <Link href="/admin">Admin</Link>
            </div>
          </div>
        </div>
        <div className="nav-main">
          <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
            <IconMenu />
          </button>
          <Brand />
          <div className="nav-search">
            <SearchBar />
          </div>
          <div className="nav-actions">
            <a className="enquiry" href={waLink("Hi Limee Toys, I have a product enquiry.", settings.phoneTel)}>
              Enquiry
            </a>
            <Link href="/wishlist" className="icon-btn" aria-label="Wishlist">
              <IconHeart />
            </Link>
            <Link href="/cart" className="icon-btn bag" aria-label={`Cart, ${count} items`}>
              <IconBag />
              <span className="count">{count}</span>
            </Link>
          </div>
        </div>
        <div className="search-strip">
          <div className="topbar-inner">
            <SearchBar />
          </div>
        </div>
        <nav className="cat-links" aria-label="Categories">
          <Link href="/shop">Shop all</Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
      </header>
      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="drawer" role="dialog" aria-label="Menu" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <span className="drawer-brand">
                <img src="/limee-logo.jpg" alt="" className="brand-logo" />
                <strong>Limee Toys</strong>
              </span>
              <button className="icon-btn" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </div>
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/track">Track order</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href={user ? "/account" : "/login"}>{user ? "My account" : "Login"}</Link>
            <Link href="/admin">Admin</Link>
            <h3>Categories</h3>
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </aside>
        </div>
      ) : null}
      <nav className="bottom-nav" aria-label="Mobile">
        <button type="button" onClick={() => setOpen(true)}>
          <IconMenu />
          Menu
        </button>
        <Link href="/wishlist">
          <IconHeart />
          Wishlist
        </Link>
        <Link href="/cart">
          <IconBag />
          Cart ({count})
        </Link>
      </nav>
    </>
  );
}
