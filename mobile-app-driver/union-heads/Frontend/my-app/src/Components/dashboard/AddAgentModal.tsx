import React from 'react';
import './AddAgentModal.css'; // Create and style as needed
import pic from './media/Frame 914.png'

interface AddAgentModalProps {
  onClose: () => void;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ onClose }) => {
  return (
    <div className="agent-modal-overlay">
      <div className="agent-modal-content">
        <div className="agent-modal-header1">
        <button className="agent-modal-close1" onClick={onClose}>×</button>
        
        <div className="agent-modal-icon">
         <img src={pic} style={{ fontSize: 40,  borderRadius: '50%', color: '#fff' }} />
        </div>
        <h2 className="agent-modal-icon">Add Agent</h2>
        </div>
        <form>
          <div className="agent-modal-form-row">
            <div>
              <label>Full Name*</label>
              <input type="text" placeholder="Type full Name" />
            </div>
            <div>
              <label>Phone Number*</label>
              <input type="text" placeholder="Type phone number" />
            </div>
          </div>
          <div className="agent-modal-form-row">
            <div>
              <label>Email Address*</label>
              <input type="email" placeholder="Type email address" />
            </div>
            <div>
              <label>Home Address*</label>
              <input type="text" placeholder="Type home address" />
            </div>
          </div>
          <div className="agent-modal-actions">
            <button type="button" className="agent-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="agent-modal-submit">Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAgentModal;