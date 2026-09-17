import React, { useState } from 'react';
import './DashboardDriver.css';

interface DashboardDriverProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onAddUser: (draft: {
    fullName: string;
    phoneNumber: string;
    homeAddress: string;
    nin: string;
    licenseFileName?: string;
  }) => void;
}

const DashboardDriver: React.FC<DashboardDriverProps> = ({
  isOpen,
  onClose,
  onCancel,
  onAddUser
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [nin, setNin] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBrowseFile = () => {
    const fileInput = document.getElementById('driver-license-upload') as HTMLInputElement;
    fileInput?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="driver-modal-overlay">
      <div className="driver-modal-container">
        <div className="driver-modal-header">
          <div className="driver-icon-header">
            <img src="/Media/user-add-01.png" alt="Add User" className="driver-icon-img" />
          </div>
          <button className="driver-close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="driver-modal-content">
          <div className="driver-title-section">
            <h2 className="driver-modal-title">Add Driver</h2>
            <div className="driver-progress-indicator">
              <img src="/Media/Group 765.png" alt="Step 1/2" className="driver-progress-icon-img" />
            </div>
          </div>

          <div className="driver-form">
            <div className="driver-form-row">
              <div className="driver-form-group">
                <label className="driver-form-label">Full Name*</label>
                <input
                  type="text"
                  className="driver-form-input"
                  placeholder="Type full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="driver-form-group">
                <label className="driver-form-label">Phone Number*</label>
                <input
                  type="tel"
                  className="driver-form-input"
                  placeholder="Type phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="driver-form-row">
              <div className="driver-form-group">
                <label className="driver-form-label">Home Address*</label>
                <input
                  type="text"
                  className="driver-form-input"
                  placeholder="Type home address"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                />
              </div>

              <div className="driver-form-group">
                <label className="driver-form-label">NIN*</label>
                <input
                  type="text"
                  className="driver-form-input"
                  placeholder="Type NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                />
              </div>
            </div>

            <div className="driver-upload-section">
              <label className="driver-form-label">Upload Drivers License*</label>
              <div className="driver-upload-area">
                <div className="driver-upload-icon">
                  <img src="/Media/image 7.png" alt="Upload" className="driver-upload-icon-img" />
                </div>
                <div className="driver-upload-text">Max 60 MB, PNG, JPEG</div>
                <button type="button" className="driver-browse-button" onClick={handleBrowseFile}>
                  Browse File
                </button>
                <input
                  id="driver-license-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {selectedFile && (
                  <div className="driver-selected-file">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="driver-modal-actions">
            <button className="driver-action-button driver-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="driver-action-button driver-add"
              onClick={() =>
                onAddUser({
                  fullName,
                  phoneNumber,
                  homeAddress,
                  nin,
                  licenseFileName: selectedFile?.name,
                })
              }
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDriver;
