import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo">
          <img src="/Media/Plateau Logo.png" alt="Plateau State Logo" />
        </div>
      </div>

                    <input type="text" placeholder="Search..." className="search-input" />

      <nav className="navigation">
        <div 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <img src="/Media/dashboard-square-01.png" alt="Dashboard" />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'fleet' ? 'active' : ''}`}
          onClick={() => onNavigate('fleet')}
        >
          <img src="/Media/road.png" alt="Fleet" />
          <span>Fleet</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'live' ? 'active' : ''}`}
          onClick={() => onNavigate('live')}
        >
          <img src="/Media/analytics-02.png" alt="Live" />
          <span>Live Tracking</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'scorecards' ? 'active' : ''}`}
          onClick={() => onNavigate('scorecards')}
        >
          <img src="/Media/analytics-02.png" alt="Scorecards" />
          <span>Scorecards</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'alerts' ? 'active' : ''}`}
          onClick={() => onNavigate('alerts')}
        >
          <img src="/Media/customer-service-02.png" alt="Alerts" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          <span>Alerts</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'my-score' ? 'active' : ''}`}
          onClick={() => onNavigate('my-score')}
        >
          <img src="/Media/user-group-03.png" alt="My Score" />
          <span>My Score</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'accounts' ? 'active' : ''}`}
          onClick={() => onNavigate('accounts')}
        >
          <img src="/Media/user-group-03.png" alt="Accounts" />
          <span>Accounts</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'payments' ? 'active' : ''}`}
          onClick={() => onNavigate('payments')}
        >
          <img src="/Media/money-bag-02.png" alt="Payments" />
          <span>Payments</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'routes' ? 'active' : ''}`}
          onClick={() => onNavigate('routes')}
        >
          <img src="/Media/road.png" alt="Routes" />
          <span>Routes</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <img src="/Media/analytics-02.png" alt="Analytics" />
          <span>Analytics</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <img src="/Media/settings-01 (1).png" alt="Settings" onError={(e) => console.log('Settings icon failed to load:', e)} />
          <span>Settings</span>
        </div>
      </nav>

      <div className="logout-section">
        <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <img src="/Media/logout-01.png" alt="Logout" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 