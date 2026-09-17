import React, { useEffect, useState } from 'react';
import './dashboard.css';
import AddAgentModal from './AddAgentModal';
import AddDriverModal from './AddDriverModal';
import DashboardSidebar from './DashboardSidebar';
import downloadlogo from '../media/download-04.png';
import { useNavigate } from 'react-router-dom';
import total from '../media/Total driver icon.png'
import total1 from '../media/Total driver icon (1).png'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import groupAvatar from '../media/Group 921.png';
import Header from '../header/header';
import headerPhoto from '../media/headerPhoto.png';
import photo1 from '../media/photo2.png';
import photo2 from '../media/photo1.png';
import photo3 from '../media/photo3.png';
import search from '../media/search-02.png';
import { api, getStoredUser } from '../../api/client';
import { formatNaira } from '../../utils/apiMappers';


const Dashboard: React.FC = () => {
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const user = getStoredUser<any>();
  const [stats, setStats] = useState({ drivers: 0, agents: 0, routes: 0, revenue: 0 });
  const data = [
    { name: 'Sept 2', value: 2.3 },
    { name: 'Sept 3', value: 2.6 },
    { name: 'Sept 5', value: 6.0 },
    { name: 'Sept 8', value: 0.9, type: 'poor' },
    { name: 'Sept 10', value: 7.5, type: 'highest', label: '12pm-5pm' },
    { name: 'Sept 13', value: 4.0 },
    { name: 'Sept 25', value: 6.0 },
    { name: 'Sept 33', value: 2.0 },
    { name: 'Sept', value: 2.0 },
  ];
  const [historyData, setHistoryData] = useState<
    { name: string; id: string; phone: string; plate: string; park: string }[]
  >([]);
  const [earningsData, setEarningsData] = useState([
    { day: 'Sun', value: 5000 },
    { day: 'Mon', value: 53000 },
    { day: 'Tue', value: 25000 },
    { day: 'Wed', value: 15000 },
    { day: 'Thurs', value: 27000 },
    { day: 'Fri', value: 10000 },
    { day: 'Sat', value: 32000 },
  ]);

  useEffect(() => {
    api('/api/v1/dashboard/summary')
      .then((s: any) => {
        if (!s) return;
        setStats({
          drivers: s.drivers || 0,
          agents: s.agents || 0,
          routes: s.routes || 0,
          revenue: s.revenue || 0,
        });
        setHistoryData(
          (s.recentPayments || []).map((p: any) => ({
            name: p.user_name || '—',
            id: String(p.id).slice(0, 12),
            phone: formatNaira(p.amount),
            plate: p.plate_number || '—',
            park: p.payment_type || '—',
          }))
        );
        const chart = (s.revenueChart || []).map((c: any) => ({
          day: c.day || '—',
          value: Number(c.amount || 0),
        }));
        if (chart.length) setEarningsData(chart);
      })
      .catch(() => {});
  }, []);

  const filteredHistory = historyData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBarColor = (type?: string) => {
    if (type === 'poor') return '#ff2d7a';      // Pink
    if (type === 'highest') return '#8b5cf6';   // Purple
    return '#e5e7eb';                           // Light gray
  };

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, index } = props;
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
      avatar: photo1,
      plate: 'PL-233-ABC',
      time: 'Just now',
    },
    {
      name: 'Tunde Akinwale',
      avatar: photo2,
      plate: 'PL-233-WTD',
      time: 'Just now',
    },
    {
      name: 'Sani Mohammed',
      avatar: photo3,
      plate: 'PL-445-MSK',
      time: 'Just now',
    },
  ];

  return (
    <div className={`dashboard${darkMode ? ' dark' : ''}`}> 
      <DashboardSidebar activeView={'dashboard'} onNavigate={(view) => navigate(`/${view}`)} />
      <main className="main-content">
        <Header
          title="Dashboard"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(dm => !dm)}
          showThemeSwitch={true}
          rightContent={
            <div className="profile">
              <img src={headerPhoto} alt="Profile" className="profile-avatar" />
              <div className="profile-info">
                <span className="profile-name">{user?.fullName || user?.full_name || 'Union Head'}</span>
                <span className="profile-email">{user?.email || ''}</span>
              </div>
            </div>
          }
        />
        <div className="header-between">
          <div className="header-left">
            <h1 className="header-title">Hi, {(user?.fullName || user?.full_name || 'Union Head').split(' ')[0]}</h1>
            <p className="header-subtitle">Welcome to your Dashboard</p>
          </div>
          <div className="header-right">
            <button className="downloadlogo">
              <img src={downloadlogo} alt="Download" />
              Download Report
            </button>
            <button 
              className="new-agent-btn"
              onClick={() => setShowAddAgentModal(true)}
            >
              + New Agent
            </button>
            <button 
              className="new-driver-btn"
              onClick={() => setShowAddDriverModal(true)}
            >
              + New Driver
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
                <div className="stat-number">{stats.drivers}</div>
                <div className="stat-period">Live</div>
              </div>
              <div className="stat-icon-bg">
                <img src={groupAvatar} alt="Drivers Icon" className="stat-icon-img" />
              </div>
            </div>
            <div className="stat-card stat-card-horizontal">
              <div className="stat-content stat-content-left">
                <div className="stat-label">Total Agents</div>
                <div className="stat-number">{stats.agents}</div>
                <div className="stat-period">Live</div>
              </div>
              <div className="stat-icon-bg">
                <img src={total} alt="Total Drivers Icon" className="stat-icon-img" />
              </div>
            </div>
            <div className="stat-card stat-card-horizontal">
              <div className="stat-content stat-content-left">
                <div className="stat-label">Total Routes</div>
                <div className="stat-number">{stats.routes}</div>
                <div className="stat-period">{formatNaira(stats.revenue)}</div>
              </div>
              <div className="stat-icon-bg">
                <img src={total1} alt="Unverified Icon" className="stat-icon-img" />
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
                    <YAxis tick={{ fontSize: 12, fill: '#bbb' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} />
                    <Tooltip formatter={(value) => [`${value}k`, 'Value']} />
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
                    <YAxis tickFormatter={v => `${v / 1000}k`} />
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
                  <span className="search-icon"><img src={search} alt="search" /></span>
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
              <div className="table-header1">
                <h3>Recent Activity</h3>
                <button className="menu-btn">⋮</button>
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
      {showAddAgentModal && <AddAgentModal onClose={() => setShowAddAgentModal(false)} />}
      {showAddDriverModal && <AddDriverModal onClose={() => setShowAddDriverModal(false)} />}
    </div>
  );
};

export default Dashboard;
