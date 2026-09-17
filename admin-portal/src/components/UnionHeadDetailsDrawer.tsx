import React from "react";
import { UnionHeadType } from "../types/unionHead";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unionHead: UnionHeadType | null;
}

const UnionHeadDetailsDrawer: React.FC<Props> = ({ isOpen, onClose, unionHead }) => {
  if (!isOpen || !unionHead) return null;

  // Mock data for drivers managed by this union head
  const mockDrivers = [
    { id: 1, name: "Peter Jackson", initials: "PJ", identifier: "KJA145CK" },
    { id: 2, name: "Samuel Yahaya", initials: "SY", identifier: "KJA145CL" },
    { id: 3, name: "David Iwowari", initials: "DI", identifier: "KJA145CM" },
    { id: 4, name: "John Doe", initials: "JD", identifier: "KJA145CN" },
    { id: 5, name: "Jane Smith", initials: "JS", identifier: "KJA145CO" },
  ];

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(4px)",
          zIndex: 1999,
        }}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          height: "100vh",
          background: "#fff",
          boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
          zIndex: 2000,
          padding: "2rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderTopLeftRadius: 24,
        }}
      >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "none",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Union Head Details</h2>
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#333" }}>About Union Head</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Union Head Name</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{unionHead.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Phone Number</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{unionHead.phone}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Address</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333", textAlign: "right", maxWidth: "60%" }}>{unionHead.address}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Park</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{unionHead.park}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Date Registered</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{unionHead.dateRegistered}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Status</span>
            <span
              style={{
                color: unionHead.status === "Active" ? "#16a34a" : "#991b1b",
                background: unionHead.status === "Active" ? "#dcfce7" : "#fee2e2",
                padding: "4px 12px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              {unionHead.status}
            </span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#333" }}>Drivers Managed ({mockDrivers.length})</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mockDrivers.map((driver) => (
            <div key={driver.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              padding: "12px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: "#16a34a",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 12
              }}>
                {driver.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>
                  {driver.name} | {driver.identifier}
                </div>
              </div>
              <button style={{
                background: "#fff",
                border: "1px solid #16a34a",
                color: "#16a34a",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                View Profile
                <img src="/link-forward.png" alt="forward" style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "underline"
            }}>
              Load More
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 32, justifyContent: "flex-end" }}>
        <div style={{ display: "flex", gap: 16, width: "75%" }}>
          <button
            style={{
              flex: 1,
              background: "#fff",
              color: "#16a34a",
              border: "1px solid #16a34a",
              borderRadius: 12,
              padding: "14px 0",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Suspend Account
          </button>
          <button
            style={{
              flex: 1,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 0",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default UnionHeadDetailsDrawer;