import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSessionTimer from "../hooks/useSessionTimer";

export default function HomePage() {
  const [selectedNumber, setSelectedNumber] = useState(1);
  // const [hideInput, setHideInput] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();
  const { session, timeLeft, refreshSession } = useSessionTimer();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    fetchLeaderboard();
  }, [navigate]);

  // useEffect(() => {
  //   if (timeLeft === 0) {
  //     setHideInput(true);
  //   }
  // }, [timeLeft]);

  async function fetchLeaderboard() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8090/api/leaderboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        "http://localhost:8090/api/join-session",
        { selected_number: selectedNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Joined session successfully!");
      refreshSession();
      fetchLeaderboard();
      // setHideInput(false);
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
      <header>
        <h2>Welcome, {user?.username}</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="game-session">
        <h3>Current Session</h3>
        {session ? (
          <>
            <p>Time left: {timeLeft} seconds</p>
            {timeLeft > 0 ? (
              <div className="number-selection">
                <label>Select a number (1-10): </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={selectedNumber}
                  onChange={(e) => setSelectedNumber(parseInt(e.target.value))}
                />
                <button onClick={handleJoinSession}>Join Session</button>
              </div>
            ) : (
              <p>Session closed. Waiting for next session...</p>
            )}
          </>
        ) : (
          <p>Loading session...</p>
        )}
      </section>

      <section className="leaderboard">
        <h3>Leaderboard</h3>
        <table>
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
    </div>
  );
}
