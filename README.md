# Electronics Repair Hub

A full-stack web application connecting users with electronics repair technicians.

## Features

- **User**: Book repairs, track status real-time, view history.
- **Service Agent**: View job feed, accept jobs, update status (On the way, In progress, Completed).
- **Real-time**: Socket.IO for instant updates.
- **Security**: JWT Authentication, Role-based access.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Database**: MongoDB

## Prerequisites

- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

## Setup & Run

### 1. Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Check `.env` file.
   - Ensure `MONGO_URI` is correct (default: `mongodb://localhost:27017/startup_hub`).
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

### 2. Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Client runs on `http://localhost:3000`.

## Usage Guide

1. **Register a User**: Go to `/register`, select "User", and create an account.
2. **Register an Agent**: Open a new browser/incognito window, go to `/register`, select "Service Agent", and create an account.
3. **Book a Service**: As a User, log in and submit a service request.
4. **Accept a Job**: As an Agent, log in to view the "Job Feed". You should see the new request. Click "Accept".
5. **Track Status**: The User will see the status change. The Agent can update the status as they progress.

## Project Structure

- `client/`: Next.js Frontend
  - `src/app/`: Pages (Login, Register, Dashboard)
  - `src/context/`: Auth State Management
  - `src/services/`: API Axios instance
- `server/`: Node.js Backend
  - `models/`: Mongoose Schemas (User, Agent, ServiceRequest)
  - `controllers/`: Logic for Auth and Requests
  - `routes/`: API Endpoints
  - `index.js`: Server entry point & Socket.IO setup
