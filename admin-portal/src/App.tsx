import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Payments from "./pages/Payments";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Parks from "./pages/Parks";
import RoutesPage from "./pages/Routes";
import Analytics from "./pages/Analytics";
import SignIn from "./pages/SignIn";
import Tenants from "./pages/Tenants";
import AuditLogs from "./pages/AuditLogs";
import GlobalSearchModal from "./components/GlobalSearchModal";

const isAuthenticated = () => {
  return (
    localStorage.getItem("superadmin_signed_in") === "true" ||
    !!localStorage.getItem("token")
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const searchProps = {
    searchModalOpen,
    setSearchModalOpen,
    searchValue,
    setSearchValue,
  };

  return (
    <Router>
      <GlobalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onOpen={() => setSearchModalOpen(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard" element={<Dashboard {...searchProps} />} />
                <Route path="tenants" element={<Tenants {...searchProps} />} />
                <Route path="audit" element={<AuditLogs {...searchProps} />} />
                <Route path="accounts" element={<Accounts {...searchProps} />} />
                <Route path="payments" element={<Payments {...searchProps} />} />
                <Route path="parks" element={<Parks {...searchProps} />} />
                <Route path="routes" element={<RoutesPage {...searchProps} />} />
                <Route path="analytics" element={<Analytics {...searchProps} />} />
                <Route path="support" element={<Support {...searchProps} />} />
                <Route path="settings" element={<Settings {...searchProps} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
