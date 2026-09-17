import React from "react";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: "1.5rem 2rem",
      minWidth: 200,
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
      position: "relative"
    }}
  >
    <div style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
      <span style={{ fontSize: 24, fontWeight: 700 }}>{value}</span>
      {icon && <span style={{ marginLeft: 12 }}>{icon}</span>}
    </div>
  </div>
);

export default SummaryCard;