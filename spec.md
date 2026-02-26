# Specification

## Summary
**Goal:** Fix the login credential input in the SmartAttend frontend so it correctly accepts and processes alphanumeric credentials like STU003, TCH001, and ADM001.

**Planned changes:**
- Audit and fix `LoginPage.tsx` to ensure the credential input uses `type="text"` with no numeric-only restrictions (remove any `type="number"`, `inputMode="numeric"`, blocking `onKeyPress`/`onKeyDown`/`onChange` handlers, or restrictive `pattern` attributes).
- Audit and fix `useLogin.ts` to ensure the credential string is correctly handled when it contains letters, so alphanumeric credentials are properly mapped to the backend's expected format without silent failures.

**User-visible outcome:** Users can type alphanumeric credentials (e.g., STU003, TCH001, ADM001) into the login field and successfully log in to their respective dashboards. Invalid credentials still show an inline error message.
