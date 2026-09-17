import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("admin@plateau.gov.ng");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role !== "SYSTEM_ADMIN") {
        setError("This portal is for System Administrators only.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("superadmin_signed_in");
        return;
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Change your password");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #8fd3f4 0%, #84fab0 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          minWidth: 350,
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/plateau-logo.png"
          alt="Plateau State Government Logo"
          style={{ width: 80, height: 80, marginBottom: 24 }}
        />
        <h2 style={{ margin: 0, marginBottom: 8, fontWeight: 700, fontSize: 28, textAlign: "center" }}>
          Welcome Back!
        </h2>
        <div style={{ color: "#444", marginBottom: 28, textAlign: "center" }}>
          Login to your account with your details.
        </div>
        <form style={{ width: "100%" }} onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: "#b91c1c", marginBottom: 12, fontSize: 14, textAlign: "center" }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: "block" }}>
              Email Address*
            </label>
            <input
              type="email"
              placeholder="Type email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "95%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 15,
                marginTop: 4,
                marginBottom: 2,
              }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: "block" }}>
              Password*
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Type password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 15,
                  marginTop: 4,
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#888",
                  padding: 0,
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <span role="img" aria-label="Hide">🙈</span>
                ) : (
                  <span role="img" aria-label="Show">👁️</span>
                )}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <a
              href="#"
              onClick={handleForgotPassword}
              style={{ color: "#16a34a", fontSize: 14, textDecoration: "none", cursor: "pointer" }}
            >
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontWeight: 600,
              fontSize: 17,
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn; 