import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useSessionTimer() {
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

//   async function fetchCurrentSession() {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:8090/api/current-session', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSession(response.data.session);
//       let time_left = now() - response.data.session.end_time;
//       console.log(time_left);
//     //   setTimeLeft(time_left);

//     } catch (error) {
//       console.error('Error fetching session:', error);
//     }
//   }
async function fetchCurrentSession() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8090/api/current-session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSession(response.data.session);
      
      // Parse the end time from the server
      const endTime = new Date(response.data.session.end_time);
      const now = new Date();
      
      // Calculate time left in seconds
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
      
      console.log(timeLeft);
      setTimeLeft(timeLeft);
  
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  }

  useEffect(() => {
    fetchCurrentSession();
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          fetchCurrentSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { session, timeLeft, refreshSession: fetchCurrentSession };
}