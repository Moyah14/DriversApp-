import React, { useState } from 'react';
import './analytics.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../header/header';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moneyBagIcon from '../media/money-bag-02.png';
import groupIcon from '../media/user-group-03.png';
import starIcon from '../media/analytics-02.png';
import moneyBagGreen from '../media/moneyBagGreen.png';
import groupIconGreen from '../media/groupIconGreen.png';
import chartUp from '../media/chart-up.png';
import calendarIcon from '../media/calendarFrame.png';
import backIcon from '../media/nextButton.png';

const Analytics: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Income Analysis Data - Fixed values to match design
  const incomeData = [
    { date: 'Jun 20', value: 45000 },
    { date: 'Jun 21', value: 52000 },
    { date: 'Jun 22', value: 38000 },
    { date: 'Jun 23', value: 61000 },
    { date: 'Jun 24', value: 48000 },
    { date: 'Jun 25', value: 105600, highlighted: true },
    { date: 'Jun 26', value: 72000 },
    { date: 'Jun 27', value: 89000 },
    { date: 'Jun 28', value: 65000 },
    { date: 'Jun 29', value: 78000 },
    { date: 'Jun 30', value: 82000 },
    { date: 'Jul 1', value: 95000 },
  ];

  // Drivers Data - Fixed values to match design
  const driversData = [
    { date: 'Sept 2', value: 2300 },
    { date: 'Sept 3', value: 2600 },
    { date: 'Sept 5', value: 6000 },
    { date: 'Sept 8', value: 900, type: 'poor' },
    { date: 'Sept 10', value: 7500, type: 'highest', label: '12pm-5pm' },
    { date: 'Sept 13', value: 4000 },
    { date: 'Sept 25', value: 6000 },
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

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, index } = props;
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
    const { fill, x, y, width, height, index } = props;
    const dataPoint = driversData[index];
    const type = dataPoint?.type;
    
    let color = '#009966';
    if (type === 'poor') color = '#ff2d7a';
    if (type === 'highest') color = '#8b5cf6';
    
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

  // Custom Y-axis formatter for income chart
  const formatIncomeYAxis = (value: number) => {
    return `${value / 1000}k`;
  };

  // Custom Y-axis formatter for drivers chart
  const formatDriversYAxis = (value: number) => {
    if (value === 1000) return '1k';
    if (value === 5000) return '5k';
    if (value === 10000) return '10k';
    return value.toString();
  };

  // Custom Y-axis formatter for earnings chart
  const formatEarningsYAxis = (value: number) => {
    return `${value / 1000}k`;
  };

  return (
    <div className={`analytics-page${darkMode ? ' dark' : ''}`}>
      <Sidebar activeView={'analytics'} onNavigate={(view) => navigate(`/${view}`)} />
      <main className="analytics-main-content1">
        <Header
          title="Analytics"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(dm => !dm)}
          showThemeSwitch={true}
          rightContent={
            <div className="profile">
              <div className="profile-avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              </div>
              <div className="profile-info">
                <span className="profile-name">Ibrahim Musa</span>
                <span className="profile-email">Ibrahim.4Musa@gmail.com</span>
              </div>
            </div>
          }
        />
        
        <div className="analytics-content">
          {/* Summary Cards */}
          <div className="analytics-summary-cards">
            <div className="analytics-summary-card">
              <div className="analytics-summary-card-header">
                <div className="analytics-summary-card-icon">
                  <img src={moneyBagGreen} alt="money bag" />
                </div>
               
              </div>
              <div className="analytics-summary-card-content">
                <h3 className="analytics-summary-card-label">Total Income</h3>
                <div className="analytics-summary-card-trend-container">
                <p className="analytics-summary-card-value">N2,456,340.00</p>
                <div className="analytics-summary-card-trend">
                  <span className="analytics-trend-icon"> <img src={chartUp} alt="chart up" /> </span>
                  <span className="analytics-trend-percentage">+1.5%</span>
                </div>
                </div>
              </div>
            </div>

            <div className="analytics-summary-card">
              <div className="analytics-summary-card-header">
                <div className="analytics-summary-card-icon">
                  <img src={groupIconGreen} alt="group" />
                </div>
            
              </div>
              <div className="analytics-summary-card-content">
                <h3 className="analytics-summary-card-label">Total Accounts</h3>
                <div className="analytics-summary-card-trend-container">
                <p className="analytics-summary-card-value">15,678</p>
                <div className="analytics-summary-card-trend">
                  <span className="analytics-trend-icon"> <img src={chartUp} alt="chart up" /> </span>
                  <span className="analytics-trend-percentage">+1.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-summary-card analytics-ratings-card">
              <div className="analytics-side-by-side">
                <div className="analytics-logo">
                  <div className="analytics-summary-card-icon">
                    <img src={moneyBagGreen} alt="star" />
                  </div>
                  <h3 className="analytics-summary-card-label">Ratings</h3>
                  <p className="analytics-summary-card-value">4.90</p>
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
                <span className="analytics-calendar-icon"><img src={calendarIcon} alt="calendar" /></span>
                                      <div className="analytics-date-selector">
                      <select className="analytics-date-dropdown">
                        <option value="june-2025">June 2025</option>
                        <option value="may-2025">May 2025</option>
                        <option value="april-2025">April 2025</option>
                        <option value="march-2025">March 2025</option>
                      </select>
                    </div>
                  <button className="analytics-scroll-arrow"><img src={backIcon} alt="back" /></button>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={160}>
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
                    <select className="analytics-date-dropdown">
                      <option value="sept">Sept</option>
                      <option value="aug">Aug</option>
                      <option value="july">July</option>
                      <option value="june">June</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={driversData} barSize={32}>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#bbb' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={formatDriversYAxis}
                      domain={[0, 10000]}
                      ticks={[0, 1000, 5000, 10000]}
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
                    <select className="analytics-date-dropdown">
                      <option value="this-week">This week</option>
                      <option value="last-week">Last week</option>
                      <option value="this-month">This month</option>
                      <option value="last-month">Last month</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={160}>
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
