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

const AuditLogs: React.FC<Props> = ({
  setSearchModalOpen,
  searchValue,
  setSearchValue,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isCollapsed = sidebarCollapsed && !sidebarHovered;
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const onResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api("/api/v1/audit")
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, []);

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
        <Topbar pageTitle="Audit Logs" />
        <div style={{ padding: "1.5rem 2rem" }}>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            Immutable trail of authentication events, tenant actions, and policy changes.
          </p>
          {error && <div style={{ color: "#991b1b", marginBottom: 12 }}>{error}</div>}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={th}>Time</th>
                  <th style={th}>Actor</th>
                  <th style={th}>Action</th>
                  <th style={th}>Resource</th>
                  <th style={th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={td}>{new Date(l.created_at).toLocaleString()}</td>
                    <td style={td}>{l.actor_name || l.actor_email || "—"}</td>
                    <td style={td}>{l.action}</td>
                    <td style={td}>{l.resource || "—"}</td>
                    <td style={{ ...td, maxWidth: 320 }}>
                      {typeof l.details === "object"
                        ? JSON.stringify(l.details)
                        : String(l.details || "")}
                    </td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan={5} style={{ ...td, color: "#9ca3af" }}>
                      No audit events yet. Start the API and sign in to generate logs.
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

const th: React.CSSProperties = { padding: "10px 12px", color: "#6b7280" };
const td: React.CSSProperties = { padding: "10px 12px" };

export default AuditLogs;
