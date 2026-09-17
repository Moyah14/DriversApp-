import React from "react";

interface TimelineStep {
  title: string;
  description: string;
  time: string;
  completed: boolean;
}

interface PaymentHistoryItem {
  type: string;
  amount: string;
  status: "Success" | "Failed";
  date: string;
  reference: string;
}

interface PaymentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null;
}

const PaymentDetailsDrawer: React.FC<PaymentDetailsDrawerProps> = ({ isOpen, onClose, payment }) => {
  const [showCopyToast, setShowCopyToast] = React.useState(false);

  if (!isOpen || !payment) return null;

  // Example timeline and history (replace with real data as needed)
  const timeline: TimelineStep[] = [
    {
      title: "Transaction Initiated",
      description: payment.type === "Deposit" ? "Agent / Zentraa initiated payment" : "Card swiped at bus stop",
      time: "26 Jun, 2025 12:26 PM",
      completed: true,
    },
    {
      title: "Transaction Pending",
      description: "Awaiting payment authorization",
      time: "26 Jun, 2025 12:28 PM",
      completed: true,
    },
    {
      title: "Transaction Completed",
      description: payment.type === "Deposit" ? "Deposit received" : "Payment received",
      time: "26 Jun, 2025 12:30 PM",
      completed: payment.status === "Success",
    },
  ];

  const paymentHistory: PaymentHistoryItem[] = [
    {
      type: "Card Payment",
      amount: "N1,000.00",
      status: "Success",
      date: "26 Jun, 2025",
      reference: "#10000",
    },
    {
      type: "Wallet Deposit",
      amount: "N20,000.00",
      status: "Success",
      date: "26 Jun, 2025",
      reference: "#20000",
    },
    {
      type: "Card Payment",
      amount: "N1,000.00",
      status: "Success",
      date: "26 Jun, 2025",
      reference: "#10001",
    },
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
          background: "rgba(0,0,0,0.1)",
          backdropFilter: "blur(8px)",
          zIndex: 2000,
        }}
        onClick={onClose}
      />
      
      {/* Payment Details Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 480,
          height: "100vh",
          background: "#fff",
          boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
          zIndex: 3000,
          padding: "2rem",
          overflowY: "auto",
          transition: "right 0.3s",
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
            background: "#e5e7eb",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            width: 40,
            height: 40,
            borderRadius: "50%",
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h2 style={{ marginTop: 0, marginBottom: 32, fontSize: 24, fontWeight: 700, color: "#111827" }}>
          Payment Details
        </h2>

        {/* Amount with icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#f3e8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 28, color: "#a21caf", fontWeight: "bold" }}>₦</span>
          </div>
          <div>
            <div style={{ fontSize: 16, color: "#6b7280", marginBottom: 4 }}>Amount</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{payment.amount}</div>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Driver's Name</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{payment.name}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>ID Number</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{payment.idNumber}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Phone Number</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>07034567390</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Transaction Type</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{payment.type}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Amount</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>N25,000.00</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Date</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>26 June, 2025</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Reference ID</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                1234567890 
                <img 
                  src="/copy-01.png" 
                  alt="copy" 
                  style={{ 
                    color: "#16a34a", 
                    cursor: "pointer", 
                    width: "16px", 
                    height: "16px",
                    filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)"
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText("1234567890");
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2000);
                  }}
                  title="Copy to clipboard"
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>Status</div>
              <div>
                <span style={{
                  color: payment.status === "Success" ? "#16a34a" : payment.status === "Pending" ? "#f59e0b" : "#dc2626",
                  background: payment.status === "Success" ? "#dcfce7" : payment.status === "Pending" ? "#fef3c7" : "#fee2e2",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontWeight: 500,
                  fontSize: 13,
                }}>{payment.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#111827" }}>Timeline</h4>
          <div style={{ position: "relative" }}>
            {timeline.map((step, idx) => (
              <div key={idx} style={{ marginBottom: 28, position: "relative" }}>
                {/* Vertical line */}
                <div style={{
                  position: "absolute",
                  left: 14,
                  top: 28,
                  width: 2,
                  height: idx === timeline.length - 1 ? 0 : 28,
                  background: "#16a34a",
                  zIndex: 1
                }} />
                
                {/* Circle with checkmark */}
                <span style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: step.completed ? "#16a34a" : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  border: step.completed ? "none" : "2px solid #e5e7eb",
                  zIndex: 2
                }}>
                  ✓
                </span>
                
                {/* Content */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginLeft: 48 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 4 }}>{step.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 2 }}>{step.description}</div>
                  </div>
                  <div style={{ color: "#111827", fontSize: 12, fontWeight: 600, marginLeft: 16, textAlign: "right", minWidth: "120px" }}>
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h4 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#111827" }}>Payment History</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {paymentHistory.map((item, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 16, 
                padding: "16px 0",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4a5d23",
                  fontSize: 16,
                }}>
                  ↑
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 2 }}>{item.type}</div>
                  <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 500 }}>Successful</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 2 }}>{item.amount}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>{item.date}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button style={{ 
                background: "none", 
                border: "none", 
                color: "#16a34a", 
                cursor: "pointer", 
                fontWeight: 500,
                fontSize: 14,
                padding: "8px 16px",
                borderRadius: 8,
                textDecoration: "underline"
              }}>
                Load More
              </button>
            </div>
          </div>
        </div>

        {/* Copy Toast Notification - Bottom Center of Screen */}
        {showCopyToast && (
          <div style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16a34a",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 4000,
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
            whiteSpace: "nowrap"
          }}>
            Reference Number Copied!
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentDetailsDrawer; 