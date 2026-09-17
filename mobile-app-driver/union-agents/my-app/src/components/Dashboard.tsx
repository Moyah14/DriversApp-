import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AddDriverModal from './AddDriverModal';
import DashboardAuthorize from './DashboardAuthorize';
import DashboardTopUp from './DashboardTop-Up';
import DashboardAddDriver from './DashboardAddDriver';
import DashboardDriver from './DashboardDriver';
import Sidebar from './Sidebar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showAddDriverVehicleModal, setShowAddDriverVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topUpPayload, setTopUpPayload] = useState<import('./DashboardTop-Up').TopUpLookupResult | null>(null);
  const [driverDraft, setDriverDraft] = useState<any>(null);

  const handleNavigation = (view: string) => {
    navigate(`/${view}`);
  };

  const data = [
    { name: 'Sept 2', value: 2300 },
    { name: 'Sept 3', value: 2600 },
    { name: 'Sept 5', value: 6000 },
    { name: 'Sept 8', value: 900, type: 'poor' },
    { name: 'Sept 10', value: 7500, type: 'highest', label: '12pm-5pm' },
    { name: 'Sept 13', value: 4000 },
    { name: 'Sept 25', value: 6000 },
    { name: 'Sept 33', value: 2000 },
    { name: 'Sept', value: 2000 },
  ];

  const historyData = [
    { name: 'Ibrahim Musa', id: '73102987411', phone: '0806 123 4567', plate: 'PL-233-ABC', park: 'Jos – BukuruTerminus Park' },
    { name: 'Musa Abdullahi', id: '76301928831', phone: '0703 111 9991', plate: 'PL-765-KJA', park: 'Jos – Zawan Road Garage' },
    { name: 'Femi Oladipo', id: '83372890134', phone: '0814 998 4567', plate: 'PL-600-AFR', park: 'Jos – BauchiTerminus Park' },
    { name: 'Tema Omuguga', id: '66732190045', phone: '08178882101', plate: 'PL-330-KDH', park: 'Jos-Langtang Road Garage' },
  ];

  const filteredHistory = historyData.filter(row =>
    Object.values(row).some(val => val.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBarColor = (type?: string) => {
    if (type === 'poor') return '#ff2d7a';      // Pink
    if (type === 'highest') return '#8b5cf6';   // Purple
    return '#e5e7eb';                           // Light gray
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const type = data[index]?.type;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={getBarColor(type)}
      />
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, index } = props;
    const label = data[index]?.label;
    if (!label) return <g />;
    return (
      <g>
        <foreignObject x={x + width / 2 - 30} y={y - 30} width={60} height={24}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '2px 8px',
            fontSize: 12,
            color: '#222',
            textAlign: 'center'
          }}>
            {label}
          </div>
        </foreignObject>
      </g>
    );
  };

  const activityData = [
    {
      name: 'Kemi Ogunleye',
      avatar: '/Media/Group 207.png',
      plate: 'PL-233-ABC',
      time: 'Just now',
    },
    {
      name: 'Tunde Akinwale',
      avatar: '/Media/Tunde.png',
      plate: 'PL-233-WTD',
      time: 'Just now',
    },
    {
      name: 'Sani Mohammed',
      avatar: '/Media/Sani.png',
      plate: 'PL-445-MSK',
      time: 'Just now',
    },
  ];

  // Dummy data for the week
  const earningsData = [
    { day: 'Sun', value: 5000 },
    { day: 'Mon', value: 53000 },
    { day: 'Tue', value: 25000 },
    { day: 'Wed', value: 15000 },
    { day: 'Thurs', value: 27000 },
    { day: 'Fri', value: 10000 },
    { day: 'Sat', value: 32000 },
  ];

  return (
    <div className={`dashboard${darkMode ? ' dark' : ''}`}> 
              <Sidebar activeView={'dashboard'} onNavigate={handleNavigation} />
      <main className="main-content">
        {/* Top Header */}
        <div className="top-header">
          <div className="header-left">
            <h1 className="main-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="header-icons">
              <div className="theme-toggle-container">
                <button 
                  className={`theme-toggle-btn ${!darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(false)}
                >
                  <img src="/Media/LIGHT CIRCLE.png" alt="Light Mode" className="theme-icon" />
                </button>
                <button 
                  className={`theme-toggle-btn ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(true)}
                >
                  <img src="/Media/vector.png" alt="Dark Mode" className="theme-icon" />
                </button>
              </div>
              <img src="/Media/Notification bell.png" alt="Notifications" className="notification-bell" />
            </div>
            <div className="profile-section">
              <div className="profile-avatar">
                <img src="/Media/Profile Image.png" alt="Profile" className="profile-image" />
              </div>
              <div className="profile-info">
                <span className="profile-name">Ibrahim Musa</span>
                <span className="profile-email">ibrahim.Musa@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h2 className="welcome-title">Hi, Musa</h2>
            <p className="welcome-subtitle">Welcome to your Dashboard</p>
          </div>
          <div className="action-buttons">
            <button className="action-btn download-btn">
              <img src="/Media/download-04.png" alt="Download" />
              Download Report
            </button>
            <button 
              className="action-btn driver-btn"
              onClick={() => setShowDriverModal(true)}
            >
              <img src="/Media/+.png" alt="Add" />
              + New Driver
            </button>
            <button 
              className="action-btn topup-btn"
              onClick={() => setShowTopUpModal(true)}
            >
              <img src="/Media/download-04.png" alt="Top-up" />
              Top-Up Card
            </button>
          </div>
        </div>
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Statistics Cards */}
          <div className="stats-row">
            <div className="stat-card stat-card-horizontal">
              <div className="stat-content stat-content-left">
                <div className="stat-label">Total Drivers</div>
                <div className="stat-number">502</div>
                <div className="stat-period">June 2025</div>
              </div>
              <div className="stat-icon-bg">
                                 <img src="/Media/Group 921.png" alt="Drivers Icon" className="stat-icon-img" />
              </div>
            </div>
            <div className="stat-card stat-card-horizontal">
              <div className="stat-content stat-content-left">
                <div className="stat-label">Total Registered Drivers</div>
                <div className="stat-number">41</div>
                <div className="stat-period">Today</div>
              </div>
              <div className="stat-icon-bg">
                                 <img src="/Media/Total driver icon.png" alt="Total Drivers Icon" className="stat-icon-img" />
              </div>
            </div>
            <div className="stat-card stat-card-horizontal">
              <div className="stat-content stat-content-left">
                <div className="stat-label">Total Unverified Drivers</div>
                <div className="stat-number">11</div>
                <div className="stat-period">&nbsp;</div>
              </div>
              <div className="stat-icon-bg">
                <img src="/Media/Total driver icon (2).png" alt="Unverified Icon" className="stat-icon-img" />
                <div className="notification-dot-large"></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card1">
              <div className="chart-header" style={{ alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Drivers</h3>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot poor" style={{ background: '#ff2d7a' }}></span>Poor Intake</span>
                  <span className="legend-item"><span className="legend-dot highest" style={{ background: '#8b5cf6' }}></span>Highest Intake</span>
                </div>
                <select className="chart-period">
                  <option>Sept</option>
                </select>
              </div>
              <div className="chart-container" style={{ background: '#fff', borderRadius: 16, padding: 8 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#bbb' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      shape={CustomBar}
                      label={CustomLabel}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Total Earnings</h3>
                <select className="chart-period">
                  <option>This week</option>
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={earningsData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(v: number) => `${v / 1000}k`} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="tables-row">
            <div className="table-card1">
              <div className="table-header-row">
                <h3>History</h3>
                <div className="table-search">
                                     <img src="/Media/search-02.png" alt="Search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-container">
                <table className="history-table">
                  <tbody>
                    {filteredHistory.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.name}</td>
                        <td>{row.id}</td>
                        <td>{row.phone}</td>
                        <td>{row.plate}</td>
                        <td>{row.park}</td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="table-card ">
              <div className="table-header">
                <h3>Recent Activity</h3>
                                 <img src="/Media/Edit.png" alt="More" className="more-icon" />
              </div>
              <div className="activity-list">
                {activityData.map((item, idx) => (
                  <React.Fragment key={idx}>
                <div className="activity-item">
                      <div className="activity-avatar">
                        <img src={item.avatar} alt="avatar" />
                        <span className="activity-dot" />
                </div>
                  <div className="activity-content">
                        <span className="activity-name">{item.name}</span>
                        <span className="activity-time">{item.time}</span>
                  </div>
                      <span className="activity-plate">{item.plate}</span>
                </div>
                    {idx < activityData.length - 1 && <div className="activity-divider" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      {showAddDriverModal && <AddDriverModal onClose={() => setShowAddDriverModal(false)} />}
      {showDriverModal && (
        <DashboardDriver
          isOpen={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          onCancel={() => setShowDriverModal(false)}
          onAddUser={(draft) => {
            setDriverDraft(draft);
            setShowDriverModal(false);
            setShowAddDriverVehicleModal(true);
          }}
        />
      )}
      {showAddDriverVehicleModal && (
        <DashboardAddDriver
          isOpen={showAddDriverVehicleModal}
          onClose={() => setShowAddDriverVehicleModal(false)}
          onPreviousStep={() => {
            setShowAddDriverVehicleModal(false);
            setShowDriverModal(true);
          }}
          onSkipForNow={() => {
            setShowAddDriverVehicleModal(false);
          }}
          driverDraft={driverDraft}
          onSaveDetails={() => {
            setShowAddDriverVehicleModal(false);
            setDriverDraft(null);
          }}
        />
      )}
      {showTopUpModal && (
        <DashboardTopUp
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onCancel={() => setShowTopUpModal(false)}
          onNext={(data) => {
            setTopUpPayload(data);
            setShowTopUpModal(false);
            setShowAuthorizeModal(true);
          }}
        />
      )}
      {showAuthorizeModal && (
        <DashboardAuthorize
          isOpen={showAuthorizeModal}
          onClose={() => setShowAuthorizeModal(false)}
          onPrevious={() => {
            setShowAuthorizeModal(false);
            setShowTopUpModal(true);
          }}
          onTopUp={() => {
            setShowAuthorizeModal(false);
            setTopUpPayload(null);
          }}
          phoneNumber={topUpPayload?.phone || '+234 708 *** 3456'}
          topUpData={topUpPayload}
        />
      )}
    </div>
  );
};

export default Dashboard;
