import React from 'react';
import './RouteDetails.css';
import linkForward from '../media/link-forward.png';

interface Driver {
  id: string;
  name: string;
  license: string;
  avatar: string;
}

interface RouteDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  route: {
    id: number | string;
    name: string;
    park1: {
      name: string;
      address: string;
      unionHead: string;
    };
    park2: {
      name: string;
      address: string;
      unionHead: string;
    };
    dateRegistered: string;
    registeredBy: string;
    status: string;
    drivers: Driver[];
  } | null;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ isOpen, onClose, route }) => {
  if (!isOpen || !route) return null;

  return (
    <div className="route-info-overlay">
      <div className="route-info-modal">
        {/* Header */}
        <div className="route-info-header">
          <h2 className="route-info-title">Route Details</h2>
          <button className="route-info-close" onClick={onClose}>
            <span className="route-close-icon">×</span>
          </button>
        </div>

        {/* Route Details Section */}
        <div className="route-info-section">
          <h3 className="route-info-name">{route.name}</h3>
          
          <div className="route-park-details">
            <div className="route-park-item">
              <div className="route-info-table">
                <div className="route-info-row">
                <h4 className="route-park-label1">Park 1:</h4>
                  <span className="route-info-value">{route.park1.name}</span>
                </div>
                <div className="route-info-row">
                  <span className="route-info-label">Address:</span>
                  <span className="route-info-value">{route.park1.address}</span>
                </div>
                <div className="route-info-row">
                  <span className="route-info-label">Union Head:</span>
                  <span className="route-info-value">{route.park1.unionHead}</span>
                </div>
              </div>
            </div>
            
            <div className="route-park-item">
              
              <div className="route-info-table">
                <div className="route-info-row">
                <h4 className="route-park-label">Park 2:</h4>
                  <span className="route-info-value">{route.park2.name}</span>
                </div>
                <div className="route-info-row">
                  <span className="route-info-label">Address:</span>
                  <span className="route-info-value">{route.park2.address}</span>
                </div>
                <div className="route-info-row">
                  <span className="route-info-label">Union Head:</span>
                  <span className="route-info-value">{route.park2.unionHead}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="route-details-info">
            <div className="route-info-table">
              <div className="route-info-row">
                <span className="route-info-label">Date Registered:</span>
                <span className="route-info-value">{route.dateRegistered}</span>
              </div>
              <div className="route-info-row">
                <span className="route-info-label">Registered By:</span>
                <span className="route-info-value">{route.registeredBy}</span>
              </div>
              <div className="route-info-row">
                <span className="route-info-label">Status:</span>
                <span className="route-status-active">{route.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Registered Section */}
        <div className="route-drivers-section">
          <div className="route-drivers-header">
            <h3 className="route-drivers-title">Drivers Registered ({route.drivers.length})</h3>
            <button className="route-view-all-btn">View all</button>
          </div>
          
          <div className="route-drivers-list">
            {route.drivers.map((driver) => (
              <div key={driver.id} className="route-driver-item">
                <div className="route-driver-avatar">
                  <span className="route-driver-initials">{driver.avatar}</span>
                </div>
                <div className="route-driver-info">
                  <div className="route-driver-name-plate">
                    <span className="route-driver-name">{driver.name}</span>
                    <span className="route-driver-separator">|</span>
                    <span className="route-driver-license">{driver.license}</span>
                  </div>
                </div>
                <button className="route-view-profile-btn">
                  <span>View Profile</span>
                  <span className="route-arrow-icon"><img src={linkForward} alt="" /></span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;

