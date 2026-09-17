import React, { useEffect, useState, ChangeEvent } from "react";
import Modal from "./Modal";
import addDriverIcon from "../pages/Dashboard Icons/Frame 914 (1).png";
import busIcon from "../pages/Dashboard Icons/Frame 914.png";
import { api, getStoredUser } from "../api/client";
import { mapParkRow, mapRouteRow } from "../utils/apiMappers";

interface AddDriverModalProps {
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

const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    homeAddress: "",
    nin: "",
    licenseFile: null as File | null,
    plateNumber: "",
    vehicleType: "",
    route: "",
    park: ""
  });
  const [parks, setParks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api("/api/v1/parks")
      .then((rows) => setParks((rows || []).map(mapParkRow)))
      .catch(() => setParks([]));
    api("/api/v1/routes")
      .then((rows) => setRoutes((rows || []).map(mapRouteRow)))
      .catch(() => setRoutes([]));
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "licenseFile" && files) {
      setFormData(prev => ({ ...prev, licenseFile: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePrev = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const tenantId = await resolveTenantId();
      const emailSlug = formData.fullName.toLowerCase().replace(/\s+/g, ".") || "driver";
      await api("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          email: `${emailSlug}.${Date.now()}@drivers.local`,
          password: "ChangeMe123!",
          fullName: formData.fullName,
          role: "DRIVER",
          phone: formData.phoneNumber,
          nin: formData.nin,
          address: formData.homeAddress,
          licenseRef: formData.licenseFile?.name,
          plateNumber: formData.plateNumber,
          vehicleType: formData.vehicleType,
          parkId: formData.park || undefined,
          routeId: formData.route || undefined,
          tenantId,
        }),
      });
      alert("Driver added successfully!");
      onClose();
      setStep(1);
      setFormData({
        fullName: "",
        phoneNumber: "",
        homeAddress: "",
        nin: "",
        licenseFile: null,
        plateNumber: "",
        vehicleType: "",
        route: "",
        park: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to add driver");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Add Driver" : "Add Driver Vehicle"}
      icon={step === 1 ? <img src={addDriverIcon} alt="Add Driver Icon" style={{ width: 28, height: 28 }} /> : <img src={busIcon} alt="Add Driver Vehicle Icon" style={{ width: 28, height: 28 }} />}
    >
      <form onSubmit={step === 1 ? handleNext : handleSubmit}>
        {step === 1 ? (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              marginBottom: "24px",
              paddingRight: "20px"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Full Name*</label>
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
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Phone Number*</label>
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
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Home Address*</label>
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
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>NIN*</label>
                <input
                  type="text"
                  name="nin"
                  value={formData.nin}
                  onChange={handleInputChange}
                  placeholder="Type NIN"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 8 }}>Upload Drivers License*</label>
                <div style={{
                  border: "1px dashed #bbb",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  background: "#fafbfc"
                }}>
                  <input
                    type="file"
                    name="licenseFile"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleInputChange}
                    required
                    style={{ display: "none" }}
                    id="license-upload"
                  />
                  <img 
                    src="/AddDriver.png" 
                    alt="Upload drivers license"
                    style={{
                      width: "48px",
                      height: "48px",
                      marginBottom: "16px"
                    }}
                  />
                  <div style={{ marginBottom: 8, color: "#888", fontSize: 13 }}>
                    Max 60 MB, PNG, JPEG
                  </div>
                  <label htmlFor="license-upload" style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "#16a34a",
                    color: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 500
                  }}>
                    Browse File
                  </label>
                  {formData.licenseFile && (
                    <div style={{ marginTop: 8, color: "#16a34a", fontSize: 13 }}>
                      {formData.licenseFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
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
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              marginBottom: "24px",
              paddingRight: "20px"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Plate Number*</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  placeholder="Type plate number"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Vehicle Type*</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "#fff"
                  }}
                >
                  <option value="">Choose vehicle type</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Route Plied*</label>
                <select
                  name="route"
                  value={formData.route}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "#fff"
                  }}
                >
                  <option value="">Choose route</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Park*</label>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  padding: "12px 24px",
                  background: "none",
                  border: "none",
                  color: "black",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Previous step
              </button>
              <div style={{ display: "flex", gap: "12px" }}>
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
                  Skip for now
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
                  {saving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </div>
          </>
        )}
      </form>
      {/* Step indicator */}
      <div style={{
        position: "absolute",
        top: "90px",
        right: "32px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeDasharray={`${(step / 2) * 131.88} 131.88`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: "absolute",
          fontWeight: 600,
          fontSize: "16px",
          color: "#16a34a"
        }}>
          {step}/2
        </div>
      </div>
    </Modal>
  );
};

export default AddDriverModal;