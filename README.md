# Attendance Guardian

This project is organized into separate frontend and backend directories.

## Project Structure

```
├── frontend/          # React + Vite + TypeScript frontend
├── backend/           # Express + Prisma backend
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Docker
```bash
docker-compose up
```

## Development

- Frontend runs on port 5173 (dev) / 80 (production)
- Backend runs on port 3001
- PostgreSQL runs on port 5432

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

- `VITE_API_URL`: Base URL for backend API requests (must include `/api` path)

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/attendance_guardian?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here-change-in-production
```

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Port number for the backend server (default: 3001)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT token generation and validation (required for authentication)

**Important**: Copy `.env.example` files to `.env` in both frontend and backend directories and update with your actual values before running the application.
