import React, { useState } from "react";
import {
  validateAdminLogin,
  logoutAdmin,
  verifyToken,
  getCurrentAdminFromBackend,
} from "../utils/auth";

const AuthTestComponent = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      // Test with your backend admin credentials
      const result = await validateAdminLogin("admin@cinebook.com", "admin123");
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      await logoutAdmin();
      setResult("Logout successful");
    } catch (error) {
      setResult(`Logout Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokenValidation = async () => {
    setLoading(true);
    try {
      const isValid = await verifyToken();
      setResult(`Token valid: ${isValid}`);
    } catch (error) {
      setResult(`Token validation error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentAdmin = async () => {
    setLoading(true);
    try {
      const admin = await getCurrentAdminFromBackend();
      setResult(JSON.stringify(admin, null, 2));
    } catch (error) {
      setResult(`Get admin error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/health");
      const data = await response.json();
      setResult(`Health check: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Health check error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Authentication Test Component</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testDirectAPI}
          disabled={loading}
          style={{ margin: "5px", padding: "10px" }}
        >
          Test Health Check
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          style={{ margin: "5px", padding: "10px" }}
        >
          Test Login
        </button>
        <button
          onClick={testLogout}
          disabled={loading}
          style={{ margin: "5px", padding: "10px" }}
        >
          Test Logout
        </button>
        <button
          onClick={testTokenValidation}
          disabled={loading}
          style={{ margin: "5px", padding: "10px" }}
        >
          Test Token Validation
        </button>
        <button
          onClick={testGetCurrentAdmin}
          disabled={loading}
          style={{ margin: "5px", padding: "10px" }}
        >
          Test Get Current Admin
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Current Token:</h3>
        <pre
          style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}
        >
          {localStorage.getItem("adminToken") || "No token stored"}
        </pre>
      </div>

      <div>
        <h3>Test Result:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            minHeight: "100px",
            overflow: "auto",
          }}
        >
          {loading ? "Loading..." : result || "Click a button to test"}
        </pre>
      </div>
    </div>
  );
};

export default AuthTestComponent;
