## React Frontend – `README.md`

````markdown
# Game Lobby Frontend (React)

This is the React-based frontend interface for the Game Lobby system. It lets users register, log in, join a game session by selecting a number, and view live leaderboard and session results.

🔗 **Live App**:  
[https://game-lobby-system-chi.vercel.app/auth](https://game-lobby-system-chi.vercel.app)

## Features

- Register and login
- Join active session (once per round)
- Timer countdown display
- Live leaderboard
- Session result display after expiry

## Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mmsh350/game-lobby-system.git
   cd game-lobby-system
   ```

2. Install Dependency

```bash
npm install
```

3. Set up environment variables:
   Create a .env file and add your backend URL:

   ```bash REACT_APP_API_URL=https://lobby.zepaapi.com/api

   ```

4. Start Development Server

   ```bash
   npm start

   ```

5. Backend Integration

- All requests are made via Axios
- Uses Bearer token from login API
- Tokens and user data are stored in localStorage
````
