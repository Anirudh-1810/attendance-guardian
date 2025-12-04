# Design Document

## Overview

This design document outlines the integration of the landing page authentication forms with the existing backend API. The current implementation uses mock authentication with localStorage, which will be replaced with real API calls to the backend's `/auth/signup` and `/auth/login` endpoints. The backend already has fully functional authentication with JWT tokens, bcrypt password hashing, and Prisma database integration.

The integration will leverage the existing `AuthContext` for state management and the existing `auth.ts` API module, which already has the correct function signatures but needs to be properly integrated into the landing page forms.

## Architecture

### High-Level Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Landing Page   │────────▶│   Auth API       │────────▶│  Backend API    │
│  (Forms)        │         │   (auth.ts)      │         │  (Express)      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            ▼
        │                            │                    ┌─────────────────┐
        │                            │                    │   PostgreSQL    │
        │                            │                    │   (via Prisma)  │
        │                            │                    └─────────────────┘
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  AuthContext    │         │   localStorage   │
│  (State Mgmt)   │────────▶│   (Persistence)  │
└─────────────────┘         └──────────────────┘
```

### Component Responsibilities

1. **Landing Page Component**: Handles form UI, validation, and user interactions
2. **Auth API Module** (`auth.ts`): Makes HTTP requests to backend endpoints
3. **AuthContext**: Manages authentication state and localStorage persistence
4. **Backend Auth Routes**: Validates credentials, manages database operations, generates JWT tokens
5. **Middleware**: Validates JWT tokens for protected routes (already implemented)

## Components and Interfaces

### Frontend Components

#### 1. Landing Page Form Handlers

**Location**: `frontend/src/pages/LandingPage.tsx`

**Modifications**:
- Replace mock `handleLogin` with real API call
- Replace mock `handleSignup` with real API call
- Add proper error handling for API failures
- Integrate with `AuthContext` for state management

**Key Functions**:
```typescript
handleLogin(e: FormEvent): Promise<void>
handleSignup(e: FormEvent): Promise<void>
```

#### 2. Auth API Module

**Location**: `frontend/src/api/auth.ts`

**Current State**: Already implemented with correct signatures
- `signup(data: SignupData): Promise<AuthResponse>`
- `login(data: LoginData): Promise<AuthResponse>`

**Integration Points**:
- Uses `VITE_API_URL` environment variable
- Returns `AuthResponse` with token and user data
- Throws errors with descriptive messages

#### 3. AuthContext

**Location**: `frontend/src/contexts/AuthContext.tsx`

**Current State**: Already implemented with:
- `login(token: string, user: User): void` - Stores auth data
- `logout(): void` - Clears auth data
- `isAuthenticated: boolean` - Auth status check

**Usage**: Landing page will call `login()` after successful API response

### Backend Components (Already Implemented)

#### 1. Auth Routes

**Location**: `backend/src/routes/auth.js`

**Endpoints**:
- `POST /auth/signup` - Creates new user, returns JWT token
- `POST /auth/login` - Authenticates user, returns JWT token

**Request/Response Format**:
```javascript
// Signup Request
{
  name: string,
  email: string,
  password: string
}

// Login Request
{
  email: string,
  password: string
}

// Success Response (both endpoints)
{
  token: string,
  user: {
    id: string,
    name: string,
    email: string
  }
}

// Error Response
{
  message: string,
  hint?: string,
  error?: string
}
```

## Data Models

### User Model (Prisma Schema)

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String?
  password  String
  semesters Semester[]
}
```

**Note**: The signup form collects `course` and `universityNumber`, but these fields are not currently in the User model. The design will send only `name`, `email`, and `password` to match the backend schema.

### Frontend Data Structures

#### SignupData (Form State)
```typescript
{
  name: string,
  course: string,           // Not sent to backend
  universityNumber: string, // Not sent to backend
  email: string,
  password: string,
  confirmPassword: string   // Client-side validation only
}
```

#### LoginData (Form State)
```typescript
{
  email: string,
  password: string
}
```

#### AuthResponse (API Response)
```typescript
{
  token: string,
  user: {
    id: string,
    name: string,
    email: string
  }
}
```

### LocalStorage Schema

