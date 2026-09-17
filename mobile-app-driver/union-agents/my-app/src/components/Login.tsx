import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("fleetadmin1@plateau.ng");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role === "DRIVER") {
        navigate("/my-score");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        String(err.message || "").includes("Failed to fetch")
          ? "Cannot reach API at localhost:4000. Is Docker API running?"
          : err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src="/logo.png" alt="Plateau State Logo" className="login-logo" />
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Login to your fleet / driver account.</p>
        {error && <p style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>{error}</p>}

        <div className="login-field">
          <label htmlFor="email">Email Address*</label>
          <input
            id="email"
            type="email"
            placeholder="Type email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password*</label>
          <div className="login-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Type password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="login-forgot">
          <a href="#forgot">Forgot Password?</a>
        </div>

        <button className="login-btn" onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  );
};

export default Login;
