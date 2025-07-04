import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useSessionTimer() {
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [userSelection, setUserSelection] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [winningNumber, setWinningNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchCurrentSession() {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.get(`${API_URL}/current-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newSession = response.data.session;
      setSession(newSession);

      const endTime = new Date(newSession.end_time);
      const now = new Date();
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeLeft(timeLeft);

      if (timeLeft > 0) {
        setCooldown(0);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkSessionResults(sessionId) {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.get(
        `${API_URL}/session-results/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userSelection = response.data.session.selections.find(
        (sel) => sel.user_id === user.id
      );

      if (userSelection) {
        setLastResult({
          won:
            userSelection.selected_number ===
            response.data.session.winning_number,
          selectedNumber: userSelection.selected_number,
          winningNumber: response.data.session.winning_number,
        });
      }

      setWinningNumber(response.data.session.winning_number);
      setShowResultModal(true);
    } catch (error) {
      console.error("Error checking results:", error);
    }
  }

  useEffect(() => {
    fetchCurrentSession();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (prev === 1 && session) {
            setCooldown(20);
            checkSessionResults(session.id);
          }
          return 0;
        }
        return prev - 1;
      });

      setCooldown((prev) => {
        if (prev <= 1 && prev > 0) {
          fetchCurrentSession();
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.id]);

  return {
    session,
    timeLeft,
    cooldown,
    lastResult,
    showResultModal,
    winningNumber,
    isLoading,
    closeModal: () => setShowResultModal(false),
    trackSelection: setUserSelection,
    clearResult: () => setLastResult(null),
    refreshSession: fetchCurrentSession,
  };
}
