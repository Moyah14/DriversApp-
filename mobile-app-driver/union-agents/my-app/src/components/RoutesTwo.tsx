import React from 'react';
import { FiX } from 'react-icons/fi';
import linkForwardIcon from '../Media/link-forward.png';
import './RoutesTwo.css';
const CloseIcon = FiX as unknown as React.ComponentType;

interface RouteDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  routeData?: {
    routeNumber: number;
    driverCount: number;
    parks: Array<{
      parkNumber: number;
      name: string;
      address: string;
      unionHead: string;
    }>;
    registration: {
      date: string;
      agent: string;
      status: string;
    };
    drivers: Array<{
      initials: string;
      name: string;
      plateNumber: string;
    }>;
  };
}

const defaultRouteData = {
  routeNumber: 1,
  driverCount: 50,
  parks: [
    {
      parkNumber: 1,
      name: "Jos Bus Park",
      address: "Jos North, near University of Jos and SUG spot",
      unionHead: "Samuel Ike"
    },
    {
      parkNumber: 2,
      name: "Plateau Riders Motor Park",
      address: "20 Tafawa Balewa St, Jos North",
      unionHead: "James Isa"
    }
  ],
  registration: {
    date: "26 June, 2025",
    agent: "Agent 1",
    status: "Active"
  },
  drivers: [
    { initials: "PJ", name: "Peter Jackson", plateNumber: "KJA145CK" },
    { initials: "TM", name: "Tunde Musa", plateNumber: "PL-233-ABC" },
    { initials: "SA", name: "Sani Abdullahi", plateNumber: "PL-765-KJA" },
    { initials: "FO", name: "Femi Oladipo", plateNumber: "PL-600-AFR" },
    { initials: "TO", name: "Tema Omuguga", plateNumber: "PL-330-KDH" }
  ]
};

const RoutesTwo: React.FC<RouteDetailsProps> = ({ isOpen, onClose, routeData = defaultRouteData }) => {
  if (!isOpen) return null;

  return (
    <div className="route-details-overlay" onClick={onClose}>
      <div className="route-details-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rd-header">
          <h2 className="rd-title">Route Details</h2>
          <button className="rd-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Route Information */}
        <div className="rd-section">
          <div className="rd-info-grid">
            <div className="rd-info-item">
              <span className="rd-info-label">Route {routeData.routeNumber}</span>
              <span className="rd-info-value"></span>
            </div>
            {routeData.parks.map((park, index) => (
              <React.Fragment key={index}>
                <div className="rd-info-item">
                  <span className="rd-info-label">Park {park.parkNumber}</span>
                  <span className="rd-info-value">{park.name}</span>
                </div>
                <div className="rd-info-item">
                  <span className="rd-info-label">Address</span>
                  <span className="rd-info-value">{park.address}</span>
                </div>
                <div className="rd-info-item">
                  <span className="rd-info-label">Union Head</span>
                  <span className="rd-info-value">{park.unionHead}</span>
                </div>
              </React.Fragment>
            ))}
            <div className="rd-info-item">
              <span className="rd-info-label">Date Registered</span>
              <span className="rd-info-value">{routeData.registration.date}</span>
            </div>
            <div className="rd-info-item">
              <span className="rd-info-label">Registered By</span>
              <span className="rd-info-value">{routeData.registration.agent}</span>
            </div>
            <div className="rd-info-item">
              <span className="rd-info-label">Status</span>
              <span className="rd-info-value">
                <div className="rd-status-badge">{routeData.registration.status}</div>
              </span>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div className="rd-section">
          <div className="rd-drivers-header">
            <h3 className="rd-section-title">Drivers Registered ({routeData.driverCount})</h3>
            <button className="rd-view-all-btn">View all</button>
          </div>
          <div className="rd-drivers-list">
            {routeData.drivers.map((driver, index) => (
              <div key={index} className="rd-driver-item">
                <div className="rd-driver-avatar">
                  {driver.initials}
                </div>
                <div className="rd-driver-info">
                  <div className="rd-driver-name">{driver.name}</div>
                  <div className="rd-driver-plate">{driver.plateNumber}</div>
                </div>
                <button className="rd-view-profile-btn">
                  View Profile
                  <img src={linkForwardIcon} alt="Forward" className="rd-arrow-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutesTwo;
