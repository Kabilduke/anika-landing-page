## MODIFIED Requirements

### Requirement: Centralized Authentication Service
User registrations, logins, OTP verifications, and sign-outs MUST be processed by service functions inside authService.js. The authentication backend SHALL send a 6-digit numeric OTP verification code via email instead of a clickable magic link.

#### Scenario: Signin OTP Request
- **WHEN** a user enters their email to sign in
- **THEN** the auth module SHALL call `authService.signInWithOtp(email)` to trigger a branded email containing a 6-digit numeric verification code (OTP)
