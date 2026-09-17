import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SummaryCard from "../components/SummaryCard";
import AddUnionHeadModal from "../components/AddUnionHeadModal";
import AddAgentModal from "../components/AddAgentModal";
import AddDriverModal from "../components/AddDriverModal";
import GlobalSearchModal from "../components/GlobalSearchModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import moneyBagIcon from "./Dashboard Icons/money-bag-02 (1).png";
import userGroupIcon from "./Dashboard Icons/user-group-03 (1).png";
import busIcon from "./Dashboard Icons/bus-01.png";
import roadIcon from "./Dashboard Icons/road (1).png";
import group8Decor from "./Dashboard Icons/Group 8.png";
import userAddIcon from "./Dashboard Icons/user-add-01.png";
import { api } from "../api/client";
import { formatNaira, mapPaymentRow } from "../utils/apiMappers";

// Page Dropdown Component
const PageDropdown: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
}> = ({ currentPage, totalPages, onPageSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{
      position: "relative",
      display: "inline-block"
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "60px",
          padding: "8px 12px",
          border: "1px solid #16a34a",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#16a34a",
          fontWeight: "500",
          textAlign: "center",
          cursor: "pointer",
          background: "white",
          position: "relative"
        }}
      >
        {currentPage}
        <img 
          src="/arrow-down-01.png" 
          alt="dropdown arrow"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "12px",
            height: "12px"
          }}
        />
      </div>
      
      {isOpen && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #16a34a",
          borderRadius: "8px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          maxHeight: "200px",
          overflowY: "auto",
          marginBottom: "4px"
        }}>
          {pageNumbers.map((pageNum) => (
            <div
              key={pageNum}
              onClick={() => {
                onPageSelect(pageNum);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "center",
                background: pageNum === currentPage ? "#f0f9ff" : "white",
                color: pageNum === currentPage ? "#16a34a" : "#333",
                fontWeight: pageNum === currentPage ? "600" : "400",
                borderBottom: pageNum === pageNumbers[pageNumbers.length - 1] ? "none" : "1px solid #e5e7eb"
              }}
              onMouseEnter={(e) => {
                if (pageNum !== currentPage) {
                  (e.target as HTMLElement).style.background = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (pageNum !== currentPage) {
                  (e.target as HTMLElement).style.background = "white";
                }
              }}
            >
              {pageNum}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const defaultSummaryData = [
  { label: "Total Income", value: "₦0.00", icon: moneyBagIcon },
  { label: "Total Accounts", value: "0", icon: userGroupIcon },
  { label: "Total Vehicles", value: "0", icon: busIcon },
  { label: "Total Routes", value: "0", icon: roadIcon },
];

// Helper function to get status tag styles
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Success":
      return {
        background: "#dcfce7",
        color: "#166534",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
      };
    case "Pending":
      return {
        background: "#fef3c7",
        color: "#92400e",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
      };
    case "Failed":
      return {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
      };
    default:
      return {};
  }
};

type DashboardProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isUnionHeadModalOpen, setIsUnionHeadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);
  const [summaryData, setSummaryData] = useState(defaultSummaryData);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ date: string; income: number }[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    type: "all",
    dateRange: "all"
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    type: "all",
    dateRange: "all"
  });
  const [draftFilters, setDraftFilters] = useState({
    status: "all",
    type: "all",
    dateRange: "all"
  });

  const itemsPerPage = 5;

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
          { label: "Total Income", value: formatNaira(s.revenue), icon: moneyBagIcon },
          { label: "Total Accounts", value: String(accounts).toLocaleString(), icon: userGroupIcon },
          { label: "Total Vehicles", value: String(s.vehicles ?? 0).toLocaleString(), icon: busIcon },
          { label: "Total Routes", value: String(s.routes ?? 0).toLocaleString(), icon: roadIcon },
        ]);
        setPaymentsData(
          (s.recentPayments || []).map((p: any) => {
            const m = mapPaymentRow(p);
            return { ...m, idNumber: m.idNo };
          })
        );
        setChartData(
          (s.revenueChart || []).map((c: any) => ({
            date: c.day || c.date || "—",
            income: Number(c.amount || c.income || 0),
          }))
        );
      })
      .catch(() => {
        setChartData([]);
        setPaymentsData([]);
      });
  }, []);

  const handleMenuClick = (id: number | string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleActionClick = (action: string, paymentName: string) => {
    alert(`${action} for ${paymentName}`);
    setOpenMenuId(null);
  };

  // Get current chart data based on selected date
  const currentChartData = chartData;

  // Filter payments based on search term
  const filteredPayments = paymentsData.filter((payment) =>
    payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.idNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply additional filters based on filterOptions
  const filteredPaymentsWithFilters = filteredPayments.filter((payment) => {
    // Status filter
    if (appliedFilters.status !== "all" && payment.status !== appliedFilters.status) {
      return false;
    }
    
    // Type filter
    if (appliedFilters.type !== "all" && payment.type !== appliedFilters.type) {
      return false;
    }
    
    // Date range filter (simplified implementation)
    if (appliedFilters.dateRange !== "all") {
      const paymentDate = new Date(payment.date);
      const today = new Date();
      
      switch (appliedFilters.dateRange) {
        case "today":
          return paymentDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return paymentDate >= weekAgo;
        case "month":
          return paymentDate.getMonth() === today.getMonth() && 
                 paymentDate.getFullYear() === today.getFullYear();
        case "quarter":
          const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
          return paymentDate >= quarterStart;
        default:
          return true;
      }
    }
    
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPaymentsWithFilters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPaymentsWithFilters.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleGoToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const page = parseInt(formData.get('page') as string);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Selection logic
  const isAllSelected = currentPayments.length > 0 && currentPayments.every(row => selectedRows.includes(row.id));
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  const handleSelectRow = (id: number | string) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedRows.length === currentPayments.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentPayments.map(payment => payment.id));
    }
  };

  const handleFilterApply = (newFilters: typeof filterOptions) => {
    setAppliedFilters(newFilters);
    setFilterModalOpen(false);
    setCurrentPage(1); // Reset to first page when filters are applied
    setSearchTerm(""); // Reset search term when filters are applied
    console.log("Applied filters:", newFilters);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      status: "all",
      type: "all",
      dateRange: "all"
    };
    setDraftFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1); // Reset to first page when filters are reset
    setSearchTerm(""); // Reset search term when filters are reset
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
        borderRadius: "24px",
        padding: "2.5rem",
        minWidth: "500px",
        maxWidth: "600px",
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
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Filter Payments</h3>
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
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Transaction Type</label>
          <select 
            value={draftFilters.type} 
            onChange={(e) => setDraftFilters(prev => ({ ...prev, type: e.target.value }))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All Types</option>
            <option value="Card Payment">Card Payment</option>
            <option value="Deposit">Deposit</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
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
            <option value="quarter">This Quarter</option>
          </select>
        </div>

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
              fontSize: "14px",
              textDecoration: "underline"
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

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  return (
    <div style={{ display: "flex", background: "#f5f6fa", minHeight: "100vh" }}>
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
          background: "#f5f6fa",
          minHeight: "100vh",
        }}
      >
        <Topbar pageTitle="Dashboard" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          {/* Greeting and Action Buttons on same line */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32
          }}>
            <div>
              <h2 style={{ margin: 0 }}>Good Morning</h2>
              <div style={{ color: "#888" }}>
                Manage your activities
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              gap: 12, 
              flexWrap: "wrap"
            }}>
            <button
              style={{
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
              onClick={() => setIsUnionHeadModalOpen(true)}
            >
              <img src={userAddIcon} alt="Add Union Head" style={{ width: 20, height: 20, objectFit: "contain", filter: "brightness(0)" }} />
              Add Union Head
            </button>
            <button
              style={{
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
              onClick={() => setIsAgentModalOpen(true)}
            >
              <img src={userAddIcon} alt="Add Agent" style={{ width: 20, height: 20, objectFit: "contain", filter: "brightness(0)" }} />
              Add Agent
            </button>
            <button
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
              onClick={() => setIsDriverModalOpen(true)}
            >
              <img src={userAddIcon} alt="Add Driver" style={{ width: 20, height: 20, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              Add Driver
            </button>
            </div>
          </div>
          {/* Summary Cards */}
          <div style={{ 
            display: "flex", 
            gap: 24, 
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: 32
          }}>
            {summaryData.map((item) => (
              <div style={{ position: "relative", minWidth: "200px", flex: "1 1 200px" }} key={item.label}>
                <SummaryCard
                  label={item.label}
                  value={item.value}
                  icon={<img src={item.icon} alt={item.label + " icon"} style={{ width: 28, height: 28, objectFit: "contain" }} />}
                />
                <img
                  src={group8Decor}
                  alt="decorative"
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: 60,
                    height: 32,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              </div>
            ))}
          </div>
          {/* Income Analysis Bar Chart */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "2rem",
              marginBottom: 32,
              minHeight: 300,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 16 
            }}>
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
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="All">Last 14 days</option>
                  </select>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={currentChartData} barCategoryGap="35%">
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value: number) => `${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) =>
                    `₦${value.toLocaleString()}`
                  }
                />
                <Bar dataKey="income" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {currentChartData.map((entry, index) => {
                    const maxValue = currentChartData.length
                      ? Math.max(...currentChartData.map(item => item.income))
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
          {/* Recent Payments Table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              minHeight: 300,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Recent Payments</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  onClick={() => {
                    setDraftFilters(appliedFilters); // Initialize draft with current applied filters
                    setFilterModalOpen(true);
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <img src="/Filter.png" alt="Filter" style={{ width: "16px", height: "16px" }} />
                </button>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                />
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>ID Number</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Transaction Type</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #eee", background: selectedRows.includes(row.id) ? "#f0fdf4" : undefined }}>
                    <td style={{ padding: "12px 8px" }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                    <td style={{ padding: "12px 8px" }}>{row.name}</td>
                    <td style={{ padding: "12px 8px" }}>{row.idNumber || row.idNo}</td>
                    <td style={{ padding: "12px 8px" }}>{row.type}</td>
                    <td style={{ padding: "12px 8px" }}>{row.amount}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={getStatusStyle(row.status)}>{row.status}</span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{row.date}</td>
                    <td style={{ padding: "12px 8px", position: "relative" }}>
                      <button
                        onClick={() => handleMenuClick(row.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px",
                        }}
                      >
                        ⋮
                      </button>
                      {openMenuId === row.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            background: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            zIndex: 1000,
                            minWidth: "120px",
                          }}
                        >
                          <button
                            onClick={() => handleActionClick("View Details", row.name)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "14px",
                            }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleActionClick("Edit", row.name)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "14px",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleActionClick("Delete", row.name)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "14px",
                              color: "#dc2626",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee", gap: 16 }}>
              {/* Left Navigation Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "#16a34a",
                  color: "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ‹
              </button>

              {/* Page Numbers with green background */}
              <div style={{ 
                display: "flex", 
                gap: 12, 
                alignItems: "center",
                background: "#f0f9f0",
                padding: "12px 20px",
                borderRadius: "50px",
                width: "fit-content"
              }}>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(15, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: "8px 12px",
                        border: currentPage === page ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: currentPage === page ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: currentPage === page ? "600" : "400"
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {/* Ellipsis */}
                {totalPages > 15 && (
                  <span style={{ 
                    color: "#666", 
                    fontSize: "14px",
                    padding: "0 8px"
                  }}>
                    ...
                  </span>
                )}
                
                {/* Last few pages */}
                {totalPages > 15 && (
                  <>
                    <button
                      onClick={() => handlePageChange(totalPages - 2)}
                      style={{
                        padding: "8px 12px",
                        border: currentPage === totalPages - 2 ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: currentPage === totalPages - 2 ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: currentPage === totalPages - 2 ? "600" : "400"
                      }}
                    >
                      {totalPages - 2}
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages - 1)}
                      style={{
                        padding: "8px 12px",
                        border: currentPage === totalPages - 1 ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: currentPage === totalPages - 1 ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: currentPage === totalPages - 1 ? "600" : "400"
                      }}
                    >
                      {totalPages - 1}
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      style={{
                        padding: "8px 12px",
                        border: currentPage === totalPages ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: currentPage === totalPages ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: currentPage === totalPages ? "600" : "400"
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
              </div>

              {/* Right Navigation Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "#16a34a",
                  color: "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                ›
              </button>
              
              {/* Go to page section */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8
              }}>
                <span style={{ 
                  fontSize: "14px", 
                  color: "#333",
                  fontWeight: "500"
                }}>
                  Go to page:
                </span>
                <PageDropdown 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageSelect={setCurrentPage} 
                />
                <button
                  onClick={() => setCurrentPage(currentPage)}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "none",
                    background: "#16a34a",
                    color: "white",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
      {/* Add Union Head Modal */}
      <AddUnionHeadModal 
        isOpen={isUnionHeadModalOpen} 
        onClose={() => setIsUnionHeadModalOpen(false)} 
      />
      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
      />
      {/* Filter Modal */}
      {filterModalOpen && <FilterModal />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;