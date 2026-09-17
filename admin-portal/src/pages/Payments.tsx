import React, { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import PaymentDetailsDrawer from "../components/PaymentDetailsDrawer";
import { api } from "../api/client";
import { mapPaymentRow } from "../utils/apiMappers";

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

// Summary cards data (overridden from API)
const defaultSummaryCards = [
  { label: "All Payments", value: "0", icon: "/money-bag.png" },
  { label: "Pending Payments", value: "0", icon: "/money-bag.png" },
  { label: "Successful Payments", value: "0", icon: "/money-bag.png" },
  { label: "Failed Payments", value: "0", icon: "/money-bag.png" },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  Success: { color: "#16a34a", bg: "#dcfce7" },
  Pending: { color: "#f59e0b", bg: "#fef3c7" },
  Failed: { color: "#dc2626", bg: "#fee2e2" },
};

type PaymentsProps = {
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
};

const Payments: React.FC<PaymentsProps> = ({ searchModalOpen, setSearchModalOpen, searchValue, setSearchValue }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [summaryCards, setSummaryCards] = useState(defaultSummaryCards);
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
  const itemsPerPage = 10;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/api/v1/payments")
      .then((rows) =>
        setPayments(
          (rows || []).map((p: any) => {
            const m = mapPaymentRow(p);
            return { ...m, idNumber: m.idNo };
          })
        )
      )
      .catch(() => setPayments([]));
    api("/api/v1/payments/summary")
      .then((s: any) => {
        if (!s) return;
        setSummaryCards([
          { label: "All Payments", value: String(s.total_count ?? 0).toLocaleString(), icon: "/money-bag.png" },
          { label: "Pending Payments", value: String(s.pending_count ?? 0).toLocaleString(), icon: "/money-bag.png" },
          { label: "Successful Payments", value: String(s.success_count ?? 0).toLocaleString(), icon: "/money-bag.png" },
          { label: "Failed Payments", value: String(s.failed_count ?? 0).toLocaleString(), icon: "/money-bag.png" },
        ]);
      })
      .catch(() => {});
  }, []);

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

  // Filtered and paginated data
  const filtered = payments.filter(
    (p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                           (p.idNumber || p.idNo || "").toLowerCase().includes(search.toLowerCase()) ||
                           p.type.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = appliedFilters.status === "all" || p.status === appliedFilters.status;
      const matchesType = appliedFilters.type === "all" || p.type === appliedFilters.type;
      
      return matchesSearch && matchesStatus && matchesType;
    }
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Select all and individual row handlers
  const handleSelectAll = () => {
    if (selectedRows.length === paginated.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginated.map(payment => payment.id));
    }
  };

  const handleSelectRow = (id: number | string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected = paginated.length > 0 && selectedRows.length === paginated.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginated.length;

  const handleFilterApply = (newFilters: typeof filterOptions) => {
    setAppliedFilters(newFilters);
    setFilterModalOpen(false);
    setPage(1); // Reset to first page when filters are applied
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
    setPage(1); // Reset to first page when filters are reset
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
            <option value="year">This Year</option>
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
        <Topbar pageTitle="Payments" />
        <main style={{ padding: "2rem", background: "#f5f5f5", minHeight: "100vh" }}>
          {/* Summary Cards */}
          <div style={{ 
            display: "flex", 
            gap: 24, 
            marginBottom: 32,
            flexWrap: "wrap"
          }}>
            {summaryCards.map((item, idx) => (
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
                <div style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>{item.label}</div>
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>{item.value}</span>
                  <img src={item.icon} alt={item.label + " icon"} style={{ width: 32, height: 32, marginLeft: 12, objectFit: "contain" }} />
                </div>
                {/* Decorative spiral icon */}
                <img src="/spiral.png" alt="decorative spiral" style={{ position: "absolute", right: 0, bottom: 0, width: 60, pointerEvents: "none", zIndex: 0, opacity: 0.7 }} />
              </div>
            ))}
          </div>
          {/* Table Card */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>Recent Payments</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Filter Button */}
                <button
                  onClick={() => {
                    setDraftFilters(appliedFilters); // Initialize draft with current applied filters
                    setFilterModalOpen(true);
                  }}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "white",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src="/Filter.png" alt="Filter" style={{ width: "14px", height: "14px" }} />
                </button>
                                 <div style={{ position: "relative" }}>
                   <input
                     type="text"
                     placeholder="Search..."
                     value={search}
                     onChange={(e) => {
                       setSearch(e.target.value);
                       setPage(1);
                     }}
                     style={{
                       padding: "8px 12px",
                       paddingLeft: "40px",
                       border: "1px solid #ddd",
                       borderRadius: "8px",
                       fontSize: "14px",
                       minWidth: "200px",
                     }}
                   />
                   <img 
                     src="/search-02.png" 
                     alt="search" 
                     style={{ 
                       position: "absolute", 
                       left: "12px", 
                       top: "50%", 
                       transform: "translateY(-50%)", 
                       width: "16px", 
                       height: "16px",
                       pointerEvents: "none"
                     }} 
                   />
                 </div>
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
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>ID Number</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Transaction Type</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Amount</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id} style={{ 
                    borderBottom: "1px solid #eee",
                    background: selectedRows.includes(row.id) ? "#f0fdf4" : undefined 
                  }}>
                    <td style={{ padding: "12px 8px" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ padding: "12px 8px" }}>{row.name}</td>
                    <td style={{ padding: "12px 8px" }}>{row.idNumber || row.idNo}</td>
                    <td style={{ padding: "12px 8px" }}>{row.type}</td>
                    <td style={{ padding: "12px 8px" }}>{row.amount}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          background: (statusColors[row.status] || statusColors.Pending).bg,
                          color: (statusColors[row.status] || statusColors.Pending).color,
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{row.date}</td>
                    <td style={{ padding: "12px 8px", position: "relative" }}>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setSelectedPayment(row);
                          setDrawerOpen(true);
                        }}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16, gap: 16 }}>
              {/* Left Navigation Button */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "#16a34a",
                  color: "white",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: page === 1 ? 0.5 : 1
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
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      style={{
                        padding: "8px 12px",
                        border: page === pg ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: page === pg ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: page === pg ? "600" : "400"
                      }}
                    >
                      {pg}
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
                      onClick={() => setPage(totalPages - 2)}
                      style={{
                        padding: "8px 12px",
                        border: page === totalPages - 2 ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: page === totalPages - 2 ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: page === totalPages - 2 ? "600" : "400"
                      }}
                    >
                      {totalPages - 2}
                    </button>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      style={{
                        padding: "8px 12px",
                        border: page === totalPages - 1 ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: page === totalPages - 1 ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: page === totalPages - 1 ? "600" : "400"
                      }}
                    >
                      {totalPages - 1}
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      style={{
                        padding: "8px 12px",
                        border: page === totalPages ? "2px solid #16a34a" : "none",
                        background: "transparent",
                        color: page === totalPages ? "#16a34a" : "#333",
                        cursor: "pointer",
                        borderRadius: "50%",
                        minWidth: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: page === totalPages ? "600" : "400"
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
              </div>

              {/* Right Navigation Button */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "#16a34a",
                  color: "white",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: page === totalPages ? 0.5 : 1
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
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageSelect={setPage} 
                />
                <button
                  onClick={() => setPage(page)}
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
          {/* Payment Details Drawer */}
          <PaymentDetailsDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            payment={selectedPayment}
          />
          {filterModalOpen && <FilterModal />}
        </main>
      </div>
    </div>
  );
};

export default Payments;