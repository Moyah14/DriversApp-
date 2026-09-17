import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import addUnionHeadIcon from "../pages/Dashboard Icons/Frame 914 (1).png";
import { api, getStoredUser } from "../api/client";
import { mapParkRow } from "../utils/apiMappers";

interface AddUnionHeadModalProps {
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

const AddUnionHeadModal: React.FC<AddUnionHeadModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    homeAddress: "",
    park: ""
  });
  const [parks, setParks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api("/api/v1/parks")
      .then((rows) => setParks((rows || []).map(mapParkRow)))
      .catch(() => setParks([]));
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          role: "UNION_HEAD",
          phone: formData.phoneNumber,
          address: formData.homeAddress,
          parkId: formData.park || undefined,
          tenantId,
        }),
      });
      alert("Union Head added successfully!");
      onClose();
      setFormData({
        fullName: "",
        phoneNumber: "",
        emailAddress: "",
        homeAddress: "",
        park: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to add union head");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Union Head" icon={<img src={addUnionHeadIcon} alt="Add Union Head Icon" style={{ width: 28, height: 28 }} />}>
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

          {/* Park */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333"
            }}>
              Park*
            </label>
            <select
              name="park"
              value={formData.park}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "#fff"
              }}
            >
              <option value="">Choose park</option>
              {parks.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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

export default AddUnionHeadModal;