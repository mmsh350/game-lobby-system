import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSessionTimer from "../hooks/useSessionTimer";
import Modal from "react-modal";

export default function HomePage() {
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();
  const {
    session,
    timeLeft,
    cooldown,
    lastResult,
    showResultModal,
    closeModal,
    trackSelection,
    clearResult,
    refreshSession,
  } = useSessionTimer();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    fetchLeaderboard();
  }, [navigate]);

  useEffect(() => {
    if (showResultModal) {
      fetchLeaderboard();
    }
  }, [showResultModal]);

  async function fetchLeaderboard() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://lobby.zepaapi.com/api/leaderboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  async function handleJoinSession() {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://lobby.zepaapi.com/api/join-session",
        { selected_number: selectedNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      trackSelection(selectedNumber);
      alert("Joined session successfully!");
      refreshSession();
      fetchLeaderboard();
    } catch (error) {
      alert(error.response?.data?.message || "Error joining session");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  }

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="game-container">
      <header className="game-header">
        <h2>Welcome, {user?.username}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="game-session">
        <h3>Current Session</h3>
        {session ? (
          <>
            {timeLeft > 0 ? (
              <>
                <p className="session-timer">Time left: {timeLeft} seconds</p>
                <div className="number-selector">
                  <label>Select a number (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedNumber}
                    onChange={(e) =>
                      setSelectedNumber(parseInt(e.target.value))
                    }
                    className="number-input"
                  />
                  <button className="join-btn" onClick={handleJoinSession}>
                    Join Session
                  </button>
                </div>
              </>
            ) : cooldown > 0 ? (
              <p className="cooldown-timer">
                New session starts in {cooldown} seconds...
              </p>
            ) : (
              <p>Session closed. Waiting for next session to start...</p>
            )}
          </>
        ) : (
          <p>Loading session...</p>
        )}
      </section>

      <section className="leaderboard">
        <h3>Leaderboard</h3>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Wins</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => (
              <tr key={player.username}>
                <td>{player.username}</td>
                <td>{player.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Modal
        isOpen={showResultModal}
        onRequestClose={closeModal}
        contentLabel="Session Results"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h3>Session Results</h3>
          {lastResult && (
            <div
              className={`result-message ${lastResult.won ? "won" : "lost"}`}
            >
              {lastResult.won ? (
                <p>
                  🎉 You won! Your number {lastResult.selectedNumber} was
                  correct!
                </p>
              ) : (
                <p>
                  😢 You lost. You picked {lastResult.selectedNumber}, winning
                  number was {lastResult.winningNumber}
                </p>
              )}
            </div>
          )}
          <button onClick={closeModal} className="modal-close-btn">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