```typescript
// Key: "token"
string // JWT token

// Key: "user"
{
  id: string,
  name: string,
  email: string
}
```

## Corr
ectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, several properties were identified as redundant. Properties 2.2, 2.3, 2.4, 5.1, and 5.2 test the same behaviors as properties from Requirement 1 (auth response format, localStorage storage, and navigation). These have been consolidated into comprehensive properties that apply to both signup and login flows.

### Property 1: Successful authentication stores complete data in localStorage
*For any* successful authentication (signup or login), the system should store both a JWT token under the key "token" and user information (containing id, name, and email) under the key "user" in localStorage.
**Validates: Requirements 1.3, 2.3, 5.1, 5.2**

### Property 2: Successful authentication navigates to dashboard
*For any* successful authentication (signup or login), the system should navigate the user to the "/dashboard" route.
**Validates: Requirements 1.4, 2.4**

### Property 3: Authentication API returns valid response structure
*For any* successful authentication request (signup or login), the backend API should return a response containing a JWT token string and a user object with id, name, and email fields.
**Validates: Requirements 1.2, 2.2**

### Property 4: Signup sends correct payload
*For any* signup form submission with valid data, the request body sent to the backend should contain exactly name, email, and password fields (excluding course and universityNumber which are not in the backend schema).
**Validates: Requirements 1.1, 4.4**

### Property 5: Login sends correct payload
*For any* login form submission, the request body sent to the backend should contain exactly email and password fields.
**Validates: Requirements 2.1**

### Property 6: Password hashing is applied
*For any* user created through the signup endpoint, the password stored in the database should be a bcrypt hash, not the plaintext password.
**Validates: Requirements 4.5**

### Property 7: Error messages are extracted and displayed
*For any* error response from the backend API, the frontend should extract the error message from the response and display it via a toast notification.
**Validates: Requirements 3.1, 3.2**

### Property 8: Client-side validation prevents API calls
*For any* form submission that fails client-side validation (missing required fields or password mismatch), the system should display an error message and not make an API request.
**Validates: Requirements 3.4, 4.2, 4.3**

### Property 9: Authenticated users are redirected
*For any* landing page load where a valid authentication token exists in localStorage, the user should be redirected to the dashboard.
**Validates: Requirements 5.3, 5.4**

### Property 10: Logout clears authentication data
*For any* logout action, the system should remove both the "token" and "user" keys from localStorage.
**Validates: Requirements 5.5**

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Catch fetch failures and display user-friendly messages
2. **API Errors**: Extract error messages from response JSON and display via toast
3. **Validation Errors**: Prevent form submission and show inline/toast errors
4. **Token Expiration**: Handle 401 responses by clearing auth state and redirecting to login

### Error Types and Responses

```typescript
// Network Error
try {
  await login(data);
} catch (error) {
  if (error instanceof TypeError) {
    toast.error("Connection failed. Please check your internet.");
  }
}

// API Error
{
  message: "Email already in use",
  hint: "Try logging in instead"
}

// Validation Error (Client-side)
if (password !== confirmPassword) {
  toast.error("Passwords do not match!");
  return; // Don't call API
}
```

### Backend Error Responses

The backend already implements comprehensive error handling:

1. **Missing Fields** (400): Returns message with hint about required fields
2. **Duplicate Email** (400): Returns "Email already in use"
3. **Invalid Credentials** (400): Returns "Invalid credentials"
4. **Server Errors** (500): Returns generic error message with details in logs

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and integration points:

1. **Form Validation Examples**:
   - Empty email field shows error
   - Mismatched passwords show error
   - Valid form data passes validation

2. **Error Handling Examples**:
   - Duplicate email error displays correct message
   - Invalid credentials error displays correct message
   - Network error displays connection message

3. **Integration Points**:
   - AuthContext login method updates state correctly
   - localStorage is accessed with correct keys
   - Navigation is called with correct route

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript/TypeScript property-based testing library). Each test will run a minimum of 100 iterations.

1. **Property 1: Successful authentication stores complete data in localStorage**
   - Generate random auth responses with token and user data
   - Verify localStorage contains both "token" and "user" keys
   - Verify user object has id, name, and email fields
   - **Feature: auth-integration, Property 1: Successful authentication stores complete data in localStorage**

