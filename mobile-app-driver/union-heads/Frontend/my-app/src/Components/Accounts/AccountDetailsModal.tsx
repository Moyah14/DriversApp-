import React, { useState, useEffect } from 'react';
import './AccountDetailsModal.css';
import documentIcon from './media/document2.png'
import eyeIcon from './media/eye.png'
import downloadCircularIcon from './media/downloadCircle.png'
import deleteIcon from './media/deleteCircle.png'


interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    name: string;
    phoneNumber: string;
    residentialAddress: string;
    nin: string;
    driversLicense: string;
  } | null;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ isOpen, onClose, account }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match the slideOut animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the slideOut animation duration
  };

  if (!shouldRender || !account) return null;

  return (
    <div className="account-modal-overlay" onClick={handleClose}>
      <div className={`account-modal-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="account-modal-header">
          <h2 className="account-modal-title">Account Details</h2>
          <button className="account-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="account-modal-body">
          {/* About Driver Section */}
          <div className="detail-section2">
            <h3 className="section-title">About Driver</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Drivers Name:</span>
                <span className="detail-value">{account.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{account.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{account.residentialAddress}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">NIN:</span>
                <span className="detail-value">{account.nin}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Registered:</span>
                <span className="detail-value">26 June, 2025</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registered By:</span>
                <span className="detail-value">Agent 1</span>
              </div>
            </div>
            <div className="">
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="status-badge active">Active</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Card Balance:</span>
                <span className="detail-value balance">N250,700.00</span>
              </div>
            </div>
          </div>

          {/* About Vehicle Section */}
          <div className="detail-section1">
            <h3 className="section-title">About Vehicle</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Plate Number:</span>
                <span className="detail-value">KJA145CK</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vehicle Type:</span>
                <span className="detail-value">Bus (Danfo)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Route:</span>
                <span className="detail-value">Abuja ⇌ Lagos</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Park:</span>
                <span className="detail-value">Rose Park Bus Stop</span>
              </div>
            </div>
          </div>

          {/* Uploaded Document Section */}
          <div className="detail-section">
            <h3 className="section-title">Uploaded Document</h3>
            <div className="document-item">
              <div className="document-info">
                <div className="document-icon"><img src={documentIcon} alt="" /></div>
                <div className="document-details">
                  <span className="document-name">Drivers License</span>
                  <div document-details1>
                  <span className="document-filename">{account.driversLicense}</span>
                  <span className="document-size">2.65 MB</span>
                  </div>
                </div>
              </div>
              <div className="document-actions">
                <button className="eyes" title="View">
                  <img src={eyeIcon} alt="" />
                </button>
                <button className="download1" title="Download">
                  <img src={downloadCircularIcon} alt="" />
                </button>
                <button className="delete1" title="Delete">
                  <img src={deleteIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsModal; 