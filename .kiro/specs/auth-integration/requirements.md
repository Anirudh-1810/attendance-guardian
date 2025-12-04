# Requirements Document

## Introduction

This feature integrates the authentication logic of the landing page with the backend API. Currently, the landing page uses mock authentication with localStorage, but the backend has fully functional signup and login endpoints with JWT token generation and database persistence. This integration will enable real user registration and authentication, replacing the mock implementation with actual API calls.

## Glossary

- **Landing Page**: The frontend component that displays the login and signup forms to users
- **Backend API**: The Express.js server that handles authentication requests and database operations
- **JWT Token**: JSON Web Token used for authenticating subsequent API requests
- **User**: An individual who creates an account and logs into the system
- **Authentication System**: The combined frontend and backend components that handle user signup and login

## Requirements

### Requirement 1

**User Story:** As a new user, I want to create an account through the signup form, so that my credentials are securely stored in the database and I can access the application.

#### Acceptance Criteria

1. WHEN a user submits the signup form with valid data (name, email, password, course, universityNumber), THEN the Landing Page SHALL send a POST request to the Backend API signup endpoint
2. WHEN the Backend API successfully creates a user account, THEN the Authentication System SHALL return a JWT token and user information to the Landing Page
3. WHEN the signup is successful, THEN the Landing Page SHALL store the JWT token and user data in localStorage
4. WHEN the signup is successful, THEN the Landing Page SHALL navigate the user to the dashboard page
5. IF the email already exists in the database, THEN the Backend API SHALL return an error message and the Landing Page SHALL display it to the user

### Requirement 2

**User Story:** As an existing user, I want to log in through the login form, so that I can access my account and attendance data.

#### Acceptance Criteria

1. WHEN a user submits the login form with email and password, THEN the Landing Page SHALL send a POST request to the Backend API login endpoint
2. WHEN the Backend API successfully authenticates the user, THEN the Authentication System SHALL return a JWT token and user information to the Landing Page
3. WHEN the login is successful, THEN the Landing Page SHALL store the JWT token and user data in localStorage
4. WHEN the login is successful, THEN the Landing Page SHALL navigate the user to the dashboard page
5. IF the credentials are invalid, THEN the Backend API SHALL return an error message and the Landing Page SHALL display it to the user

### Requirement 3

**User Story:** As a user, I want to see clear error messages when authentication fails, so that I understand what went wrong and can correct my input.

#### Acceptance Criteria

1. WHEN the Backend API returns an error response, THEN the Landing Page SHALL extract the error message from the response
2. WHEN an error occurs during signup or login, THEN the Landing Page SHALL display the error message using a toast notification
3. WHEN a network error occurs, THEN the Landing Page SHALL display a user-friendly error message indicating connection issues
4. WHEN the signup form validation fails (e.g., passwords don't match), THEN the Landing Page SHALL display the validation error before making an API request

### Requirement 4

**User Story:** As a user, I want the signup form to collect all necessary information, so that my profile is complete when I create an account.

#### Acceptance Criteria

1. WHEN a user fills out the signup form, THEN the Landing Page SHALL collect name, email, password, course, and universityNumber fields
2. WHEN the user submits the signup form, THEN the Landing Page SHALL validate that all required fields are filled
3. WHEN the user submits the signup form, THEN the Landing Page SHALL validate that password and confirmPassword fields match
4. WHEN sending the signup request, THEN the Landing Page SHALL include name, email, and password in the request body
5. WHEN the Backend API creates the user, THEN the User SHALL be stored with name, email, and hashed password in the database

### Requirement 5

**User Story:** As a developer, I want the authentication state to be properly managed, so that the user remains logged in across page refreshes and can access protected routes.

#### Acceptance Criteria

1. WHEN a user successfully logs in or signs up, THEN the Authentication System SHALL store the JWT token in localStorage with a consistent key
2. WHEN a user successfully logs in or signs up, THEN the Authentication System SHALL store user information (id, name, email) in localStorage
3. WHEN the application loads, THEN the Landing Page SHALL check for an existing authentication token in localStorage
4. IF a valid token exists in localStorage, THEN the Landing Page SHALL redirect authenticated users away from the landing page to the dashboard
5. WHEN the user logs out, THEN the Authentication System SHALL remove the token and user data from localStorage
