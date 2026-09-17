import React, { useEffect, useState } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../api/client";

type Props = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Tenants: React.FC<Props> = ({
  setSearchModalOpen,
  searchValue,
  setSearchValue,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  const [tenants, setTenants] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    adminName: "",
    adminPassword: "Password123!",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const load = () => {
    api("/api/v1/tenants")
      .then(setTenants)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/v1/tenants", { method: "POST", body: JSON.stringify(form) });
      setForm({
        name: "",
        slug: "",
        adminEmail: "",
        adminName: "",
        adminPassword: "Password123!",
      });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/v1/tenants/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f8fa" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        hovered={sidebarHovered}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        onSearchOpen={() => setSearchModalOpen(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <div
        style={{
          flex: 1,
          marginLeft: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: "margin-left 0.25s",
        }}
      >
        <Topbar pageTitle="Tenants" />
        <div style={{ padding: "1.5rem 2rem" }}>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            Provision and manage isolated transport operator organizations.
          </p>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Onboard new tenant</h2>
            <form onSubmit={createTenant} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
              <input
                placeholder="Organization name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                placeholder="Slug (e.g. jos-central)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                placeholder="Fleet admin full name"
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Fleet admin email"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Temp password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                required
                style={inputStyle}
              />
              <button type="submit" disabled={saving} style={btnStyle}>
                {saving ? "Creating…" : "Create tenant"}
              </button>
            </form>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={th}>Name</th>
                  <th style={th}>Slug</th>
                  <th style={th}>Status</th>
                  <th style={th}>Users</th>
                  <th style={th}>Vehicles</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={td}>{t.name}</td>
                    <td style={td}>{t.slug}</td>
                    <td style={td}>{t.status}</td>
                    <td style={td}>{t.user_count ?? "—"}</td>
                    <td style={td}>{t.vehicle_count ?? "—"}</td>
                    <td style={td}>
                      <button
                        style={linkBtn}
                        onClick={() =>
                          setStatus(t.id, t.status === "active" ? "inactive" : "active")
                        }
                      >
                        {t.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!tenants.length && (
                  <tr>
                    <td colSpan={6} style={{ ...td, color: "#9ca3af" }}>
                      No tenants yet. Start Docker API (`docker compose up`) then refresh.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
};
const btnStyle: React.CSSProperties = {
  background: "#009966",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "0.6rem 1rem",
  cursor: "pointer",
  fontWeight: 600,
};
const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#009966",
  cursor: "pointer",
  fontWeight: 600,
};
const th: React.CSSProperties = { padding: "8px 6px", color: "#6b7280", fontWeight: 600 };
const td: React.CSSProperties = { padding: "10px 6px" };

export default Tenants;
