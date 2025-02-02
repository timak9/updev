# 🗨️ Real-Time Chat Application (React + FastAPI)

This application is a real-time chat platform built with **React (Frontend)** and **FastAPI (Backend)**. Users can register, log in, and exchange messages via WebSockets.

## Features
- User authentication (registration & login)
- Real-time chat with WebSockets
- Message history
- Secure password storage with bcrypt

##  Installation

### Prerequisites
- **Node.js** (for frontend)
- **Python 3.8+** (for backend)

### Clone the project
```sh
git clone https://github.com/timak9/updev.git
cd updev
```

## Backend Installation (FastAPI)

1. Navigate to the backend directory:
```sh
cd chat-backend
```

2. Create a virtual environment (recommended):
```sh
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```sh
pip install -r requirements.txt
```

4. Start the FastAPI server:
```sh
uvicorn chat_backend:app --reload
```

The backend is now running at `http://127.0.0.1:8000`.

## Frontend Installation (React)

1. Navigate to the frontend directory:
```sh
cd chat-frontend
```

2. Install dependencies:
```sh
npm install
```

3. Start the React application:
```sh
npm start
```

The frontend is now running at `http://localhost:3000`.

