import React, { useEffect, useState } from "react";
import AccountDetailsDrawer from "./AccountDetailsDrawer";
import { DriverType } from "../types/driver";
import TransactionsModal from "./TransactionsModal";
import { Transaction } from "../utils/mockTransactions";
import { api } from "../api/client";
import { mapDriverRow, mapPaymentRow } from "../utils/apiMappers";

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

const itemsPerPage = 10;

const AccountsDriversTable: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [transactionsUser, setTransactionsUser] = useState<DriverType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api("/api/v1/users?role=DRIVER")
      .then((rows) => setDrivers(rows.map(mapDriverRow)))
      .catch((e) => setLoadError(e.message));
  }, []);

  // Filtered and paginated data
  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.nin.includes(search) ||
      d.vehicle.plateNumber.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage) || 1);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleMenuClick = (id: number | string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleAction = async (action: string, driver: DriverType) => {
    if (action === "View Profile") {
      setSelectedDriver(driver);
      setDrawerOpen(true);
    } else if (action === "Transactions") {
      setTransactionsUser(driver);
      try {
        const rows = await api(`/api/v1/payments?userId=${driver.id}`);
        setTransactions(
          rows.map((p: any) => {
            const m = mapPaymentRow(p);
            const created = p.created_at ? new Date(p.created_at) : new Date();
            return {
              id: String(p.id),
              date: m.date,
              time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              amount: m.amount,
              status: (m.status === 'Success' || m.status === 'Pending' || m.status === 'Failed'
                ? m.status
                : 'Pending') as 'Success' | 'Pending' | 'Failed',
              paymentMethod: m.type,
              location: p.plate_number || '—',
              description: p.description || '',
            };
          })
        );
      } catch {
        setTransactions([]);
      }
      setTransactionsModalOpen(true);
    }
    setOpenMenuId(null);
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
    if (selectedRows.length === paginated.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginated.map(driver => driver.id));
    }
  };

  const isAllSelected = paginated.length > 0 && selectedRows.length === paginated.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginated.length;

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    dateRange: "all",
    licenseStatus: "all"
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    dateRange: "all",
    licenseStatus: "all"
  });
  const [draftFilters, setDraftFilters] = useState({
    status: "all",
    dateRange: "all",
    licenseStatus: "all"
  });

  const handleFilterApply = (newFilters: typeof filterOptions) => {
    setAppliedFilters(newFilters);
    setFilterModalOpen(false);
    setPage(1); // Reset to first page when filters are applied
    console.log("Applied filters:", newFilters);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      status: "all",
      dateRange: "all",
      licenseStatus: "all"
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
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Filter Drivers</h3>
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
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>License Status</label>
          <select
            value={draftFilters.licenseStatus}
            onChange={(e) => setDraftFilters(prev => ({ ...prev, licenseStatus: e.target.value }))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All License Status</option>
            <option value="Valid">Valid</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
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

      {/* Table */}
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
            <th style={{ padding: "12px 8px", textAlign: "left" }}>Phone Number</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>Residential Address</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>NIN</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>Drivers License</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}></th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((driver) => (
            <tr key={driver.id} style={{ 
              borderBottom: "1px solid #eee",
              background: selectedRows.includes(driver.id) ? "#f0fdf4" : undefined 
            }}>
              <td style={{ padding: "12px 8px" }}>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(driver.id)}
                  onChange={() => handleSelectRow(driver.id)}
                  style={{ cursor: "pointer" }}
                />
              </td>
              <td style={{ padding: "12px 8px" }}>{driver.name}</td>
              <td style={{ padding: "12px 8px" }}>{driver.phone}</td>
              <td style={{ padding: "12px 8px" }}>{driver.address}</td>
              <td style={{ padding: "12px 8px" }}>{driver.nin}</td>
              <td style={{ padding: "12px 8px" }}>{driver.license}</td>
              <td style={{ padding: "12px 8px", position: "relative" }}>
                <button
                  onClick={() => handleMenuClick(driver.id)}
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
                {openMenuId === driver.id && (
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
                      minWidth: "140px",
                    }}
                  >
                    <button
                      onClick={() => handleAction("View Profile", driver)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <img src="/user-03 (2).png" alt="profile" style={{ width: "16px", height: "16px" }} /> View Profile
                    </button>
                    <button
                      onClick={() => handleAction("Transactions", driver)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "14px",
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
      {/* Account Details Drawer */}
      <AccountDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        driver={selectedDriver}
      />
      {/* Transactions Modal */}
      <TransactionsModal
        isOpen={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        userName={transactionsUser ? transactionsUser.name : ""}
        userType="Driver"
        transactions={transactions}
      />
      {filterModalOpen && <FilterModal />}
    </div>
  );
};

export default AccountsDriversTable;