2. **Property 2: Successful authentication navigates to dashboard**
   - Generate random successful auth scenarios
   - Verify navigation function called with "/dashboard"
   - **Feature: auth-integration, Property 2: Successful authentication navigates to dashboard**

3. **Property 3: Authentication API returns valid response structure**
   - Generate random user data for signup/login
   - Call backend endpoints
   - Verify response has token (string) and user (object with id, name, email)
   - **Feature: auth-integration, Property 3: Authentication API returns valid response structure**

4. **Property 4: Signup sends correct payload**
   - Generate random signup form data
   - Intercept API call
   - Verify request body contains only name, email, password
   - **Feature: auth-integration, Property 4: Signup sends correct payload**

5. **Property 5: Login sends correct payload**
   - Generate random login credentials
   - Intercept API call
   - Verify request body contains only email, password
   - **Feature: auth-integration, Property 5: Login sends correct payload**

6. **Property 6: Password hashing is applied**
   - Generate random passwords
   - Create users via signup endpoint
   - Query database directly
   - Verify stored password is bcrypt hash (starts with $2a$ or $2b$)
   - **Feature: auth-integration, Property 6: Password hashing is applied**

7. **Property 7: Error messages are extracted and displayed**
   - Generate random error responses with various message formats
   - Verify error message is extracted correctly
   - Verify toast notification is called with the message
   - **Feature: auth-integration, Property 7: Error messages are extracted and displayed**

8. **Property 8: Client-side validation prevents API calls**
   - Generate random invalid form data (missing fields, mismatched passwords)
   - Verify validation error is shown
   - Verify API call is not made
   - **Feature: auth-integration, Property 8: Client-side validation prevents API calls**

9. **Property 9: Authenticated users are redirected**
   - Generate random valid tokens and user data
   - Set localStorage with auth data
   - Mount landing page component
   - Verify redirect to dashboard occurs
   - **Feature: auth-integration, Property 9: Authenticated users are redirected**

10. **Property 10: Logout clears authentication data**
    - Generate random auth data in localStorage
    - Call logout function
    - Verify both "token" and "user" are removed from localStorage
    - **Feature: auth-integration, Property 10: Logout clears authentication data**

### Testing Configuration

- **Library**: fast-check (for property-based testing)
- **Minimum Iterations**: 100 per property test
- **Test Framework**: Jest (already configured in backend)
- **Frontend Testing**: Vitest or Jest with React Testing Library

## Implementation Notes

### Environment Variables

The frontend requires `VITE_API_URL` to be set:

```env
# frontend/.env
VITE_API_URL=http://localhost:4000
```

The backend requires `JWT_SECRET` and `DATABASE_URL`:

```env
# backend/.env
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### CORS Configuration

The backend already has CORS enabled via `app.use(cors())`. Ensure it allows requests from the frontend origin.

### Token Storage Security

While localStorage is used for simplicity, consider these security implications:
- Tokens are vulnerable to XSS attacks
- For production, consider httpOnly cookies or more secure storage
- Implement token refresh mechanism for long-lived sessions

### Future Enhancements

1. **Add course and universityNumber to User model**: Update Prisma schema to store these fields
2. **Implement password strength validation**: Add client-side password requirements
3. **Add email verification**: Send verification emails on signup
4. **Implement "Remember Me"**: Add option for extended token expiration
5. **Add OAuth integration**: Complete the "Continue with Google" button functionality
6. **Implement password reset**: Add "Forgot Password" functionality

## Dependencies

### Frontend
- Existing: `react-router-dom`, `sonner` (toast notifications)
- No new dependencies required

### Backend
- Existing: `express`, `bcryptjs`, `jsonwebtoken`, `@prisma/client`
- No new dependencies required

### Testing
- New: `fast-check` (for property-based testing)
- Existing: `jest` (backend), testing library for frontend

## Migration Strategy

Since this is replacing mock authentication with real authentication:

1. **No database migration needed**: User model already exists
2. **Clear existing localStorage**: Users with mock data will need to re-authenticate
3. **Backward compatibility**: Not required since mock auth was temporary
4. **Deployment**: Frontend and backend can be deployed independently (backend already functional)
