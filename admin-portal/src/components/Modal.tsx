import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "24px",
        padding: "2.5rem",
        maxWidth: "700px",
        width: "90%",
        maxHeight: "90vh",
        overflow: "auto",
        position: "relative"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "28px"
            }}>
              {icon || "+"}
            </div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
              {title}
            </h2>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: "#e5e7eb",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            position: "absolute",
            top: "24px",
            right: "24px"
          }}
        >
          ×
        </button>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default Modal;