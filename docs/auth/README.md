# TechBazaar Authentication Endpoints Documentation

This document outlines the authentication and account management routes available in the API.

## Endpoints

### 1. Create Account

Registers a new user.

**Endpoint**:

**POST** `/auth/register`

**Middleware:**

- `blockRequestIfActiveSession`: Ensures the user is not logged in before accessing this route.

**Body Parameters**:
| Parameter | Type | Required | Description | Requirement |
|-----------|------------|------------|------------|------------|
| `first_name` | String | Yes | The user's first name | - |
| `last_name` | String | Yes | The user's last name | - |
| `email` | String | Yes | The user's email address | - |
| `password` | String | Yes | The user's password | Must be 8-16 characters long, and contain at least one numeric digit, and special character |

_**Important Note**: Upon registration, an OTP will be sent to the provided email address, which should be used to verify the user's account and complete registration. Unverified accounts will not have access to protected endpoints._

**Example Request**:

```bash
POST /auth/register
Content-Type: application/json

{
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    password: 'Johndoe@123'
}
```

Example Response:

```json
{
  "message": "Account created successfully. Email verification OTP has been sent to john@doe.com",
  "data": {
    "_id": "123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@doe.com",
    "email_verified": false
    // other user details
  }
}
```

### 2. Verify Email Address

Verifies a user's email address using a one-time password (OTP).

**Endpoint**:

`POST /auth/verify-email`

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address. |
| `OTP` | String | Yes | The OTP that was sent to the email address |

**Example Request**:

```bash
POST /auth/verify-email
Content-Type: application/json

{
    email: 'john@doe.com',
    OTP: '123456'
}
```

Example Response:

```json
{
  "message": "Email verified successfully",
  "data": {
    "_id": "123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@doe.com",
    "email_verified": true
    // other user details
  }
}
```

### 3. Login User

Logs in an existing user.

**Endpoint**:

**POST** `/auth/login`

**Middleware:**

- `blockRequestIfActiveSession`: Ensures the user is not logged in before accessing this route.

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address |
| `password` | String | Yes | The user's password |

**Example Request**:

```bash
POST /auth/login
Content-Type: application/json

{
    email: 'john@doe.com',
    password: 'Johndoe@123'
}
```

**Example Response**:

JSON:

```json
{
  "message": "Login successful",
  "data": {
    "_id": "123",
    "first_name": "John",
    "last_name": "Doe"
    // other user details
  }
}
```

Headers:

| Header   | Value                     |
| -------- | ------------------------- |
| `Cookie` | session_id={cookie_value} |

### 4. Logout User

Delete user session and authentication cookie.

**Endpoint**:

**DELETE** `/auth/logout`

### 5. Resend Email Verification OTP

Resends the OTP for email verification.

**Endpoint**:

**POST** `/auth/resend-otp`

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address. |

### 6. Request Password Reset

Requests a password reset OTP.

**Endpoint**:

**POST** `/auth/request-password-reset`

**Middleware:**

- `blockRequestIfActiveSession`: Ensures the user is not logged in before accessing this route.

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address. |

### 7. Verify Password Reset

Checks the validity of a password reset request.

**Endpoint**:

**GET** `/auth/verify-password-reset`

**Middleware:**

- `blockRequestIfActiveSession`: Ensures the user is not logged in before accessing this route.

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address. |

### 8. Complete Password Reset

Completes the password reset process and updates the user's password.

**Endpoint**:

**PUT** `/auth/reset-password`

**Middleware:**

- `blockRequestIfActiveSession`: Ensures the user is not logged in before accessing this route.

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `email` | String | Yes | The user's email address. |
| `OTP` | String | Yes | The OTP that was sent to the email address. |
| `new_password` | String | Yes | The user's new password. |

### 9. Get Google OAuth URI

Generates the Google OAuth login URI for authentication.

**Endpoint**:

**GET** `/auth/google/url`

### 10. Authenticate user with Google

Handles Google OAuth authentication and logs in the user.

**Endpoint**:

**GET** `/auth/google`

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------------|------------|------------|
| `code` | String | Yes | The authorization code from Google. |
