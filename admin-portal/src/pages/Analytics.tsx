import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { api } from "../api/client";
import { formatNaira } from "../utils/apiMappers";

const defaultSummaryData = [
  { label: "Total Income", value: "₦0.00", change: null as string | null },
  { label: "Total Accounts", value: "0", change: null as string | null },
  { label: "Ratings", value: "—", change: null as string | null },
];

const ratingsData = [
  { star: "5 Star", value: 80 },
  { star: "4 Star", value: 12 },
  { star: "3 Star", value: 5 },
  { star: "2 Star", value: 2 },
  { star: "1 Star", value: 1 },
];

const accountAnalysisData = [
  { name: "Admin / Agents", value: 25, color: "#87CEEB" },
  { name: "Drivers", value: 60, color: "#f472b6" },
  { name: "Union Heads", value: 15, color: "#F6D9F6" },
];

const accountsBarData = [
  { date: "Jun 20", agents: 40, drivers: 100, unionHeads: 25 },
  { date: "Jun 21", agents: 50, drivers: 120, unionHeads: 30 },
  { date: "Jun 22", agents: 30, drivers: 80, unionHeads: 20 },
  { date: "Jun 23", agents: 20, drivers: 60, unionHeads: 15 },
  { date: "Jun 24", agents: 25, drivers: 70, unionHeads: 18 },
  { date: "Jun 25", agents: 60, drivers: 150, unionHeads: 40 },
  { date: "Jun 26", agents: 20, drivers: 50, unionHeads: 10 },
  { date: "Jun 27", agents: 15, drivers: 40, unionHeads: 8 },
  { date: "Jun 28", agents: 30, drivers: 80, unionHeads: 20 },
];

const vehicleAnalysisData = [
  { name: "Bus", value: 25, color: "#87CEEB" },
  { name: "Mini-Bus", value: 60, color: "#f472b6" },
  { name: "Tricycle", value: 15, color: "#F6D9F6" },
];

const vehiclesBarData = [
  { date: "Jun 20", bus: 40, minibus: 100, tricycle: 25 },
  { date: "Jun 21", bus: 50, minibus: 120, tricycle: 30 },
  { date: "Jun 22", bus: 30, minibus: 80, tricycle: 20 },
  { date: "Jun 23", bus: 20, minibus: 60, tricycle: 15 },
  { date: "Jun 24", bus: 25, minibus: 70, tricycle: 18 },
  { date: "Jun 25", bus: 60, minibus: 150, tricycle: 40 },
  { date: "Jun 26", bus: 20, minibus: 50, tricycle: 10 },
  { date: "Jun 27", bus: 15, minibus: 40, tricycle: 8 },
  { date: "Jun 28", bus: 30, minibus: 80, tricycle: 20 },
];

type AnalyticsProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Analytics: React.FC<AnalyticsProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [summaryData, setSummaryData] = useState(defaultSummaryData);
  const [incomeData, setIncomeData] = useState<{ date: string; income: number }[]>([]);
  const [pieAccounts, setPieAccounts] = useState(accountAnalysisData);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/api/v1/dashboard/summary")
      .then((s: any) => {
        if (!s) return;
        const accounts = (s.drivers || 0) + (s.agents || 0) + (s.unionHeads || 0);
        setSummaryData([
          { label: "Total Income", value: formatNaira(s.revenue), change: null },
          { label: "Total Accounts", value: String(accounts).toLocaleString(), change: null },
          { label: "Ratings", value: String(s.averageSafetyScore ?? "—"), change: null },
        ]);
        setIncomeData(
          (s.revenueChart || []).map((c: any) => ({
            date: c.day || c.date || "—",
            income: Number(c.amount || 0),
          }))
        );
        const totalRoles = (s.agents || 0) + (s.drivers || 0) + (s.unionHeads || 0) || 1;
        setPieAccounts([
          { name: "Admin / Agents", value: Math.round(((s.agents || 0) / totalRoles) * 100), color: "#87CEEB" },
          { name: "Drivers", value: Math.round(((s.drivers || 0) / totalRoles) * 100), color: "#f472b6" },
          { name: "Union Heads", value: Math.round(((s.unionHeads || 0) / totalRoles) * 100), color: "#F6D9F6" },
        ]);
      })
      .catch(() => setIncomeData([]));
  }, []);

  const currentIncomeData = incomeData;
  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        hovered={sidebarHovered}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        onSearchOpen={() => setSearchModalOpen(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <div
        style={{
          marginLeft: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          paddingLeft: 32,
          transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)",
          width: "100%",
        }}
      >
        <Topbar pageTitle="Analytics" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          {/* Summary Cards */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            {summaryData.map((item, idx) => (
              <div key={item.label} style={{
                flex: 1,
                background: "#fff",
                borderRadius: 16,
                padding: "1.5rem 2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 180,
                position: "relative"
              }}>
                {item.label === "Ratings" ? (
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                      <img src="/AnalyticsMoneyBag.png" alt="Money Bag" style={{ width: "32px", height: "32px" }} />
                      <div style={{ fontSize: 16, color: "#888", fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{item.value}</div>
                    </div>
                    {/* Vertical separator line */}
                    <div style={{ 
                      width: "1px", 
                      height: "100%", 
                      background: "#e5e7eb", 
                      margin: "0 8px" 
                    }} />
                    <div style={{ flex: 1 }}>
                      {ratingsData.map((r, i) => (
                        <div key={r.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 50, fontSize: 14, fontWeight: "500" }}>{r.star}</span>
                          <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 12, height: 12, position: "relative", overflow: "hidden" }}>
                            <div style={{
                              width: `${r.value}%`,
                              background: "#16a34a",
                              height: 12,
                              borderRadius: 12,
                              position: "absolute",
                              left: 0,
                              top: 0,
                              transition: "width 0.3s ease"
                            }} />
                          </div>
                          <span style={{ fontSize: 13, color: "#666", width: 30, textAlign: "right", fontWeight: "500" }}>{r.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {item.label === "Total Income" && (
                        <img src="/AnalyticsMoneyBag.png" alt="Money Bag" style={{ width: "32px", height: "32px" }} />
                      )}
                      {item.label === "Total Accounts" && (
                        <img src="/AnalyticsHumans.png" alt="Humans" style={{ width: "32px", height: "32px" }} />
                      )}
                      <div style={{ fontSize: 16, color: "#888", fontWeight: 500 }}>{item.label}</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{item.value}</div>
                    {item.change && (
                      <div style={{ color: "#16a34a", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 18 }}>▲</span> {item.change}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Income Analysis Bar Chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", marginBottom: 32, minHeight: 300, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Income Analysis</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Calendar icon button */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  width: "40px", 
                  height: "40px", 
                  background: "#fff", 
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}>
                  <img src="/calendar-01.png" alt="Calendar" style={{ width: "20px", height: "20px" }} />
                </div>
                {/* Month selector */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  padding: "8px 12px", 
                  border: "1px solid #ddd", 
                  borderRadius: "8px", 
                  background: "#fff", 
                  cursor: "pointer"
                }}>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ border: "none", background: "transparent", fontSize: "14px", cursor: "pointer", outline: "none" }}
                >
                  <option value="All">Last 14 days</option>
                </select>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={currentIncomeData} barCategoryGap="35%">
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value: number) => `${value / 1000}k`}
                  domain={[0, 120000]}
                  ticks={[0, 20000, 40000, 60000, 80000, 100000, 120000]}
                />
                <Tooltip
                  formatter={(value: number) =>
                    `₦${value.toLocaleString()}`
                  }
                />
                <Bar dataKey="income" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {currentIncomeData.map((entry, index) => {
                    const maxValue = currentIncomeData.length
                      ? Math.max(...currentIncomeData.map(item => item.income))
                      : 0;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.income === maxValue ? "#16a34a" : "#e5e7eb"} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Lower Section: Custom Grid Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Left Column: Donut Charts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Account Analysis */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: "16px" }}>Account Analysis</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ResponsiveContainer width="60%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieAccounts}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        fill="#8884d8"
                      label={(props: PieLabelRenderProps) => {
                        const { percent, cx, cy, midAngle, innerRadius, outerRadius } = props;
                        if (
                          cx == null ||
                          cy == null ||
                          midAngle == null ||
                          innerRadius == null ||
                          outerRadius == null
                        ) {
                          return null;
                        }
                        const RADIAN = Math.PI / 180;
                        const cxNum = Number(cx);
                        const cyNum = Number(cy);
                        const mid = Number(midAngle);
                        const outer = Number(outerRadius);
                        const radius = outer + 10;
                        const x = cxNum + radius * Math.cos(-mid * RADIAN);
                        const y = cyNum + radius * Math.sin(-mid * RADIAN);
                        
                        return (
                          <g>
                            {/* Connecting line */}
                            <line
                              x1={cxNum + (outer - 5) * Math.cos(-mid * RADIAN)}
                              y1={cyNum + (outer - 5) * Math.sin(-mid * RADIAN)}
                              x2={x}
                              y2={y}
                              stroke="#e5e7eb"
                              strokeWidth={1}
                            />
                            {/* White circular badge */}
                            <circle
                              cx={x}
                              cy={y}
                              r={18}
                              fill="white"
                              stroke="#e5e7eb"
                              strokeWidth={1}
                              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))"
                            />
                            {/* Percentage text */}
                            <text 
                              x={x} 
                              y={y} 
                              fill="#374151" 
                              textAnchor="middle" 
                              dominantBaseline="middle"
                              style={{
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {`${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
                            </text>
                          </g>
                        );
                      }}
                      labelLine={false}
                      >
                        {pieAccounts.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {pieAccounts.map((entry) => (
                      <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                        <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 4, background: entry.color }} />
                        <span style={{ fontWeight: "500" }}>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle Analysis */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: "16px" }}>Vehicle Analysis</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ResponsiveContainer width="60%" height={180}>
                    <PieChart>
                      <Pie
                        data={vehicleAnalysisData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        fill="#8884d8"
                                              label={(props: PieLabelRenderProps) => {
                        const { percent, cx, cy, midAngle, innerRadius, outerRadius } = props;
                        if (
                          cx == null ||
                          cy == null ||
                          midAngle == null ||
                          innerRadius == null ||
                          outerRadius == null
                        ) {
                          return null;
                        }
                        const RADIAN = Math.PI / 180;
                        const cxNum = Number(cx);
                        const cyNum = Number(cy);
                        const mid = Number(midAngle);
                        const outer = Number(outerRadius);
                        const radius = outer + 10;
                        const x = cxNum + radius * Math.cos(-mid * RADIAN);
                        const y = cyNum + radius * Math.sin(-mid * RADIAN);
                        
                        return (
                          <g>
                            {/* Connecting line */}
                            <line
                              x1={cxNum + (outer - 5) * Math.cos(-mid * RADIAN)}
                              y1={cyNum + (outer - 5) * Math.sin(-mid * RADIAN)}
                              x2={x}
                              y2={y}
                              stroke="#e5e7eb"
                              strokeWidth={1}
                            />
                            {/* White circular badge */}
                            <circle
                              cx={x}
                              cy={y}
                              r={18}
                              fill="white"
                              stroke="#e5e7eb"
                              strokeWidth={1}
                              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))"
                            />
                            {/* Percentage text */}
                            <text 
                              x={x} 
                              y={y} 
                              fill="#374151" 
                              textAnchor="middle" 
                              dominantBaseline="middle"
                              style={{
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {`${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
                            </text>
                          </g>
                        );
                      }}
                      labelLine={false}
                      >
                        {vehicleAnalysisData.map((entry, idx) => (
                          <Cell key={`cell-v-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  {vehicleAnalysisData.map((entry) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                      <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 4, background: entry.color }} />
                      <span style={{ fontWeight: "500" }}>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Right Column: Bar Charts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Accounts */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "16px" }}>Accounts</div>
                  {/* Legend centered */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#87CEEB", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Admin / Agents</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#f472b6", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Drivers</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#F6D9F6", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Union Heads</span>
                    </div>
                  </div>
                  <img src="/calendar.png" alt="Calendar" style={{ width: "40px", height: "40px", cursor: "pointer" }} />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={accountsBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="agents" stackId="a" fill="#87CEEB" name="Admin / Agents" maxBarSize={40} />
                    <Bar dataKey="drivers" stackId="a" fill="#f472b6" name="Drivers" maxBarSize={40} />
                    <Bar dataKey="unionHeads" stackId="a" fill="#F6D9F6" name="Union Heads" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Vehicles */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "16px" }}>Vehicles</div>
                  {/* Legend centered */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#87CEEB", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Bus</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#f472b6", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Mini-Bus</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, background: "#F6D9F6", borderRadius: 4 }}></div>
                      <span style={{ fontSize: 14, color: "#666" }}>Tricycle</span>
                    </div>
                  </div>
                  <img src="/calendar.png" alt="Calendar" style={{ width: "40px", height: "40px", cursor: "pointer" }} />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={vehiclesBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="bus" stackId="a" fill="#87CEEB" name="Bus" maxBarSize={40} />
                    <Bar dataKey="minibus" stackId="a" fill="#f472b6" name="Mini-Bus" maxBarSize={40} />
                    <Bar dataKey="tricycle" stackId="a" fill="#F6D9F6" name="Tricycle" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics; 