import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.18)",
      backdropFilter: "blur(8px)",
      zIndex: 3000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: "3rem 3rem 2.5rem 3rem",
        minWidth: 480,
        maxWidth: 560,
        height: 320,
        position: "relative",
        textAlign: "center",
      }}>
        {/* Ellipse 32.png in top-left corner */}
        <img 
          src="/Ellipse 32.png" 
          alt="Decorative element" 
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            width: "32px",
            height: "32px",
            objectFit: "contain"
          }}
        />
        
        {/* Ellipse 33.png in bottom-right corner */}
        <img 
          src="/Ellipse 33.png" 
          alt="Decorative element" 
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            width: "32px",
            height: "32px",
            objectFit: "contain"
          }}
        />
        
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "#f3f4f6",
            border: "none",
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#000",
            fontSize: 24
          }}
          aria-label="Close"
        >×</button>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "#f6fef9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto"
        }}>
          <img src="/Frame 898.png" alt="Logout" style={{ width: "50px", height: "50px" }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Log Out</div>
        <div style={{ color: "#444", fontSize: 18, marginBottom: 36 }}>
          Are you sure you want to sign out of your account?
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              background: "#fff",
              color: "#16a34a",
              border: "1.5px solid #16a34a",
              borderRadius: 10,
              padding: "16px 32px",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            No, cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "16px 32px",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal; 