import React, { useEffect, useState } from 'react';
import './Analytics.css';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/client';
import { formatNaira } from '../utils/apiMappers';

const Analytics: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [incomeData, setIncomeData] = useState<any[]>([
    { date: '—', value: 0 },
  ]);
  const [summaryCards, setSummaryCards] = useState({
    revenue: '₦0.00',
    drivers: '0',
    ratings: '—',
  });

  // Drivers Data - Fixed values to match Figma design exactly
  const driversData = [
    { date: 'Sept 2', value: 2300 },
    { date: 'Sept 3', value: 2600 },
    { date: 'Sept 5', value: 6000 },
    { date: 'Sept 8', value: 900, type: 'poor' },
    { date: 'Sept 10', value: 7500, type: 'highest', label: '12pm-5pm' },
    { date: 'Sept 13', value: 4000 },
    { date: 'Sept 33', value: 6000 },
    { date: 'Sept 25', value: 6000 },
    { date: 'Sept', value: 2000 },
  ];

  // Total Earnings Data - Fixed values to match design
  const earningsData = [
    { day: 'Sun', value: 5000 },
    { day: 'Mon', value: 53000 },
    { day: 'Tue', value: 25000 },
    { day: 'Wed', value: 15000 },
    { day: 'Thurs', value: 27000 },
    { day: 'Fri', value: 10000 },
    { day: 'Sat', value: 32000 },
  ];

  // Ratings Data
  const ratingsData = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  useEffect(() => {
    api('/api/v1/dashboard/summary')
      .then((s: any) => {
        if (!s) return;
        const accounts = (s.drivers || 0) + (s.agents || 0) + (s.unionHeads || 0);
        setSummaryCards({
          revenue: formatNaira(s.revenue),
          drivers: String(accounts),
          ratings: String(s.averageSafetyScore ?? '—'),
        });
        const chart = (s.revenueChart || []).map((c: any, idx: number, arr: any[]) => ({
          date: c.day || c.date || '—',
          value: Number(c.amount || 0),
          highlighted: idx === arr.length - 1,
        }));
        if (chart.length) setIncomeData(chart);
      })
      .catch(() => {});
  }, []);

  const CustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const dataPoint = incomeData[index];
    const isHighlighted = dataPoint?.highlighted;
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={isHighlighted ? '#009966' : '#e5e7eb'}
      />
    );
  };

  const DriversCustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const dataPoint = driversData[index];
    const type = dataPoint?.type;
    
    let color = '#e5e7eb'; // Light grey-green to match Figma
    if (type === 'poor') color = '#ff2d7a'; // Pink for poor intake
    if (type === 'highest') color = '#8b5cf6'; // Purple for highest intake
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={color}
      />
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, index } = props;
    const label = driversData[index]?.label;
    if (!label) return <g />;
    return (
      <g>
        <foreignObject x={x + width / 2 - 35} y={y - 50} width={70} height={28}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '4px 10px',
            fontSize: 13,
            color: '#222',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {label}
          </div>
        </foreignObject>
      </g>
    );
  };

  // Custom Y-axis formatter for income chart
  const formatIncomeYAxis = (value: number) => {
    return `${value / 1000}k`;
  };

  // Custom Y-axis formatter for drivers chart
  const formatDriversYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value === 1000) return '1h';
    if (value === 5000) return '5k';
    if (value === 10000) return '10k';
    return '';
  };

  // Custom Y-axis formatter for earnings chart
  const formatEarningsYAxis = (value: number) => {
    return `${value / 1000}k`;
  };

  return (
    <div className={`analytics-page${darkMode ? ' dark' : ''}`}>
      <Sidebar activeView={'analytics'} onNavigate={(view: string) => navigate(`/${view}`)} />
              <main className="analytics-main-content1">
          {/* Top Header */}
          <div className="analytics-top-header">
            <div className="analytics-header-left">
              <h1 className="analytics-main-title">Analytics</h1>
            </div>
            <div className="analytics-header-right">
              <div className="analytics-header-icons">
                <div className="analytics-search-box">
                  <img src="/Media/search-02.png" alt="Search" className="analytics-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="analytics-search-input"
                  />
                </div>
                <div className="analytics-theme-toggle-container">
                  <button 
                    className={`analytics-theme-toggle-btn ${!darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <img src="/Media/LIGHT CIRCLE.png" alt="Light Mode" className="analytics-theme-icon" />
            </button>
                  <button 
                    className={`analytics-theme-toggle-btn ${darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <img src="/Media/vector.png" alt="Dark Mode" className="analytics-theme-icon" />
            </button>
                </div>
                <img src="/Media/Notification bell.png" alt="Notifications" className="analytics-notification-bell" />
              </div>
              <div className="analytics-profile-section">
                <div className="analytics-profile-avatar">
                  <img src="/Media/Profile Image.png" alt="Profile" className="analytics-profile-image" />
                </div>
                <div className="analytics-profile-info">
                  <span className="analytics-profile-name">Ibrahim Musa</span>
                  <span className="analytics-profile-email">ibrahim.Musa@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

        <div className="analytics-content">
          {/* Summary Cards */}
          <div className="analytics-summary-cards">
            <div className="analytics-summary-card">
              <div className="analytics-summary-card-header">
                <div className="analytics-summary-card-icon">
                  <div className="icon-placeholder">💰</div>
                </div>
                <div className="analytics-summary-card-trend">
                  <span className="analytics-trend-icon">📈</span>
                  <span className="analytics-trend-percentage">+1.5%</span>
                </div>
              </div>
              <div className="analytics-summary-card-content">
                <h3 className="analytics-summary-card-label">Total Income</h3>
                <p className="analytics-summary-card-value">{summaryCards.revenue}</p>
              </div>
            </div>

            <div className="analytics-summary-card">
              <div className="analytics-summary-card-header">
                <div className="analytics-summary-card-icon">
                  <div className="icon-placeholder">👥</div>
                </div>
                <div className="analytics-summary-card-trend">
                  <span className="analytics-trend-icon">📈</span>
                  <span className="analytics-trend-percentage">+1.5%</span>
                </div>
              </div>
              <div className="analytics-summary-card-content">
                <h3 className="analytics-summary-card-label">Total Accounts</h3>
                <p className="analytics-summary-card-value">{summaryCards.drivers}</p>
              </div>
            </div>

            <div className="analytics-summary-card">
              <div className="analytics-summary-card-header">
                
                              
              </div>
              <div className="analytics-side-by-side">
                <div className="analytics-logo">
                <div className="analytics-summary-card-icon">
                  <div className="icon-placeholder">⭐</div>
                  </div>
                <h3 className="analytics-summary-card-label">Ratings</h3>
                <p className="analytics-summary-card-value">{summaryCards.ratings}</p>
                  </div>
                <div className="analytics-ratings-breakdown">
                  {ratingsData.map((rating) => (
                    <div key={rating.stars} className="analytics-rating-bar">
                      <span className="analytics-rating-stars">{rating.stars} Star</span>
                      <div className="analytics-rating-bar-container">
                        <div 
                          className="analytics-rating-bar-fill" 
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                  </div>
                      <span className="analytics-rating-percentage">{rating.percentage}%</span>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="analytics-charts-row">
            {/* Income Analysis Chart */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <h3>Income Analysis</h3>
                <div className="analytics-chart-controls">
                  <div className="analytics-date-selector">
                    <span className="analytics-calendar-icon">📅</span>
                    <span>June 2025</span>
                    <span className="analytics-dropdown-arrow">▼</span>
              </div>
                  <button className="analytics-scroll-arrow">→</button>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={incomeData} barSize={32}>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#bbb' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={formatIncomeYAxis}
                      domain={[0, 120000]}
                      ticks={[0, 20000, 40000, 60000, 80000, 100000, 120000]}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`NGN ${value.toLocaleString()}.00`, 'Income']}
                      labelStyle={{ color: '#222' }}
                    />
                    <Bar
                      dataKey="value"
                      shape={CustomBar}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

              {/* Drivers Chart */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                  <h3>Drivers</h3>
                <div className="analytics-chart-controls">
                  <div className="analytics-chart-legend">
                    <span className="analytics-legend-item">
                      <span className="analytics-legend-dot poor"></span>
                        Poor Intake
                      </span>
                    <span className="analytics-legend-item">
                      <span className="analytics-legend-dot highest"></span>
                        Highest Intake
                      </span>
                    </div>
                  <div className="analytics-date-selector">
                    <span>Sept</span>
                    <span className="analytics-dropdown-arrow">▼</span>
                  </div>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={driversData} barSize={32} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 13, fill: '#888' }} 
                      axisLine={false} 
                      tickLine={false}
                      interval={0}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 13, fill: '#bbb' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={formatDriversYAxis}
                      domain={[0, 10000]}
                      ticks={[0, 1000, 5000, 10000]}
                      width={30}
                    />
                      <Tooltip />
                    <Bar
                      dataKey="value"
                      shape={DriversCustomBar}
                      label={CustomLabel}
                    />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            {/* Total Earnings Chart */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <h3>Total Earnings</h3>
                <div className="analytics-chart-controls">
                  <div className="analytics-date-selector">
                    <span>This week</span>
                    <span className="analytics-dropdown-arrow">▼</span>
                  </div>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={earningsData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis dataKey="day" />
                    <YAxis 
                      tickFormatter={formatEarningsYAxis}
                      domain={[0, 50000]}
                      ticks={[0, 10000, 20000, 30000, 40000, 50000]}
                    />
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
        </div>
      </main>
    </div>
  );
};

export default Analytics;