import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PaymentAdvanced from "./components/PaymentAdvanced";
import Accounts from "./components/Accounts";
import RoutesComponent from "./components/Routes";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import {
  FleetPage,
  ScorecardsPage,
  LiveTrackingPage,
  AlertsPage,
  DriverPortalPage,
} from "./components/FleetFeatures";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentAdvanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes"
            element={
              <ProtectedRoute>
                <RoutesComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fleet"
            element={
              <ProtectedRoute>
                <AppShell title="Fleet">
                  <FleetPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scorecards"
            element={
              <ProtectedRoute>
                <AppShell title="Scorecards">
                  <ScorecardsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <AppShell title="Live Tracking">
                  <LiveTrackingPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AppShell title="Alerts">
                  <AlertsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-score"
            element={
              <ProtectedRoute>
                <AppShell title="My Performance">
                  <DriverPortalPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
