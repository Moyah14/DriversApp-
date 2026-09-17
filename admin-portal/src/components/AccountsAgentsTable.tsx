import React, { useEffect, useState } from "react";
import AgentDetailsDrawer from "./AgentDetailsDrawer";
import { AgentType } from "../types/agent";
import TransactionsModal from "./TransactionsModal";
import { Transaction } from "../utils/mockTransactions";
import { exportToCSV } from "../utils/exportUtils";
import { api } from "../api/client";
import { formatDate, formatNaira, mapPaymentRow } from "../utils/apiMappers";

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

function mapAgentRow(u: any): AgentType {
  return {
    id: u.id,
    name: u.full_name || u.name || "—",
    email: u.email || "—",
    phone: u.phone || "—",
    address: u.address || "—",
    driversRegistered: u.drivers_registered ?? u.drivers_count ?? 0,
    level: u.level || "Level 1",
    status: (u.status === "active" ? "Active" : "Suspended") as "Active" | "Suspended",
    dateRegistered: formatDate(u.created_at),
    registeredBy: u.registered_by_name || "System",
    totalEarnings: formatNaira(u.total_earnings || u.card_balance),
    commission: formatNaira(u.commission),
  };
}

const AccountsAgentsTable: React.FC = () => {
  const [agentsData, setAgentsData] = useState<AgentType[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [transactionsUser, setTransactionsUser] = useState<AgentType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    api("/api/v1/users?role=AGENT")
      .then((rows) => setAgentsData((rows || []).map(mapAgentRow)))
      .catch(() => setAgentsData([]));
  }, []);

  // Filter agents based on search and filters
  const filteredAgents = agentsData.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
                         agent.email.toLowerCase().includes(search.toLowerCase()) ||
                         agent.phone.includes(search);
    
    const matchesStatus = appliedFilters.status === "all" || agent.status === appliedFilters.status;
    const matchesLevel = appliedFilters.level === "all" || agent.level === appliedFilters.level;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const totalPages = Math.ceil(filteredAgents.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const paginatedAgents = filteredAgents.slice(startIndex, startIndex + 10);

  const handleViewProfile = (agent: AgentType) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
    setOpenMenuId(null);
  };

  const handleTransactions = async (agent: AgentType) => {
    setTransactionsUser(agent);
    try {
      const rows = await api(`/api/v1/payments?userId=${agent.id}`);
      setTransactions(
        (rows || []).map((p: any) => {
          const m = mapPaymentRow(p);
          const created = p.created_at ? new Date(p.created_at) : new Date();
          return {
            id: String(p.id),
            date: m.date,
            time: created.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            amount: m.amount,
            status: (m.status === "Success" || m.status === "Pending" || m.status === "Failed"
              ? m.status
              : "Pending") as "Success" | "Pending" | "Failed",
            paymentMethod: m.type,
            location: p.plate_number || "—",
            description: p.description || "",
          };
        })
      );
    } catch {
      setTransactions([]);
    }
    setTransactionsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDownloadReport = () => {
    const reportData = filteredAgents.map(agent => ({
      Name: agent.name,
      Email: agent.email,
      Phone: agent.phone,
      Address: agent.address,
      "Drivers Registered": agent.driversRegistered,
      Level: agent.level,
      Status: agent.status,
      "Date Registered": agent.dateRegistered,
    }));
    exportToCSV(reportData, "agents_report");
  };

  // Checkbox handlers
  const handleSelectRow = (id: number | string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedAgents.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedAgents.map(agent => agent.id));
    }
  };

  const isAllSelected = paginatedAgents.length > 0 && selectedRows.length === paginatedAgents.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginatedAgents.length;

  const handleFilterApply = (newFilters: typeof filterOptions) => {
    setAppliedFilters(newFilters);
    setFilterModalOpen(false);
    console.log("Applied filters:", newFilters);
  };

  const handleFilterReset = () => {
    setDraftFilters({
      status: "all",
      level: "all",
      dateRange: "all"
    });
    setAppliedFilters({
      status: "all",
      level: "all",
      dateRange: "all"
    });
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
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Filter Agents</h3>
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
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
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
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
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
    <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      {/* Table header: search and filter */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Recently Added Accounts</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Name
              </th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Email Address
              </th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Phone Number
              </th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                No of Drivers Registered
              </th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Level
              </th>
              <th style={{ padding: "1rem", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                Actions
              </th>
          </tr>
        </thead>
        <tbody>
            {paginatedAgents.map((agent) => (
              <tr key={agent.id} style={{ 
                borderBottom: "1px solid #f1f5f9",
                background: selectedRows.includes(agent.id) ? "#f0fdf4" : undefined 
              }}>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(agent.id)}
                    onChange={() => handleSelectRow(agent.id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                {agent.name}
              </td>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                  {agent.email}
                </td>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                  {agent.phone}
                </td>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                {agent.driversRegistered} drivers
              </td>
                <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                {agent.level}
              </td>
                <td style={{ padding: "1rem", textAlign: "center", position: "relative" }}>
                <button
                    onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)}
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
                {openMenuId === agent.id && (
                    <div style={{
                      position: "absolute",
                      right: "1rem",
                      top: "100%",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      minWidth: "150px",
                    }}>
                    <button
                        onClick={() => handleViewProfile(agent)}
                      style={{
                        width: "100%",
                          padding: "0.75rem 1rem",
                        border: "none",
                        background: "none",
                          textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                          color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                        <img src="/user-03 (2).png" alt="profile" style={{ width: "16px", height: "16px" }} /> View Profile
                    </button>
                    <button
                        onClick={() => handleTransactions(agent)}
                      style={{
                        width: "100%",
                          padding: "0.75rem 1rem",
                        border: "none",
                        background: "none",
                          textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                          color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                        <img src="/money-exchange-01.png" alt="transactions" style={{ width: "16px", height: "16px" }} /> Transactions
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "2rem",
        padding: "0 1rem",
        gap: "16px"
      }}>
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid #16a34a",
            background: currentPage === 1 ? "#f3f4f6" : "white",
            borderRadius: "50%",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            color: currentPage === 1 ? "#9ca3af" : "#16a34a",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ‹
        </button>

        {/* Page Numbers with green background */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          background: "#f0f9f0",
          padding: "12px 20px",
          borderRadius: "50px",
          width: "fit-content"
        }}>

          {/* Page Numbers */}
          {(() => {
            const pageNumbers = [];
            const showEllipsisStart = currentPage > 3;
            const showEllipsisEnd = currentPage < totalPages - 2;

            // Always show first page
            if (totalPages > 0) {
              pageNumbers.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: currentPage === 1 ? "2px solid #16a34a" : "1px solid #e5e7eb",
                    background: currentPage === 1 ? "#16a34a" : "white",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: currentPage === 1 ? "white" : "#333",
                    fontSize: "14px",
                    fontWeight: currentPage === 1 ? "600" : "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  1
                </button>
              );
            }

            // Show ellipsis if needed
            if (showEllipsisStart) {
              pageNumbers.push(
                <span key="ellipsis-start" style={{ 
                  padding: "0 8px", 
                  color: "#9ca3af",
                  fontSize: "14px"
                }}>
                  ...
                </span>
              );
            }

            // Show pages around current page
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
              if (i !== 1 && i !== totalPages) {
                pageNumbers.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: currentPage === i ? "2px solid #16a34a" : "1px solid #e5e7eb",
                      background: currentPage === i ? "#16a34a" : "white",
                      borderRadius: "50%",
                      cursor: "pointer",
                      color: currentPage === i ? "white" : "#333",
                      fontSize: "14px",
                      fontWeight: currentPage === i ? "600" : "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {i}
                  </button>
                );
              }
            }

            // Show ellipsis if needed
            if (showEllipsisEnd) {
              pageNumbers.push(
                <span key="ellipsis-end" style={{ 
                  padding: "0 8px", 
                  color: "#9ca3af",
                  fontSize: "14px"
                }}>
                  ...
                </span>
              );
            }

            // Always show last page (if more than 1 page)
            if (totalPages > 1) {
              pageNumbers.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: currentPage === totalPages ? "2px solid #16a34a" : "1px solid #e5e7eb",
                    background: currentPage === totalPages ? "#16a34a" : "white",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: currentPage === totalPages ? "white" : "#333",
                    fontSize: "14px",
                    fontWeight: currentPage === totalPages ? "600" : "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {totalPages}
                </button>
              );
            }

            return pageNumbers;
          })()}

        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid #16a34a",
            background: currentPage === totalPages ? "#f3f4f6" : "white",
            borderRadius: "50%",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            color: currentPage === totalPages ? "#9ca3af" : "#16a34a",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ›
        </button>

        {/* Go to Page Dropdown */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px"
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

      {/* Agent Details Drawer */}
      <AgentDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        agent={selectedAgent}
      />
      {/* Transactions Modal */}
      <TransactionsModal
        isOpen={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        userName={transactionsUser ? transactionsUser.name : ""}
        userType="Agent"
        transactions={transactions}
      />
      {filterModalOpen && <FilterModal />}
    </div>
  );
};

export default AccountsAgentsTable;