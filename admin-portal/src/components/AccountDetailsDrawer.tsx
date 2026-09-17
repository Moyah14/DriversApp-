import React from "react";
import { DriverType } from "../types/driver";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverType | null;
}

const AccountDetailsDrawer: React.FC<Props> = ({ isOpen, onClose, driver }) => {
  if (!isOpen || !driver) return null;

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
      <h2 style={{ marginTop: 0 }}>Account Details</h2>
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#333" }}>About Driver</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Drivers Name</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Phone Number</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.phone}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Address</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333", textAlign: "right", maxWidth: "60%" }}>{driver.address}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>NIN</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.nin}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Date Registered</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.dateRegistered}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Registered By</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.registeredBy}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Status</span>
            <span
              style={{
                color: driver.status === "Active" ? "#16a34a" : "#991b1b",
                background: driver.status === "Active" ? "#dcfce7" : "#fee2e2",
                padding: "4px 12px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              {driver.status}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Card Balance</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.cardBalance}</span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#333" }}>About Vehicle</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Plate Number</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.vehicle.plateNumber}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Vehicle Type</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.vehicle.type}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Route</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>Abuja</span>
              <img src="/arrow-reload-horizontal.png" alt="to and fro" style={{ width: 16, height: 16 }} />
              <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>Lagos</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 14 }}>Park</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>{driver.vehicle.park}</span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#333" }}>Uploaded Document</h4>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: "#ef4444",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            📄
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#333", marginBottom: 2 }}>Drivers License</div>
            <div style={{ fontSize: 12, color: "#888" }}>{driver.licenseFile.name} | {driver.licenseFile.size}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{
                width: 32,
                height: 32,
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <img src="/view.png" alt="view" style={{ width: 16, height: 16 }} />
            </button>
            <button
              style={{
                width: 32,
                height: 32,
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <img src="/download-03 (1).png" alt="download" style={{ width: 16, height: 16 }} />
            </button>
            <button
              style={{
                width: 32,
                height: 32,
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <img src="/delete-02.png" alt="delete" style={{ width: 16, height: 16 }} />
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

export default AccountDetailsDrawer;