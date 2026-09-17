import React, { useState } from "react";
import Modal from "./Modal";
import addAgentIcon from "../pages/Dashboard Icons/Frame 914 (1).png";
import { api, getStoredUser } from "../api/client";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

async function resolveTenantId(): Promise<string | number | undefined> {
  const me = getStoredUser<any>();
  if (me?.tenantId || me?.tenant_id) return me.tenantId || me.tenant_id;
  try {
    const tenants = await api("/api/v1/tenants");
    const active = (tenants || []).find((t: any) => t.status === "active") || (tenants || [])[0];
    return active?.id;
  } catch {
    return undefined;
  }
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    homeAddress: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const tenantId = await resolveTenantId();
      await api("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          email: formData.emailAddress,
          password: "ChangeMe123!",
          fullName: formData.fullName,
          role: "AGENT",
          phone: formData.phoneNumber,
          address: formData.homeAddress,
          tenantId,
        }),
      });
      alert("Agent added successfully!");
      onClose();
      setFormData({
        fullName: "",
        phoneNumber: "",
        emailAddress: "",
        homeAddress: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to add agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Agent" icon={<img src={addAgentIcon} alt="Add Agent Icon" style={{ width: 28, height: 28 }} />}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          marginBottom: "24px",
          paddingRight: "20px"
        }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Full Name*
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Type full Name"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Phone Number*
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Type phone number"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Email Address*
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              placeholder="Type email address"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* Home Address */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Home Address*
            </label>
            <input
              type="text"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleInputChange}
              placeholder="Type home address"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {error && <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              color: "#16a34a",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              background: "#16a34a",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {saving ? "Saving..." : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAgentModal;