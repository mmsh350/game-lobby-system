import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = mode === "register" ? "register" : "login";
      const response = await axios.post(`${API_URL}/${endpoint}`, { username });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/home");
    } catch (error) {
      console.error(
        `${mode === "register" ? "Registration" : "Login"} failed:`,
        error
      );

      if (error.response) {
        if (error.response.status === 422) {
          setError("Username is already taken");
        } else {
          setError(error.response.data.message || "An error occurred");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Game Lobby</h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Welcome back! Ready to play?"
              : "Create your account to start playing"}
          </p>
        </div>

        <div className="auth-content">
          <div className="mode-toggle">
            <button
              className={`mode-button ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`mode-button ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : mode === "login" ? (
                "Login to Play"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
        <div className="auth-note">
          <p>Join now to compete in our gaming sessions!</p>
        </div>
      </div>
    </div>
  );
}
