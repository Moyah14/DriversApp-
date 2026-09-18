import React from "react";
import "./AccountsTwo.css";
import { FiX, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";

const CloseIcon = FiX as unknown as React.ComponentType;
const EyeIcon = FiEye as unknown as React.ComponentType;
const DownloadIcon = FiDownload as unknown as React.ComponentType;
const TrashIcon = FiTrash2 as unknown as React.ComponentType;

export type AccountDetails = {
  name: string;
  phoneNumber: string;
  residentialAddress: string;
  nin: string;
  driversLicense: string;
};

type AccountsTwoProps = {
  isOpen: boolean;
  onClose: () => void;
  account?: AccountDetails | null;
};

const AccountsTwo: React.FC<AccountsTwoProps> = ({ isOpen, onClose, account }) => {
  if (!isOpen) return null;

  const driver = {
    name: account?.name || "—",
    phone: account?.phoneNumber || "—",
    address: account?.residentialAddress || "—",
    nin: account?.nin || "—",
    dateRegistered: "—",
    registeredBy: "—",
    status: "Active",
    cardBalance: "—",
    plateNumber: "—",
    vehicleType: "—",
    route: "—",
    park: "—",
    document: {
      name: "Drivers License",
      file: account?.driversLicense || "—",
      size: "—",
    },
  };

  return (
    <div className="account-details-overlay" onClick={onClose}>
      <div className="account-details-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="ad-close-btn" onClick={onClose} type="button">
          <CloseIcon />
        </button>
        <h2 className="ad-title">Account Details</h2>
        <div className="ad-section">
          <h3>About Driver</h3>
          <div className="ad-row">
            <span>Drivers Name</span>
            <span className="ad-value">{driver.name}</span>
          </div>
          <div className="ad-row">
            <span>Phone Number</span>
            <span className="ad-value">{driver.phone}</span>
          </div>
          <div className="ad-row">
            <span>Address</span>
            <span className="ad-value">{driver.address}</span>
          </div>
          <div className="ad-row">
            <span>NIN</span>
            <span className="ad-value">{driver.nin}</span>
          </div>
          <div className="ad-row">
            <span>Date Registered</span>
            <span className="ad-value">{driver.dateRegistered}</span>
          </div>
          <div className="ad-row">
            <span>Registered By</span>
            <span className="ad-value">{driver.registeredBy}</span>
          </div>
          <div className="ad-row">
            <span>Status</span>
            <span className="ad-status-active">{driver.status}</span>
          </div>
          <div className="ad-row">
            <span>Card Balance</span>
            <span className="ad-value ad-balance">{driver.cardBalance}</span>
          </div>
        </div>
        <div className="ad-section">
          <h3>About Vehicle</h3>
          <div className="ad-row">
            <span>Plate Number</span>
            <span className="ad-value">{driver.plateNumber}</span>
          </div>
          <div className="ad-row">
            <span>Vehicle Type</span>
            <span className="ad-value">{driver.vehicleType}</span>
          </div>
          <div className="ad-row">
            <span>Route</span>
            <span className="ad-value">{driver.route}</span>
          </div>
          <div className="ad-row">
            <span>Park</span>
            <span className="ad-value">{driver.park}</span>
          </div>
        </div>
        <div className="ad-section">
          <h3>Uploaded Document</h3>
          <div className="ad-doc">
            <div className="ad-doc-icon">
              <span role="img" aria-label="file">📄</span>
            </div>
            <div className="ad-doc-info">
              <div className="ad-doc-title">{driver.document.name}</div>
              <div className="ad-doc-meta">
                {driver.document.file} &nbsp;|&nbsp; {driver.document.size}
              </div>
            </div>
            <div className="ad-doc-actions">
              <button title="View" type="button"><EyeIcon /></button>
              <button title="Download" type="button"><DownloadIcon /></button>
              <button title="Delete" type="button"><TrashIcon /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsTwo;
