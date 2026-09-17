import React, { useState } from "react";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
  status: "Success" | "Pending" | "Failed";
  paymentMethod: string;
  location: string;
  description?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userType: "Driver" | "Agent" | "Union Head";
  transactions: Transaction[];
}

const TransactionsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  userName, 
  userType, 
  transactions 
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.id.toLowerCase().includes(search.toLowerCase()) ||
                         transaction.location.toLowerCase().includes(search.toLowerCase()) ||
                         transaction.amount.includes(search);
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "#10b981";
      case "Pending":
        return "#f59e0b";
      case "Failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Success":
        return "#d1fae5";
      case "Pending":
        return "#fef3c7";
      case "Failed":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>
              Transaction History
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
              {userType}: {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.5rem",
            }}
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                width: "300px",
              }}
            />
            <span style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
            }}>
              🔍
            </span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            <option value="all">All Status</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <div style={{ marginLeft: "auto", fontSize: "14px", color: "#6b7280" }}>
            {filteredTransactions.length} transactions found
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f9fafb" }}>
              <tr>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Transaction ID
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Date & Time
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Amount
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Status
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Payment Method
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937", fontFamily: "monospace" }}>
                    {transaction.id}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                    <div>{transaction.date}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{transaction.time}</div>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                    {transaction.amount}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: getStatusBgColor(transaction.status),
                        color: getStatusColor(transaction.status),
                      }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                    {transaction.paymentMethod}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "14px", color: "#1f2937" }}>
                    {transaction.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "1rem 2rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  background: "white",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ padding: "0.5rem 1rem", fontSize: "14px" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  background: "white",
                  borderRadius: "6px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsModal;