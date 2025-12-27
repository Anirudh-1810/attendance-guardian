# Attendance Guardian

Attendance Guardian is a full-stack web application designed to help students track their attendance across various subjects and semesters. It allows users to manage their courses, record class attendance, and monitor their attendance percentage to ensure they meet the minimum requirements (default 75%).

## Features

- **User Authentication**: Secure signup and login functionality using JWT.
- **Semester Management**: Create and manage semesters with start and end dates.
- **Course Tracking**: Add courses/subjects to semesters, including details like course code, teacher name, and classes per week.
- **Attendance Monitoring**:
  - Track total classes conducted and attended.
  - View attendance percentage for each subject.
  - Set and monitor minimum required attendance percentage.
- **Class Management**: Log individual class sessions with status (e.g., Attended, Missed), date, and time.
- **Leave Management**: Track medical and duty leaves.
- **Holiday Management**: Add holidays to the semester schedule.
- **Statistics**: Get insights into attendance performance.

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI), Lucide React
- **State/Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

### DevOps
- **Containerization**: Docker & Docker Compose

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker)
- [Docker](https://www.docker.com/) (optional, for running the database or full stack)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd attendance-guardian
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Set up environment variables:
Create a `.env` file in the `backend` directory (copy from `.env.example` if available) and add the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/attendance_guardian?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-key
```

Run database migrations:

```bash
npm run prisma:migrate
```

(Optional) Seed the database:

```bash
npm run prisma:seed
```

Start the backend server:

```bash
npm run dev
```
The server will start on `http://localhost:3001`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Set up environment variables:
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

Start the development server:

```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

### 4. Running with Docker

You can spin up the entire application (Frontend, Backend, and Database) or just the database using Docker Compose.

To run everything:

```bash
docker-compose up --build
```

## Project Structure

```
.
├── backend/                # Express + Prisma Backend
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── middleware/     # Auth and validation middleware
│   │   ├── routes/         # API routes (auth, courses, etc.)
│   │   └── index.js        # Entry point
│   └── package.json
├── frontend/               # React + Vite Frontend
│   ├── src/                # React components, hooks, and pages
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md               # Project documentation
```

## API Endpoints

The backend provides RESTful API endpoints. Here are the main resources:

- **Auth**: `/api/auth` (Signup, Login)
- **Semesters**: `/api/semesters` (CRUD for semesters)
- **Courses**: `/api/courses` (Manage subjects within a semester)
- **Classes**: `/api/classes` (Log individual classes)
- **Holidays**: `/api/holiday` (Manage holidays)
- **Stats**: `/api/stats` (Attendance statistics)

## Testing

### Backend
Run unit and integration tests using Jest:

```bash
cd backend
npm test
```

### Frontend
Run component tests using Vitest:

```bash
cd frontend
npm test
```
