"use client";

import { useEffect, useState } from "react";
import { postAdminImage } from "@/lib/images";
import { adminJson } from "./AdminShell";

type Profile = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  organization: string;
  photo: string;
  role: "customer" | "staff" | "superadmin";
  active: boolean;
  createdAt: string;
  notifyOrders: boolean;
  notifyStock: boolean;
};

const roleLabel: Record<Profile["role"], string> = {
  superadmin: "Super Admin",
  staff: "Staff",
  customer: "Customer",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "LM";
}

function joined(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function AccountView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [tab, setTab] = useState<"account" | "security" | "notifications">("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminJson("/api/admin/profile")
      .then((data) => {
        setProfile(data.profile);
        setDraft(data.profile);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  async function save(extra?: Record<string, string>) {
    if (!draft) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const data = await adminJson("/api/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...draft, ...extra }),
      });
      setProfile(data.profile);
      setDraft(data.profile);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNote("Profile saved.");
      if (profile && (data.profile.name !== profile.name || data.profile.email !== profile.email)) {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!draft || !profile) return <p className="loading-note">{error || "Loading profile…"}</p>;

  return (
    <div>
      <h1>My Profile</h1>
      {error ? <p className="form-error">{error}</p> : null}
      {note ? <p className="banner-ok">{note}</p> : null}
      <div className="profile-layout">
        <aside className="panel profile-card">
          <div className="avatar-wrap">
            {draft.photo ? (
              <img className="avatar-photo" src={draft.photo} alt="" />
            ) : (
              <span className="avatar-photo">{initials(draft.name)}</span>
            )}
            <label className="avatar-cam">
              <span className="sr-only">Change profile photo</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 7.5 9.2 6h5.6L16 7.5H19a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setError("");
                  try {
                    const url = await postAdminImage(file);
                    setDraft({ ...draft, photo: url });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed");
                  }
                }}
              />
            </label>
          </div>
          <strong className="profile-name">{draft.name}</strong>
          <span className="role-pill">{roleLabel[draft.role]}</span>
          <dl className="profile-meta">
            <div><dt>Email</dt><dd>{draft.email}</dd></div>
            <div><dt>Phone</dt><dd>{draft.mobile || "—"}</dd></div>
            <div><dt>Brand</dt><dd>{draft.organization}</dd></div>
            <div><dt>Joined</dt><dd>{joined(draft.createdAt)}</dd></div>
          </dl>
        </aside>
        <section className="panel">
          <div className="profile-tabs" role="tablist">
            <button type="button" className={tab === "account" ? "on" : ""} onClick={() => setTab("account")}>Account Details</button>
            <button type="button" className={tab === "security" ? "on" : ""} onClick={() => setTab("security")}>Security</button>
            <button type="button" className={tab === "notifications" ? "on" : ""} onClick={() => setTab("notifications")}>Notifications</button>
          </div>
          {tab === "account" ? (
            <form className="profile-form" onSubmit={(event) => { event.preventDefault(); save(); }}>
              <h2>Account Details</h2>
              <div className="form-grid two">
                <label className="field"><span>Full Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
                <label className="field"><span>Phone Number</span><input value={draft.mobile} onChange={(event) => setDraft({ ...draft, mobile: event.target.value })} /></label>
                <label className="field"><span>Email</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required /></label>
                <label className="field"><span>Organization / Brand</span><input value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} /></label>
                <label className="field"><span>Role</span><input value={roleLabel[draft.role]} disabled /></label>
                <label className="field"><span>Account Status</span><span className="status-pill">{draft.active ? "Active" : "Inactive"}</span></label>
              </div>
              <div className="profile-actions">
                <button className="ghost" type="button" onClick={() => { setDraft(profile); setError(""); setNote(""); }}>Cancel</button>
                <button className="primary" type="submit" disabled={busy}>Save Changes</button>
              </div>
            </form>
          ) : null}
          {tab === "security" ? (
            <form className="profile-form" onSubmit={(event) => { event.preventDefault(); save({ currentPassword, newPassword, confirmPassword }); }}>
              <h2>Security</h2>
              <div className="form-grid">
                <label className="field"><span>Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
                <label className="field"><span>New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
                <label className="field"><span>Confirm new password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
              </div>
              <div className="profile-actions">
                <button className="primary" type="submit" disabled={busy}>Update password</button>
              </div>
            </form>
          ) : null}
          {tab === "notifications" ? (
            <form className="profile-form" onSubmit={(event) => { event.preventDefault(); save(); }}>
              <h2>Notifications</h2>
              <label className="check"><input type="checkbox" checked={draft.notifyOrders} onChange={(event) => setDraft({ ...draft, notifyOrders: event.target.checked })} /> New order alerts</label>
              <label className="check"><input type="checkbox" checked={draft.notifyStock} onChange={(event) => setDraft({ ...draft, notifyStock: event.target.checked })} /> Low stock alerts</label>
              <div className="profile-actions">
                <button className="primary" type="submit" disabled={busy}>Save Changes</button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
