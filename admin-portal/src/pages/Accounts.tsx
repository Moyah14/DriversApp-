import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AccountsDriversTable from "../components/AccountsDriversTable";
import AccountsAgentsTable from "../components/AccountsAgentsTable";
import AccountsUnionHeadsTable from "../components/AccountsUnionHeadsTable";
import userGroupIcon from "./Accounts Icons/user-group-03 (3).png";
import group8Icon from "./Accounts Icons/Group 8 (1).png";
import { exportToCSV } from "../utils/exportUtils";

const summaryData = [
  { label: "All Accounts", value: "15,678", icon: userGroupIcon },
  { label: "Active Accounts", value: "12,678", icon: userGroupIcon },
  { label: "Suspended Accounts", value: "2,678", icon: userGroupIcon },
  { label: "Deleted Accounts", value: "1,232", icon: userGroupIcon },
];

type AccountsProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Accounts: React.FC<AccountsProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [activeTab, setActiveTab] = useState<"drivers" | "agents" | "union-heads">("drivers");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    dateRange: "all",
    level: "all"
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    dateRange: "all",
    level: "all"
  });
  const [draftFilters, setDraftFilters] = useState({
    status: "all",
    dateRange: "all",
    level: "all"
  });

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  const handleDownloadReport = (accountType: string) => {
    // Mock data for demonstration - in real app, this would come from API
    const mockData = {
      drivers: [
        { Name: "John Doe", Phone: "08012345678", Address: "123 Main St", NIN: "12345678901", License: "DL123456" },
        { Name: "Jane Smith", Phone: "08087654321", Address: "456 Oak Ave", NIN: "98765432109", License: "DL654321" },
      ],
      agents: [
        { Name: "Agent 1", Email: "agent1@example.com", Phone: "08011111111", "Drivers Registered": "45", Level: "Level 1" },
        { Name: "Agent 2", Email: "agent2@example.com", Phone: "08022222222", "Drivers Registered": "32", Level: "Level 2" },
      ],
      "union-heads": [
        { Name: "Union Head 1", Email: "head1@example.com", Phone: "08033333333", Park: "Central Park", "Drivers Managed": "150" },
        { Name: "Union Head 2", Email: "head2@example.com", Phone: "08044444444", Park: "North Park", "Drivers Managed": "120" },
      ]
    };

    const data = mockData[accountType as keyof typeof mockData] || [];
    exportToCSV(data, `${accountType}_report`);
  };

  const handleFilterApply = (newFilters: typeof filterOptions) => {
    setAppliedFilters(newFilters);
    setFilterModalOpen(false);
    console.log("Applied filters:", newFilters);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      status: "all",
      dateRange: "all",
      level: "all"
    };
    setDraftFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const FilterModal = () => (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2rem",
        minWidth: "400px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem"
        }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Filter Accounts</h3>
          <button
            onClick={() => setFilterModalOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Status</label>
          <select
            value={draftFilters.status}
            onChange={(e) => setDraftFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Date Range</label>
          <select
            value={draftFilters.dateRange}
            onChange={(e) => setDraftFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {activeTab === "agents" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Level</label>
            <select
              value={draftFilters.level}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, level: e.target.value }))}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="all">All Levels</option>
              <option value="level1">Level 1</option>
              <option value="level2">Level 2</option>
              <option value="level3">Level 3</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={handleFilterReset}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setFilterModalOpen(false)}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleFilterApply(draftFilters)}
            style={{
              padding: "8px 16px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

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
        <Topbar pageTitle="Accounts" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          {/* Header with tabs and action buttons on same line */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 24,
            width: "100%"
          }}>
            {/* Tabs on the left */}
            <div style={{ 
              display: "flex", 
              background: "#fff",
              borderRadius: 8,
              padding: 4,
              width: "fit-content"
            }}>
              <button
                onClick={() => setActiveTab("drivers")}
                style={{
                  padding: "10px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: activeTab === "drivers" ? "#16a34a" : "transparent",
                  color: activeTab === "drivers" ? "#fff" : "#222",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                style={{
                  padding: "10px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: activeTab === "agents" ? "#16a34a" : "transparent",
                  color: activeTab === "agents" ? "#fff" : "#222",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveTab("union-heads")}
                style={{
                  padding: "10px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: activeTab === "union-heads" ? "#16a34a" : "transparent",
                  color: activeTab === "union-heads" ? "#fff" : "#222",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Union Heads
              </button>
            </div>
            
            {/* Action buttons on the right */}
            <div style={{ 
              display: "flex", 
              gap: "1rem",
              alignItems: "center"
            }}>
              <button
                onClick={() => {
                  setDraftFilters(appliedFilters); // Initialize draft with current applied filters
                  setFilterModalOpen(true);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
              >
                <img src="/Filter.png" alt="Filter" style={{ width: "16px", height: "16px" }} />
                Filter
              </button>
              <button
                onClick={() => handleDownloadReport(activeTab)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
              >
                <img src="/download.png" alt="Download" style={{ width: "16px", height: "16px" }} />
                Download Report
              </button>
            </div>
          </div>
          {/* Summary Cards */}
          <div style={{ 
            display: "flex", 
            gap: 24, 
            marginBottom: 32,
            flexWrap: "wrap"
          }}>
            {summaryData.map((item, idx) => (
              <div
                key={item.label}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "1.5rem 2rem",
                  minWidth: 200,
                  flex: "1 1 200px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 8,
                  position: "relative"
                }}
              >
                <div style={{ fontSize: 18, color: "#888", marginBottom: 4 }}>{item.label}</div>
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#111" }}>{item.value}</span>
                  <img src={item.icon} alt={item.label + " icon"} style={{ width: 32, height: 32, marginLeft: 12, objectFit: "contain" }} />
                </div>
                {/* Decorative line icon */}
                <img src={group8Icon} alt="decorative line" style={{ position: "absolute", right: 0, bottom: 0, width: 60, pointerEvents: "none", zIndex: 0, opacity: 0.7 }} />
              </div>
            ))}
          </div>
          {/* Tab Content */}
          {activeTab === "drivers" && <AccountsDriversTable />}
          {activeTab === "agents" && <AccountsAgentsTable />}
          {activeTab === "union-heads" && <AccountsUnionHeadsTable />}
        </main>
      </div>
      {filterModalOpen && <FilterModal />}
    </div>
  );
};

export default Accounts;