import React, { useRef, useState } from "react";
import "./AddDriverModal.css";
import pic from './media/Frame 914.png'
import uploadIcon from './media/document.png'

interface AddDriverModalProps {
  onClose: () => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    nin: "",
    license: null as File | null,
  });
  const [licenseName, setLicenseName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [vehicle, setVehicle] = useState({
    plate: "",
    type: "",
    route: "",
    park: "",
  });

  // Handlers for step 1
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, license: e.target.files[0] });
      setLicenseName(e.target.files[0].name);
    }
  };
  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  // Handlers for step 2
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  // Step 1 submit
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Step 2 submit
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    onClose();
  };

  return (
    <div className="add-driver-overlay">
    
      <div className="add-driver-content">
        <button className="add-driver-close" onClick={onClose}>
          &times;
        </button>
        <div className="add-driver-header">
          <div className="add-driver-icon">
          <span><img src={pic} style={{ fontSize: 40,  borderRadius: '50%', color: '#fff' }} /> </span>
          </div>

        </div>
        {step === 1 ? (
          <>
            <div className="add-driver-stepper-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 16px 0' }}>
              <div className="add-driver-title" style={{ margin: 0 }}>Add Driver</div>
              <div className="add-driver-stepper" style={{ fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="add-driver-stepper-circle">
                  <span className="add-driver-stepper-text">1/2</span>
                  <svg width="48" height="48" style={{ marginLeft: 8 }}>
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="#e0e0e0"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="#009966"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="138"
                      strokeDashoffset="69"
                    />
                  </svg>
                </div>
              </div>
             
            </div>
            <hr />
           
            <form className="add-driver-form" onSubmit={handleStep1Submit}>
              <div className="add-driver-row">
                <div className="add-driver-col">
                  <label>Full Name*</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Type full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="add-driver-col">
                  <label>Phone Number*</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Type phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="add-driver-row">
                <div className="add-driver-col">
                  <label>Home Address*</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Type home address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="add-driver-col">
                  <label>NIN*</label>
                  <input
                    type="text"
                    name="nin"
                    placeholder="Type NIN"
                    value={form.nin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <label className="add-driver-upload-label">Upload Drivers License*</label>
              <div className="add-driver-upload-box">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="add-driver-upload-icon"><img src={uploadIcon} alt="" /></div>
                <div className="add-driver-upload-info">
                  Max 60 MB, PNG, JPEG
                  {licenseName && (
                    <div className="add-driver-upload-filename">{licenseName}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="add-driver-browse-btn"
                  onClick={handleBrowse}
                >
                  Browse File
                </button>
              </div>
              <div className="add-driver-actions">
                <button
                  type="button"
                  className="add-driver-cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="add-driver-submit"
                >
                  Add User
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="add-driver-stepper-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 16px 0' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Add Driver Vehicle</div>
              <div className="add-driver-stepper" style={{ fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="add-driver-stepper-circle">
                  <span className="add-driver-stepper-text">2/2</span>
                  <svg width="48" height="48" style={{ marginLeft: 8 }}>
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="#e0e0e0"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="#009966"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="138"
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <hr />
            <form onSubmit={handleStep2Submit}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>Plate Number*</label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="Type plate number"
                    value={vehicle.plate}
                    onChange={handleVehicleChange}
                    required
                    style={{
                      width: "90%",
                      padding: "12px 14px",
                      border: "1.5px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      background: "#fafbfc",
                      marginTop: 2,
                      transition: "border 0.15s"
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>Vehicle Type*</label>
                  <select
                    name="type"
                    value={vehicle.type}
                    onChange={handleVehicleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1.5px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      background: "#fff",
                      marginTop: 2,
                      transition: "border 0.15s",
                     
                    }}
                  >
                    <option value="">Choose vehicle type</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                    <option value="tricycle">Tricycle</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>Route Plied*</label>
                  <select
                    name="route"
                    value={vehicle.route}
                    onChange={handleVehicleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1.5px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      background: "#fff",
                      marginTop: 2,
                      transition: "border 0.15s",
                     
                    }}
                  >
                    <option value="">Choose route</option>
                    <option value="jos-bukuru">Jos - Bukuru</option>
                    <option value="jos-zawan">Jos - Zawan</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>Park*</label>
                  <select
                    name="park"
                    value={vehicle.park}
                    onChange={handleVehicleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1.5px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      background: "#fff",
                      marginTop: 2,
                      transition: "border 0.15s",
                     
                    }}
                  >
                    <option value="">Choose park</option>
                    <option value="terminus">Terminus Park</option>
                    <option value="zawan">Zawan Park</option>
                  </select>
                </div>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8
              }}>
                <span
                  style={{
                    textDecoration: "underline",
                    background: "none",
                    color: "#222",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                  onClick={() => setStep(1)}
                >
                  Previous step
                </span>
                <span className="Skip"
                  style={{
                    color: "#009966",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                  
                  }}
                  onClick={onClose}
                >
                  Skip for now
                </span>
                <button
                  type="submit"
                  style={{
                    background: "#009966",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 32px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                >
                  Save Details
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddDriverModal;