# Implementation Plan

- [x] 1. Update Landing Page signup handler to use real API





  - Replace mock setTimeout logic with actual API call to `signup()` from `auth.ts`
  - Integrate with AuthContext's `login()` method to store auth data
  - Handle API errors and display via toast notifications
  - Keep client-side validation for password matching
  - Send only name, email, and password to backend (exclude course and universityNumber)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.4_

- [x] 1.1 Write property test for signup payload structure


  - **Property 4: Signup sends correct payload**
  - **Validates: Requirements 1.1, 4.4**

- [x] 1.2 Write property test for successful signup flow


  - **Property 1: Successful authentication stores complete data in localStorage**
  - **Property 2: Successful authentication navigates to dashboard**
  - **Validates: Requirements 1.3, 1.4, 2.3, 2.4, 5.1, 5.2**

- [x] 2. Update Landing Page login handler to use real API





  - Replace mock setTimeout logic with actual API call to `login()` from `auth.ts`
  - Integrate with AuthContext's `login()` method to store auth data
  - Handle API errors and display via toast notifications
  - Remove mock user creation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.1 Write property test for login payload structure


  - **Property 5: Login sends correct payload**
  - **Validates: Requirements 2.1**

- [x] 3. Implement comprehensive error handling in Landing Page





  - Add try-catch blocks around API calls
  - Extract error messages from API responses
  - Display network errors with user-friendly messages
  - Ensure validation errors prevent API calls
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Write property test for error message extraction


  - **Property 7: Error messages are extracted and displayed**
  - **Validates: Requirements 3.1, 3.2**

- [x] 3.2 Write property test for client-side validation


  - **Property 8: Client-side validation prevents API calls**
  - **Validates: Requirements 3.4, 4.2, 4.3**

- [x] 3.3 Write unit tests for specific error cases


  - Test duplicate email error displays correct message
  - Test invalid credentials error displays correct message
  - Test network error displays connection message
  - _Requirements: 1.5, 2.5, 3.3_

- [x] 4. Add authenticated user redirect logic to Landing Page





  - Check for existing token in localStorage on component mount
  - Redirect to dashboard if valid token exists
  - Use AuthContext's `isAuthenticated` property
  - _Requirements: 5.3, 5.4_

- [x] 4.1 Write property test for authenticated redirect


  - **Property 9: Authenticated users are redirected**
  - **Validates: Requirements 5.3, 5.4**

- [x] 5. Verify backend password hashing and database persistence





  - Review existing bcrypt implementation in auth routes
  - Ensure passwords are hashed before storage
  - Verify User model stores hashed passwords correctly
  - _Requirements: 4.5_

- [x] 5.1 Write property test for password hashing


  - **Property 6: Password hashing is applied**
  - **Validates: Requirements 4.5**

- [x] 6. Verify AuthContext logout functionality





  - Ensure logout method clears both token and user from localStorage
  - Test logout integration with Landing Page
  - _Requirements: 5.5_

- [x] 6.1 Write property test for logout behavior


  - **Property 10: Logout clears authentication data**
  - **Validates: Requirements 5.5**

- [x] 7. Write property test for API response structure





  - **Property 3: Authentication API returns valid response structure**
  - **Validates: Requirements 1.2, 2.2**

- [x] 8. Checkpoint - Ensure all tests pass








  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update environment configuration





  - Verify VITE_API_URL is set correctly in frontend/.env
  - Verify JWT_SECRET is set in backend/.env
  - Document environment variables in README if needed
  - _Requirements: All (infrastructure)_

- [ ] 10. Manual integration testing
  - Test complete signup flow end-to-end
  - Test complete login flow end-to-end
  - Test error scenarios (duplicate email, invalid credentials)
  - Test authenticated redirect behavior
  - Verify localStorage contains correct data after auth
  - _Requirements: All_

a- [ ] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
