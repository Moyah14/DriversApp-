import React from 'react';
import './AccountAgentModal.css';
import forward from './media/link-forward.png';

interface Driver {
  id: string;
  name: string;
  plate: string;
}

interface AccountAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    name: string;
    phone: string;
    address: string;
    email: string;
    dateRegistered: string;
    status: string;
    drivers: Driver[];
  } | null;
}

const AccountAgentModal: React.FC<AccountAgentModalProps> = ({ isOpen, onClose, agent }) => {
  if (!isOpen || !agent) return null;

  return (
    <div className="account-agent-modal-overlay" onClick={onClose}>
      <div className="account-agent-modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="account-agent-modal-header">
          <h2 className="account-agent-modal-title">Account Details</h2>
          <button className="account-agent-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="account-agent-modal-body">
          {/* About Agent */}
          <div className="account-agent-section">
            <h3 className="account-agent-section-title">About Agent</h3>
            <div className="account-agent-info-grid">
              <div className="account-agent-info-label">Agent Name</div>
              <div className="account-agent-info-value">{agent.name}</div>
              <div className="account-agent-info-label">Phone Number</div>
              <div className="account-agent-info-value">{agent.phone}</div>
              <div className="account-agent-info-label">Address</div>
              <div className="account-agent-info-value">{agent.address}</div>
              <div className="account-agent-info-label">Email Address</div>
              <div className="account-agent-info-value">{agent.email}</div>
              <div className="account-agent-info-label">Date Registered</div>
              <div className="account-agent-info-value">{agent.dateRegistered}</div>
              <div className="account-agent-info-label">Status</div>
              <div className="account-agent-status">{agent.status}</div>
            </div>
          </div>
          {/* Drivers Registered */}
          <div className="account-agent-section">
            <h3 className="account-agent-section-title">Drivers Registered ({agent.drivers.length})</h3>
            <div className="account-agent-drivers-list">
              {agent.drivers.slice(0, 5).map(driver => (
                <div key={driver.id} className="account-agent-driver-item">
                  <div className="account-agent-driver-avatar">
                    {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="account-agent-driver-info">
                    <div className="account-agent-driver-name">{driver.name}</div>
                    <div className="account-agent-driver-plate">{driver.plate}</div>
                  </div>
                  <button className="account-agent-driver-profile-btn">
                    View Profile <span className="account-agent-driver-arrow"><img src={forward} alt="" /></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className='Addon'> Load More</div>
        </div>
      
      </div>
      
    </div>
  );
};

export default AccountAgentModal;
