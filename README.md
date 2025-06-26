# Chatify

Chatify is a real-time chat application that supports multiple chat modes, including random chat, specific chat, group chat rooms, and random video chat. It is built with a React frontend (using Vite) and a Node.js/Express backend with Socket.IO for real-time communication.

## Features

- **Random Chat**: Instantly connect and chat with a random user.
- **Specific Chat**: Connect with a specific user by their ID or username.
- **Group Chat Rooms**: Create or join chat rooms and chat with multiple users.
- **Random Video Chat**: Connect with a random user for a video chat session.
- **Real-time Messaging**: All chats are powered by Socket.IO for instant message delivery.
- **User Typing Indicators**: See when your chat partner is typing.
- **Room Management**: Create, join, and manage chat rooms dynamically.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Running Locally

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd Chatify
   ```

2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Start the backend server:**
   ```sh
   node src/index.js
   ```
   The backend will run at [http://localhost:3000](http://localhost:3000)

4. **Install frontend dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```

5. **Start the frontend development server:**
   ```sh
   npm run dev
   ```
   The frontend will run at [http://localhost:5173](http://localhost:5173)

6. **Open your browser and navigate to** [http://localhost:5173](http://localhost:5173)

## Project Structure

- `backend/` - Node.js/Express backend with Socket.IO
- `frontend/` - React frontend (Vite)

## Notes

- Make sure both backend and frontend servers are running for the app to work correctly.
- The backend uses CORS to allow requests from the frontend dev server.

---
Feel free to contribute or open issues for improvements!