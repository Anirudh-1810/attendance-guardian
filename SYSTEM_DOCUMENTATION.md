# Attendance Guardian — System Documentation

> **Professional Technical Documentation**
> Version 1.0 · February 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Design](#2-architecture-design)
3. [Backend Design](#3-backend-design)
4. [Database Design](#4-database-design)
5. [Frontend Design](#5-frontend-design)
6. [API Reference](#6-api-reference)
7. [System Design Decisions](#7-system-design-decisions)
8. [Testing Strategy](#8-testing-strategy)
9. [Production Readiness](#9-production-readiness)
10. [Appendix](#10-appendix)

---

## 1. Project Overview

**Attendance Guardian** is a full-stack attendance management system that helps students track, analyze, and predict their attendance across semesters. It provides intelligent insights such as "classes you can bunk" and "classes you must attend" to maintain a required attendance percentage.

### Key Features

| Feature | Description |
|---|---|
| **Attendance Tracking** | Mark attendance per-class with statuses: Present, Absent, Medical Leave, Duty Leave |
| **Risk Detection** | Real-time risk analysis (safe / warning / high / critical) per subject |
| **What-If Calculator** | Simulate future attendance scenarios to plan ahead |
| **Semester Management** | Multiple semesters with independent subject and holiday tracking |
| **Holiday Management** | Bulk holiday creation to exclude non-working days |
| **Analytics Dashboard** | Visual charts showing attendance trends via Recharts |
| **Dark/Light Theme** | System-aware theming with manual toggle |

### Tech Stack

```
┌──────────────────────────────────────────────────────────────┐
│                     TECH STACK                               │
├──────────────────────────────────────────────────────────────┤
│  Frontend     │  React 18, TypeScript, Vite, TailwindCSS    │
│  UI Library   │  ShadCN UI (Radix Primitives)               │
│  State Mgmt   │  TanStack React Query, React Context        │
│  Routing      │  React Router v6                            │
│  Charts       │  Recharts                                   │
│  Backend      │  Node.js, Express 4                         │
│  ORM          │  Prisma 5 (with NeonDB Serverless Adapter)  │
│  Database     │  PostgreSQL 14                              │
│  Auth         │  JWT (jsonwebtoken) + bcryptjs               │
│  Validation   │  Zod                                        │
│  Deployment   │  Docker Compose (PostgreSQL + Backend + Nginx│
│  Testing      │  Jest + Supertest (Backend), Vitest (Frontend│
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Design

### 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                    │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                  React SPA (Vite Dev Server / Nginx)           │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │     │
│  │  │ Landing  │  │Dashboard │  │Attendance│  │ Settings │      │     │
│  │  │  Page    │  │  Page    │  │   Page   │  │   Page   │      │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │     │
│  │           ↕ TanStack React Query + Fetch API                  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │  HTTP / REST                            │
│                              ↓                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                          SERVER TIER                                    │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                   Express.js API Server                        │     │
│  │  ┌──────────────┐  ┌─────────────────────────────────┐        │     │
│  │  │   Middleware  │  │         Route Handlers          │        │     │
│  │  │  ┌─────────┐ │  │  /api/auth        (Auth)        │        │     │
│  │  │  │  CORS   │ │  │  /api/semesters   (Semesters)   │        │     │
│  │  │  │  JSON   │ │  │  /api/courses     (Courses)     │        │     │
│  │  │  │  Auth   │ │  │  /api/class       (Classes)     │        │     │
│  │  │  └─────────┘ │  │  /api/holiday     (Holidays)    │        │     │
│  │  └──────────────┘  │  /api/stats       (Statistics)  │        │     │
│  │                     └─────────────────────────────────┘        │     │
│  │           ↕ Prisma ORM (NeonDB Serverless Adapter)            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │  SQL over WebSocket                      │
│                              ↓                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                          DATA TIER                                      │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                   PostgreSQL 14                                │     │
│  │  ┌──────┐ ┌──────────┐ ┌────────────┐ ┌───────┐ ┌─────────┐  │     │
│  │  │ User │ │ Semester │ │ UserCourse │ │ Class │ │ Holiday │  │     │
│  │  └──────┘ └──────────┘ └────────────┘ └───────┘ └─────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component-Level Architecture

#### Frontend Components

```
App
├── ThemeProvider          (Dark/Light theme via next-themes)
├── ErrorBoundary          (Global error catching)
├── LatticeBackground      (Animated canvas background)
├── QueryClientProvider    (TanStack React Query cache)
├── AuthProvider           (JWT + user context)
└── BrowserRouter
    ├── /               → LandingPage
    ├── /dashboard      → Dashboard
    │     ├── Navbar
    │     ├── AddSubjectDialog
    │     ├── WhatIfCalculator
    │     └── AttendanceCalendar
    ├── /attendance     → Attendance
    ├── /subject/:id    → SubjectDetail
    ├── /settings       → Settings
    └── /*              → NotFound
```

#### Backend Components

```
Express Server (index.js)
├── Global Middleware
│   ├── cors()                 (Cross-Origin Resource Sharing)
│   └── express.json()         (JSON body parsing)
├── Health Check Endpoints
│   ├── GET /                  (API status)
│   └── GET /api/health        (Health with timestamp)
├── Route Modules
│   ├── /api/auth              (Signup, Login)
│   ├── /api/semesters         (CRUD + auto-create current)
│   ├── /api/courses           (Create, List with % calc)
│   ├── /api/class             (CRUD + bulk ops + attendance)
│   ├── /api/holiday           (CRUD + bulk create)
│   └── /api/stats             (Semester stats, trends)
└── Prisma Client
    └── NeonDB Serverless Adapter (WebSocket)
```

### 2.3 Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ React    │     │ Express  │     │PostgreSQL│
│ Browser  │     │ Frontend │     │  API     │     │   DB     │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  Navigate to   │                │                │
     │  /dashboard    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ GET /api/semesters/current       │
     │                │ Authorization: Bearer <JWT>      │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  auth middleware│
     │                │                │  verify JWT     │
     │                │                │  extract userId │
     │                │                │                │
     │                │                │ SELECT * FROM   │
     │                │                │ "Semester" WHERE│
     │                │                │ userId = ?      │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │  Semester data  │
     │                │                │<───────────────│
     │                │                │                │
     │                │  JSON Response │                │
     │                │  { semester }  │                │
     │                │<───────────────│                │
     │                │                │                │
     │  Render        │                │                │
     │  Dashboard     │                │                │
     │<───────────────│                │                │
     │                │                │                │
```

### 2.4 Authentication Flow (JWT Lifecycle)

```
                         JWT AUTHENTICATION LIFECYCLE

┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Client  │                 │  Server │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                          │                            │
     │  1. POST /api/auth/signup (or /login)                 │
     │  { email, password, name }                            │
     │─────────────────────────>│                            │
     │                          │                            │
     │                          │  2. Validate input         │
     │                          │  3. Hash password (bcrypt) │
     │                          │  4. Create/Find user       │
     │                          │───────────────────────────>│
     │                          │                            │
     │                          │  5. User record            │
     │                          │<───────────────────────────│
     │                          │                            │
     │                          │  6. Sign JWT               │
     │                          │  jwt.sign(                 │
     │                          │    { userId },             │
     │                          │    JWT_SECRET,             │
     │                          │    { expiresIn: '7d' }     │
     │                          │  )                         │
     │                          │                            │
     │  7. { token, user }      │                            │
     │<─────────────────────────│                            │
     │                          │                            │
     │  8. Store in localStorage│                            │
     │     token + user JSON    │                            │
     │                          │                            │
     ├──────────── SESSION ACTIVE (7 days) ─────────────────┤
     │                          │                            │
     │  9. Authenticated Request│                            │
     │  GET /api/semesters      │                            │
     │  Authorization: Bearer <token>                        │
     │─────────────────────────>│                            │
     │                          │                            │
     │                          │  10. auth middleware        │
     │                          │  Extract "Bearer <token>"  │
     │                          │  jwt.verify(token, SECRET) │
     │                          │  req.user = { userId }     │
     │                          │                            │
     │                          │  11. Query with userId     │
     │                          │───────────────────────────>│
     │                          │                            │
     │  12. JSON Response       │                            │
     │<─────────────────────────│                            │
     │                          │                            │
     ├──────────── TOKEN EXPIRED / LOGOUT ──────────────────┤
     │                          │                            │
     │  13. logout()            │                            │
     │  Clear localStorage      │                            │
     │  Redirect to /           │                            │
     │                          │                            │
```

### 2.5 Modular Design

The system follows a **modular monolith** pattern with clear separation:

| Module | Responsibility | Files |
|---|---|---|
| **Auth Module** | User registration, login, JWT issuance | `routes/auth.js`, `middleware/auth.js` |
| **Semester Module** | Semester CRUD, auto-creation | `routes/semesters.js` |
| **Course Module** | Course management, % calculation | `routes/courses.js` |
| **Class Module** | Class scheduling, attendance marking | `routes/class.js` |
| **Holiday Module** | Holiday management, bulk operations | `routes/holiday.js` |
| **Stats Module** | Attendance analytics, trend tracking | `routes/stats.js` |
| **Prisma Module** | Database connection with NeonDB adapter | `prisma.js`, `schema.prisma` |

Each module is **self-contained** with its own route definitions and directly interfaces with the Prisma ORM. Cross-module communication happens at the database level through foreign key relationships.

### 2.6 Separation of Concerns

```
┌─────────────────────────────────────────────────┐
│                PRESENTATION LAYER               │
│  React Components, Pages, UI Library (ShadCN)   │
│  Concern: Rendering, user interaction, theming  │
├─────────────────────────────────────────────────┤
│              STATE MANAGEMENT LAYER             │
│  AuthContext, useAttendanceData, React Query     │
│  Concern: Data caching, auth state, sync        │
├─────────────────────────────────────────────────┤
│                API COMMUNICATION LAYER          │
│  lib/api.ts, api/auth.ts, fetchAPI wrapper      │
│  Concern: HTTP calls, error normalization       │
├─────────────────────────────────────────────────┤
│              BUSINESS LOGIC LAYER               │
│  lib/calculations.ts (can-bunk, must-attend)    │
│  Backend route handlers (stats, attendance %)   │
│  Concern: Domain rules, computations            │
├─────────────────────────────────────────────────┤
│                ROUTING / MIDDLEWARE             │
│  Express routes, auth middleware, CORS          │
│  Concern: Request routing, access control       │
├─────────────────────────────────────────────────┤
│                DATA ACCESS LAYER                │
│  Prisma ORM, schema.prisma                      │
│  Concern: DB queries, schema management         │
├─────────────────────────────────────────────────┤
│                PERSISTENCE LAYER                │
│  PostgreSQL (NeonDB Serverless)                 │
│  Concern: Data storage, integrity, indexing     │
└─────────────────────────────────────────────────┘
```

### 2.7 Scalability Considerations

| Aspect | Current | Scalable Path |
|---|---|---|
| **Database** | Single PostgreSQL (NeonDB) | NeonDB auto-scales, read replicas supported |
| **API Server** | Single Express process | Horizontal scaling via Docker replicas + load balancer |
| **Frontend** | Static SPA build served via Nginx | CDN deployment (Vercel, Cloudflare Pages) |
| **Auth** | Stateless JWT (no session store) | Naturally scalable — no server-side session affinity |
| **Caching** | React Query client-side cache | Add Redis for server-side caching of stats |
| **File Storage** | Multer (configured but unused) | Migrate to S3/Cloud Storage for scale |
| **Background Jobs** | None | Add Bull/BullMQ for async notification processing |

### 2.8 Security Considerations

| Security Layer | Implementation |
|---|---|
| **Password Storage** | bcryptjs with salt rounds = 10 |
| **Token Security** | JWT with configurable secret, 7-day expiry |
| **CORS** | Enabled via `cors()` middleware |
| **Input Validation** | Server-side field validation, Zod schemas available |
| **SQL Injection** | Prevented by Prisma's parameterized queries |
| **Ownership Verification** | Routes verify `userId` matches JWT payload before mutations |
| **Error Sanitization** | Generic error messages returned to client, detailed logs server-side |
| **Environment Variables** | Secrets stored in `.env`, `.env.example` provided for onboarding |

### 2.9 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend:                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Route Handler                                        │   │
│  │  try {                                               │   │
│  │    // Business logic + Prisma queries                │   │
│  │  } catch (err) {                                     │   │
│  │    console.error(err);          // Server logging    │   │
│  │    res.status(500).json({                            │   │
│  │      message: 'Human-readable error'                 │   │
│  │      error: err.message         // Dev context       │   │
│  │    });                                               │   │
│  │  }                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Frontend:                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Layer (fetchAPI wrapper)                         │   │
│  │  if (!response.ok) {                                 │   │
│  │    const error = await response.json();              │   │
│  │    throw new ApiError(status, message);              │   │
│  │  }                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Component Layer                                      │   │
│  │  ErrorBoundary   → Catches render-time crashes       │   │
│  │  Toast/Sonner    → User-facing error notifications   │   │
│  │  useAttendanceData → Catches & stores API errors     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Design

### 3.1 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (5 models)
│   ├── migrations/            # Prisma migration history
│   └── dev.db                 # Local SQLite fallback for dev
├── src/
│   ├── index.js               # Express app entry point
│   ├── prisma.js              # Prisma client singleton (NeonDB adapter)
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   └── routes/
│       ├── auth.js            # POST /signup, /login
│       ├── semesters.js       # CRUD + /current with auto-create
│       ├── courses.js         # Create, List with % calculation
│       ├── class.js           # CRUD + bulk + attendance marking
│       ├── holiday.js         # CRUD + bulk create
│       └── stats.js           # Semester stats, subject trends
├── tests/
│   ├── setup.js               # Jest test setup
│   ├── prisma.mock.js         # Prisma mock factory
│   ├── index.test.js          # App-level tests
│   ├── middleware/             # Middleware tests
│   ├── routes/                # Route integration tests
│   └── unit/                  # Unit tests
├── Dockerfile                 # Production container build
├── package.json               # Dependencies & scripts
├── jest.config.js             # Jest configuration
└── .env.example               # Environment template
```

### 3.2 Architecture Pattern: Route-Handler with Direct ORM Access

The backend uses a **lean route-handler pattern** where Express routes directly invoke Prisma ORM operations:

```
Request → Middleware (CORS, JSON, Auth) → Route Handler → Prisma → PostgreSQL
                                              │
                                        Business Logic
                                       (inline in handler)
```

This is a pragmatic choice for the current scale. For growth, the pattern can evolve into:

```
Controller → Service → Repository (Prisma)
```

### 3.3 Middleware Architecture

```javascript
// Global Middleware (applied to ALL routes)
app.use(cors());              // Allow cross-origin requests
app.use(express.json());      // Parse JSON request bodies

// Route-Level Middleware (applied selectively)
router.get('/', auth, handler);   // JWT auth required
router.get('/', handler);         // No auth (public)
```

**Auth Middleware Flow:**

```
1. Extract "Authorization" header
2. Split "Bearer <token>" to get token
3. jwt.verify(token, JWT_SECRET) → decoded { userId }
4. Attach req.user = { userId }
5. Call next() or return 401
```

### 3.4 API Design Standards (RESTful Conventions)

| Convention | Implementation |
|---|---|
| **HTTP Methods** | `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial), `DELETE` (remove) |
| **URL Structure** | `/api/{resource}` for collections, `/api/{resource}/{id}` for items |
| **Status Codes** | `200` success, `201` created, `400` bad request, `401` unauthorized, `403` forbidden, `404` not found, `500` server error |
| **Response Format** | JSON with consistent shape: `{ data }` or `{ message, error }` |
| **Ownership Check** | Routes verify `userId` from JWT before allowing mutations |
| **Query Params** | Used for filtering: `?subjectId=`, `?semesterId=`, `?startDate=&endDate=` |

### 3.5 Complete API Endpoint Map

```
Authentication
  POST   /api/auth/signup              Create user account
  POST   /api/auth/login               Authenticate and get JWT

Semesters (auth required)
  GET    /api/semesters                List all semesters
  GET    /api/semesters/current        Get or auto-create current
  POST   /api/semesters                Create semester
  PUT    /api/semesters/:id            Update semester
  DELETE /api/semesters/:id            Delete semester

Courses (auth required)
  POST   /api/courses                  Create course for semester
  GET    /api/courses/:semesterId      List courses with attendance %

Classes
  GET    /api/class?subjectId=         Get classes for subject
  GET    /api/class/date/:date         Get classes for specific date
  POST   /api/class                    Create single class
  POST   /api/class/bulk               Bulk create classes
  PUT    /api/class/:id                Update class
  PATCH  /api/class/:id/attendance     Mark attendance
  POST   /api/class/bulk-attendance    Bulk mark attendance
  DELETE /api/class/:id                Delete class

Holidays
  GET    /api/holiday?semesterId=      Get holidays for semester
  POST   /api/holiday                  Create holiday
  POST   /api/holiday/bulk             Bulk create holidays
  DELETE /api/holiday/:id              Delete holiday

Statistics
  GET    /api/stats/semester/:id       Get semester stats
  GET    /api/stats/subject/:id/trend  Get attendance trend
```

### 3.6 Validation Strategy

**Current Implementation:**
- Manual field validation in route handlers (`if (!email || !password)`)
- Prisma schema constraints (types, defaults, required fields)
- Ownership verification via `userId` from JWT

**Zod Integration (Available):**
- `zod` is installed as a dependency for schema-based validation
- Can be used for request body validation middleware

```javascript
// Example Zod validation middleware pattern
const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/signup', validate(signupSchema), handler);
```

### 3.7 Logging Strategy

| Level | Implementation |
|---|---|
| **Request Logging** | Manual `console.log` for auth operations |
| **Error Logging** | `console.error` with full stack traces in catch blocks |
| **Structured Logging** | Recommended: `winston` or `pino` for production |
| **Request Correlation** | Recommended: Add `requestId` middleware |

---

## 4. Database Design

### 4.1 Entity-Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     User     │     │    Semester      │     │   UserCourse     │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id       PK  │←───┐│ id           PK  │←───┐│ id           PK  │
│ email    UQ  │    ││ name             │    ││ semesterId   FK  │──→ Semester
│ name         │    ││ startDate        │    ││ courseCode       │
│ password     │    ││ endDate          │    ││ courseName       │
└──────────────┘    ││ requiredPct  75  │    ││ teacher          │
                    ││ userId       FK  │──┘ ││ totalConducted 0 │
                    │└──────────────────┘    ││ totalAttended  0 │
                    │                        ││ classesPerWeek   │
                    │                        ││ maxAbsences      │
                    │                        ││ medicalLeaves  0 │
                    │                        ││ dutyLeaves     0 │
                    │                        ││ createdAt        │
                    │                        │└──────────────────┘
                    │                        │         │
                    │ ┌──────────────────┐   │         │
                    │ │    Holiday       │   │         ↓
                    │ ├──────────────────┤   │ ┌──────────────────┐
                    │ │ id           PK  │   │ │     Class        │
                    │ │ date             │   │ ├──────────────────┤
                    │ │ name             │   │ │ id           PK  │
                    │ │ type     HOLIDAY │   │ │ subjectId    FK  │──→ UserCourse
                    │ │ semesterId   FK  │──→│ │ date             │
                    │ └──────────────────┘     │ dayOfWeek        │
                    │                         │ startTime        │
                    └─────────────────────────│ endTime          │
                                              │ status  SCHEDULED│
                                              │ notes            │
                                              └──────────────────┘
```

### 4.2 Schema Design (Prisma)

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String?
  password  String
  semesters Semester[]
}

model Semester {
  id                 String       @id @default(uuid())
  name               String
  startDate          DateTime
  endDate            DateTime
  requiredPercentage Int          @default(75)
  userId             String
  user               User         @relation(fields: [userId], references: [id])
  subjects           UserCourse[]
  holidays           Holiday[]
}

model UserCourse {
  id                    String   @id @default(uuid())
  semesterId            String
  courseCode             String
  courseName             String
  teacher               String?
  totalClassesConducted Int      @default(0)
  totalClassesAttended  Int      @default(0)
  classesPerWeek        Int
  maxAllowedAbsences    Int
  medicalLeavesAllowed  Int      @default(0)
  dutyLeavesAllowed     Int      @default(0)
  createdAt             DateTime @default(now())
  classes               Class[]
}

model Class {
  id        String     @id @default(uuid())
  subjectId String
  date      DateTime
  dayOfWeek Int?
  startTime String?
  endTime   String?
  status    String     @default("SCHEDULED")
  notes     String?
}

model Holiday {
  id         String   @id @default(uuid())
  date       DateTime
  name       String
  type       String   @default("HOLIDAY")
  semesterId String
}
```

### 4.3 Indexing Strategy

| Index | Type | Column(s) | Purpose |
|---|---|---|---|
| Primary Key | Unique (UUID) | All `.id` fields | Record identification |
| Unique | Unique | `User.email` | Prevent duplicate registrations |
| Foreign Key | Reference | `Semester.userId` | User → Semester lookup |
| Foreign Key | Reference | `UserCourse.semesterId` | Semester → Courses lookup |
| Foreign Key | Reference | `Class.subjectId` | Course → Classes lookup |
| Foreign Key | Reference | `Holiday.semesterId` | Semester → Holidays lookup |

**Recommended Additional Indexes:**

```sql
-- Frequently queried: current semester by date range and user
CREATE INDEX idx_semester_user_dates ON "Semester" ("userId", "startDate", "endDate");

-- Class queries often filter by date
CREATE INDEX idx_class_date ON "Class" ("date");

-- Stats queries aggregate by subjectId and status
CREATE INDEX idx_class_subject_status ON "Class" ("subjectId", "status");
```

### 4.4 Data Modeling Decisions: Normalization vs. Embedding

| Decision | Choice | Rationale |
|---|---|---|
| **User ↔ Semester** | Normalized (FK) | Users have multiple semesters; need independent CRUD |
| **Semester ↔ Course** | Normalized (FK) | Courses belong to exactly one semester; need listing/filtering |
| **Course ↔ Class** | Normalized (FK) | Many classes per course; individual attendance tracking required |
| **Semester ↔ Holiday** | Normalized (FK) | Holidays are semester-scoped; need date-based queries |
| **Attendance Counters** | Denormalized (on UserCourse) | `totalClassesConducted` and `totalClassesAttended` stored as counters for O(1) percentage calculation instead of COUNT(*) aggregation |

### 4.5 Schema Scalability

The schema supports several growth paths:

```
Current Schema                    Future Extensions
─────────────────                 ──────────────────
User                        →    + role (admin/student/teacher)
                                 + profilePicture
                                 + institution

Semester                    →    + isActive flag
                                 + department

UserCourse                  →    + courseType (theory/lab/tutorial)
                                 + credits
                                 + schedule JSON

Class                       →    + location
                                 + substituteTeacher
                                 + cancelledReason

Holiday                     →    + scope (national/college/department)
                                 + recurrence rules

(New) Notification          →    + text, type, sentAt, readAt
(New) AttendanceRequest     →    + requestType, status, approvedBy
```

### 4.6 Performance Optimizations

| Optimization | Status | Impact |
|---|---|---|
| **UUID Primary Keys** | ✅ Active | Distributed generation, no sequence contention |
| **Date Ordering** | ✅ Active | `orderBy: { date: 'asc' }` for chronological queries |
| **Prisma Transactions** | ✅ Active | Atomic bulk operations for classes and holidays |
| **Eager Loading** | ✅ Active | `include: { subjects: { include: { classes: true } } }` reduces N+1 |
| **Connection Pooling** | ✅ Active | NeonDB serverless adapter with WebSocket connections |
| **Query Pagination** | ❌ Recommended | Add `skip`/`take` for large datasets |

---

## 5. Frontend Design

### 5.1 Page Architecture

| Page | Route | Purpose |
|---|---|---|
| **LandingPage** | `/` | Marketing page with signup/login forms |
| **Dashboard** | `/dashboard` | Main hub — subject cards, stats, quick actions |
| **Attendance** | `/attendance` | Calendar-based attendance view |
| **SubjectDetail** | `/subject/:id` | Deep-dive into single subject analytics |
| **Settings** | `/settings` | User preferences, theme, semester config |
| **NotFound** | `/*` | 404 error page |

### 5.2 State Management Architecture

```
┌──────────────────────────────────────────────────┐
│                 State Layers                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Server State (TanStack React Query)          │
│     - Cached API responses                       │
│     - Automatic background refetch               │
│     - Stale-while-revalidate pattern             │
│                                                  │
│  2. Auth State (React Context + localStorage)    │
│     - JWT token persistence                      │
│     - User profile (id, name, email)             │
│     - isAuthenticated derived state              │
│                                                  │
│  3. UI State (Component-local useState)          │
│     - Form inputs, dialogs, toggles              │
│     - Theme preference (next-themes)             │
│                                                  │
│  4. Derived State (lib/calculations.ts)          │
│     - Risk status (safe/warning/high/critical)   │
│     - Bunkable classes calculation               │
│     - Must-attend classes calculation            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5.3 API Communication Layer

The `fetchAPI` wrapper in `lib/api.ts` provides:

- **Base URL configuration** from environment variables
- **Automatic Content-Type** header injection
- **Error normalization** via custom `ApiError` class
- **Token injection** (via hooks at call sites)

Resource-specific API objects (`semesterAPI`, `subjectAPI`, `classAPI`, `holidayAPI`, `statsAPI`) provide typed method signatures for all CRUD operations.

### 5.4 Key Custom Hooks

| Hook | File | Purpose |
|---|---|---|
| `useAuth()` | `contexts/AuthContext.tsx` | Access auth state (token, user, login, logout) |
| `useAttendanceData()` | `hooks/useAttendanceData.ts` | Fetch subjects, add/update subjects, manage loading/error |
| `useMobile()` | `hooks/use-mobile.tsx` | Responsive breakpoint detection |
| `useToast()` | `hooks/use-toast.ts` | Toast notification queue management |

### 5.5 Business Logic: Attendance Calculations

```typescript
// Risk Status Classification
calculateStatus(subject):
  ≥ 85%  → "safe"      (green)
  ≥ 75%  → "warning"   (yellow)
  ≥ 65%  → "high"      (orange)
  < 65%  → "critical"  (red)

// Bunkable Classes Formula
calculateBunks(subject):
  Find max X where: attended / (total + X + 1) ≥ required/100

// Must-Attend Classes Formula
calculateMustAttend(subject):
  Find min X where: (attended + X) / (total + X) ≥ required%
```

---

## 6. API Reference

### 6.1 Authentication

#### POST `/api/auth/signup`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:** `400` (missing fields, email in use), `500` (server error)

#### POST `/api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** Same as signup.
**Errors:** `400` (invalid credentials), `500` (server error)

### 6.2 Semesters (Auth Required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/semesters` | — | `Semester[]` |
| `GET` | `/api/semesters/current` | — | `Semester` (auto-creates if none) |
| `POST` | `/api/semesters` | `{ name, startDate, endDate, requiredPercentage }` | `Semester` |
| `PUT` | `/api/semesters/:id` | partial fields | `Semester` |
| `DELETE` | `/api/semesters/:id` | — | `{ message }` |

### 6.3 Courses (Auth Required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/courses` | `{ semesterId, courseCode, courseName, teacher, classesPerWeek, maxAllowedAbsences, ... }` | `UserCourse` |
| `GET` | `/api/courses/:semesterId` | — | `UserCourse[] with attendancePercent` |

### 6.4 Classes

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/class?subjectId=&startDate=&endDate=` | — | `Class[]` |
| `GET` | `/api/class/date/:date?semesterId=` | — | `Class[]` |
| `POST` | `/api/class` | `{ subjectId, date, dayOfWeek, startTime, endTime, status, notes }` | `Class` |
| `POST` | `/api/class/bulk` | `{ classes: [...] }` | `Class[]` |
| `PUT` | `/api/class/:id` | partial fields | `Class` |
| `PATCH` | `/api/class/:id/attendance` | `{ status, notes }` | `Class` |
| `POST` | `/api/class/bulk-attendance` | `{ updates: [{ id, status, notes }] }` | `Class[]` |
| `DELETE` | `/api/class/:id` | — | `{ message }` |

### 6.5 Holidays

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/holiday?semesterId=` | — | `Holiday[]` |
| `POST` | `/api/holiday` | `{ date, name, type, semesterId }` | `Holiday` |
| `POST` | `/api/holiday/bulk` | `{ holidays: [...] }` | `Holiday[]` |
| `DELETE` | `/api/holiday/:id` | — | `{ message }` |

### 6.6 Statistics

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/api/stats/semester/:id` | `{ overall: { totalSubjects, totalClasses, averageAttendance, subjectsAtRisk }, subjects: [...] }` |
| `GET` | `/api/stats/subject/:id/trend` | `[{ date, attendance, status }]` |

---

## 7. System Design Decisions

### 7.1 Why PostgreSQL (via NeonDB Serverless)?

| Consideration | PostgreSQL Advantage |
|---|---|
| **Relational Data** | Attendance data is inherently relational (User → Semester → Course → Class) |
| **ACID Compliance** | Critical for attendance records — no partial writes |
| **Complex Queries** | Date range queries, aggregations, joins for statistics |
| **Prisma ORM** | First-class PostgreSQL support with type-safe queries |
| **NeonDB Serverless** | Scale-to-zero, auto-scaling, WebSocket support, no idle costs |
| **Migrations** | Prisma Migrate provides version-controlled schema evolution |

> **Why not MongoDB?** Although the user mentioned MERN stack, PostgreSQL was chosen because attendance data has strong relational characteristics (FK constraints, aggregation queries). Prisma provides the same developer experience as Mongoose but with type safety and migration support.

### 7.2 Why JWT?

| Factor | JWT Benefit |
|---|---|
| **Stateless** | No server-side session storage needed → horizontal scaling |
| **Self-contained** | Payload carries `userId` — no DB lookup on every request |
| **Standard** | Widely adopted; frontend stores in localStorage |
| **Expiry** | 7-day TTL auto-expires, requiring re-authentication |
| **Simplicity** | Single middleware function validates all protected routes |

**Trade-off Acknowledged:** JWT stored in localStorage is vulnerable to XSS. For production, consider:
- HttpOnly cookies with CSRF tokens
- Short-lived access tokens with refresh token rotation

### 7.3 Why Server-Side Logic?

Business logic (attendance %, bunk calculations, stats) lives primarily on the server to:

1. **Ensure data integrity** — calculations are based on authoritative DB state
2. **Prevent manipulation** — clients can't forge attendance data
3. **Centralize rules** — single source of truth for thresholds and formulas
4. **Support multiple clients** — same API serves web, future mobile apps

Some calculations (risk status, bunk/must-attend) are **duplicated** on the frontend in `lib/calculations.ts` for **instant UI feedback** without API round-trips.

### 7.4 Handling Concurrent Updates

| Mechanism | Implementation |
|---|---|
| **Prisma Transactions** | `prisma.$transaction()` for bulk operations (atomic class/holiday creation) |
| **Atomic Field Updates** | Prisma's `update()` uses SQL `UPDATE` which is inherently atomic per-row |
| **Optimistic UI Updates** | `useAttendanceData` updates local state immediately, then syncs with server |
| **Last-Write-Wins** | Current strategy for simple fields — acceptable for single-user-per-account model |
| **Ownership Lock** | Each mutation verifies `userId === req.user.userId`, preventing cross-user conflicts |

### 7.5 Edge Case Management

| Edge Case | Handling |
|---|---|
| **No semester exists** | `GET /semesters/current` auto-creates a default 6-month semester |
| **Zero classes** | Division by zero protected: `done === 0 ? 0 : (attended / done) * 100` |
| **Expired JWT** | Middleware returns 401; frontend clears state and redirects to login |
| **Missing env vars** | `JWT_SECRET` fallback to `'dev-secret'` with console warning |
| **Invalid JSON body** | `express.json()` returns 400 automatically |
| **Non-existent resource** | Ownership check returns 404 before mutation attempt |
| **Duplicate email** | Prisma unique constraint throws; caught and returns 400 |

---

## 8. Testing Strategy

### 8.1 Testing Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     TESTING PYRAMID                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    ╱ ─ ─ ─ ─ ╲                               │
│                  ╱   E2E /     ╲        Browser tests,       │
│                ╱   Manual QA     ╲      smoke tests          │
│              ╱ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╲                          │
│            ╱    Integration Tests    ╲   API endpoint tests  │
│          ╱       (Supertest + Jest)     ╲  with mock DB      │
│        ╱ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╲                  │
│      ╱          Unit Tests                  ╲ Calculations,  │
│    ╱     (Jest backend, Vitest frontend)      ╲ components   │
│  ╱ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╲            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Unit Testing Plan

**Backend (Jest):**

| Test Area | What to Test | File |
|---|---|---|
| **Attendance Calculations** | Can-bunk formula, must-attend formula, edge cases (0 classes, 100%) | `tests/unit/calculations.test.js` |
| **Auth Middleware** | Token extraction, verification, rejection for missing/invalid tokens | `tests/middleware/auth.test.js` |
| **Risk Categorization** | Threshold classification (safe → critical) | `tests/unit/status.test.js` |

**Frontend (Vitest):**

| Test Area | What to Test | File |
|---|---|---|
| **calculateStatus()** | All threshold boundaries (85, 75, 65, edge values) | `src/lib/__tests__/calculations.test.ts` |
| **calculateBunks()** | Various attendance scenarios, zero total, exact threshold | `src/lib/__tests__/calculations.test.ts` |
| **calculateMustAttend()** | Below-threshold recovery scenarios | `src/lib/__tests__/calculations.test.ts` |
| **useAttendanceData** | Hook lifecycle, API integration, error states | `src/hooks/__tests__/useAttendanceData.test.ts` |

### 8.3 Integration Testing Plan

**API Endpoint Tests (Supertest + Jest):**

```
tests/routes/
├── auth.test.js         # Signup, login, duplicate email, invalid creds
├── semesters.test.js    # CRUD ops, auto-create, ownership checks
├── courses.test.js      # Create, list, % calculation
├── class.test.js        # CRUD, bulk ops, attendance marking
├── holiday.test.js      # CRUD, bulk create
└── stats.test.js        # Semester stats, subject trends
```

| Test Scenario | Method | Endpoint | Assertions |
|---|---|---|---|
| Create user | POST | /api/auth/signup | 200 + token + user object |
| Login with valid creds | POST | /api/auth/login | 200 + token |
| Login with wrong password | POST | /api/auth/login | 400 + error message |
| Access protected route without token | GET | /api/semesters | 401 |
| Create semester | POST | /api/semesters | 201 + semester object |
| Update another user's semester | PUT | /api/semesters/:id | 404 |
| Mark attendance | PATCH | /api/class/:id/attendance | 200 + updated status |
| Bulk create classes | POST | /api/class/bulk | 201 + array |

### 8.4 Authentication Testing Plan

| Test Case | Expected Result |
|---|---|
| Signup with valid data | 200, returns JWT + user |
| Signup with existing email | 400, "Email already in use" |
| Signup without email | 400, "Missing required fields" |
| Login with correct credentials | 200, returns JWT |
| Login with wrong password | 400, "Invalid credentials" |
| Access protected route with valid JWT | 200, returns data |
| Access protected route without header | 401, "No token provided" |
| Access protected route with expired JWT | 401, "Invalid token" |
| Access protected route with malformed JWT | 401, "Invalid token" |

### 8.5 Edge Case Testing List

```
Authentication:
  □ Login with SQL injection attempt in email
  □ Signup with extremely long name (>1000 chars)
  □ Concurrent signup with same email
  □ JWT with tampered payload

Attendance:
  □ Mark attendance on non-existent class
  □ 100% attendance (bunk calculation = non-negative)
  □ 0 classes conducted (division by zero)
  □ Negative attendance values
  □ Marking attendance twice on same class

Semester:
  □ Create semester with endDate before startDate
  □ Overlapping semester dates
  □ Delete semester with courses and classes (cascade)
  □ Access current semester when none exists (auto-create)

Bulk Operations:
  □ Empty array in bulk create
  □ 1000+ items in bulk create (performance)
  □ Mixed valid/invalid items in bulk operation
  □ Concurrent bulk updates on same classes
```

### 8.6 Load Testing Strategy

```
Tool: Artillery or k6

Scenarios:
1. Login Storm       — 100 concurrent logins
2. Dashboard Load    — 50 users fetching /semesters/current simultaneously
3. Attendance Burst  — 30 users marking attendance concurrently
4. Stats Query       — 20 users fetching semester stats with 100+ classes each

Metrics to Monitor:
  - P50 / P95 / P99 response times
  - Error rate under load
  - Database connection pool utilization
  - Memory and CPU on API server
```

### 8.7 Manual Testing Checklist

```
Pre-release QA:

Auth Flow:
  □ New user signup → auto-redirect to dashboard
  □ Login → dashboard loads with data
  □ Logout → clears session, redirects to landing
  □ Token expiry → graceful redirect to login

Dashboard:
  □ Add subject dialog opens and submits
  □ Subject cards show correct attendance %
  □ Risk indicators color-coded correctly
  □ What-If Calculator produces sensible results

Attendance:
  □ Calendar shows correct days
  □ Mark present/absent updates stats
  □ Bulk operations work atomically

Settings:
  □ Theme toggle dark ↔ light
  □ Semester editing persists

Responsive Design:
  □ Desktop (1920px) — full layout
  □ Tablet (768px) — adapted layout
  □ Mobile (375px) — mobile-first layout
```

### 8.8 Testing Tools

| Tool | Purpose | Config |
|---|---|---|
| **Jest** | Backend unit + integration tests | `jest.config.js` (node env) |
| **Supertest** | HTTP endpoint testing | Used with Express app instance |
| **Vitest** | Frontend unit tests | `vitest.config.ts` (jsdom env) |
| **React Testing Library** | Component rendering tests | `@testing-library/react` |
| **fast-check** | Property-based testing | Installed in both frontend & backend |
| **Postman** | Manual API exploration | Import endpoint map above |
| **Artillery / k6** | Load testing | (Recommended) |

---

## 9. Production Readiness

### 9.1 Deployment Architecture

```
                    ┌─────────────────────────┐
                    │      CDN / Reverse      │
                    │      Proxy (Nginx)      │
                    └────────┬────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              Static Assets      API Requests
              (React SPA)        (/api/*)
                    │                 │
                    ↓                 ↓
         ┌──────────────┐   ┌──────────────┐
         │   Frontend   │   │   Backend    │
         │  Container   │   │  Container   │
         │   (Nginx)    │   │  (Node.js)   │
         │   Port 80    │   │  Port 3001   │
         └──────────────┘   └──────┬───────┘
                                   │
                                   ↓
                          ┌──────────────┐
                          │  PostgreSQL  │
                          │   (NeonDB    │
                          │  Serverless) │
                          └──────────────┘
```

**Docker Compose Configuration:**

```yaml
services:
  postgres:     # PostgreSQL 14 Alpine, health-checked
  backend:      # Node.js, runs Prisma migrate + npm start
  frontend:     # Nginx serving built React SPA
```

### 9.2 Environment Configuration Strategy

| Environment | `NODE_ENV` | Database | JWT Secret | CORS |
|---|---|---|---|---|
| **Development** | `development` | Local PostgreSQL (Docker) | `dev-secret` (insecure OK) | `*` (open) |
| **Staging** | `production` | NeonDB staging branch | Vault/Secret Manager | Staging origin |
| **Production** | `production` | NeonDB main branch | Vault/Secret Manager | Production origin only |

**Environment Variables:**

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
JWT_SECRET=<strong-random-secret-256-bit>
PORT=3001
NODE_ENV=production

# Frontend (.env)
VITE_API_URL=https://api.attendance-guardian.com
```

### 9.3 CI/CD Recommendation

```
┌───────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Push /   │     │   CI     │     │  Build   │     │ Deploy   │
│   PR to    │────→│  Tests   │────→│  Docker  │────→│  to Env  │
│   main     │     │          │     │  Images  │     │          │
└───────────┘     └──────────┘     └──────────┘     └──────────┘

Pipeline (GitHub Actions):

1. Trigger: Push to main / PR
2. Lint: ESLint (frontend), manual checks (backend)
3. Test:
   - Backend: npm test (Jest + Supertest)
   - Frontend: npm test (Vitest)
4. Build:
   - docker build ./backend
   - docker build ./frontend
5. Migrate: npx prisma migrate deploy
6. Deploy:
   - Staging: Auto-deploy on PR merge
   - Production: Manual approval gate
```

**Recommended GitHub Actions Workflow:**

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Backend Tests
        run: |
          cd backend
          npm ci
          npx prisma migrate deploy
          npm test
      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy step here"
```

### 9.4 Monitoring and Logging Setup

| Layer | Tool | Purpose |
|---|---|---|
| **Application Logs** | `winston` / `pino` | Structured JSON logging with levels (info, warn, error) |
| **Request Logging** | `morgan` | HTTP access logs (method, URL, status, response time) |
| **Error Tracking** | Sentry | Real-time error alerts with stack traces |
| **APM** | Datadog / New Relic | API latency, throughput, DB query performance |
| **Uptime** | UptimeRobot / Checkly | Health endpoint monitoring (`/api/health`) |
| **Database** | NeonDB Dashboard | Query performance, connection pool stats |
| **Frontend** | Sentry Browser SDK | Client-side errors, performance metrics (LCP, FID) |

### 9.5 Backup Strategy

| Data | Strategy | Frequency |
|---|---|---|
| **PostgreSQL (NeonDB)** | NeonDB automatic point-in-time recovery (PITR) | Continuous WAL archiving |
| **Database Snapshots** | NeonDB branching for instant snapshots | Before major deploys |
| **Schema Versions** | Prisma migrations in Git | Every schema change |
| **Environment Configs** | Git-versioned `.env.example` + Secret Manager | On every change |
| **Docker Images** | Container registry (GHCR / Docker Hub) | Every CI build |

### 9.6 Security Hardening Checklist

```
Production Security:

Authentication:
  □ Use strong JWT_SECRET (>= 256 bits, from secret manager)
  □ Consider HttpOnly cookies instead of localStorage
  □ Implement refresh token rotation
  □ Add rate limiting on /api/auth/* endpoints

API Security:
  □ Restrict CORS to production domain only
  □ Add Helmet.js for security headers
  □ Implement request rate limiting (express-rate-limit)
  □ Add request size limits

Database:
  □ Use separate DB credentials per environment
  □ Enable SSL for database connections
  □ Regular credential rotation

Infrastructure:
  □ HTTPS everywhere (TLS 1.3)
  □ Docker image scanning (Snyk, Trivy)
  □ Non-root container user
  □ Network policies between services
```

---

## 10. Appendix

### 10.1 Project Scripts

**Backend:**

| Script | Command | Purpose |
|---|---|---|
| `dev` | `nodemon src/index.js` | Start dev server with hot reload |
| `start` | `node src/index.js` | Production start |
| `test` | `cross-env NODE_ENV=test jest` | Run test suite |
| `prisma:generate` | `prisma generate` | Generate Prisma Client |
| `prisma:migrate` | `prisma migrate dev` | Run dev migrations |
| `prisma:studio` | `prisma studio` | Open Prisma data browser |

**Frontend:**

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start Vite dev server (port 8080) |
| `build` | `vite build` | Production build |
| `test` | `vitest --run` | Run Vitest suite |
| `test:watch` | `vitest` | Watch mode testing |
| `test:ui` | `vitest --ui` | Visual test runner |
| `lint` | `eslint .` | Run ESLint |

### 10.2 Development Setup

```bash
# 1. Clone repository
git clone <repo-url> && cd attendance-guardian

# 2. Start database
docker compose up -d postgres

# 3. Backend setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# 4. Frontend setup (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

# App runs at http://localhost:8080
# API runs at http://localhost:3001
# Vite proxies /api/* → backend
```

### 10.3 Class Status Values

| Status | Meaning | Counted As |
|---|---|---|
| `SCHEDULED` | Class is scheduled but hasn't occurred | Not counted |
| `PRESENT` | Student attended | ✅ Attended |
| `ABSENT` | Student was absent | ❌ Not attended |
| `MEDICAL_LEAVE` | Excused medical absence | ✅ Attended |
| `DUTY_LEAVE` | Excused duty absence | ✅ Attended |

### 10.4 Risk Status Thresholds

| Status | Condition | Color | Meaning |
|---|---|---|---|
| `safe` | ≥ 85% (or ≥ 80% in stats) | 🟢 Green | Well above requirement |
| `warning` | ≥ required% | 🟡 Yellow | Meeting minimum, little buffer |
| `high` | ≥ required% − 5 (or − 10) | 🟠 Orange | Dangerously close to threshold |
| `critical` | < required% − 5 | 🔴 Red | Below requirement, must attend |

---

> **Document prepared for:** Technical Interview / Portfolio Presentation
> **System:** Attendance Guardian v1.0
> **Author:** Sagar
> **Last Updated:** February 2026
