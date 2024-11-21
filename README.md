# TechBazaar API

**TechBazaar API** is a fake e-commerce API built for demonstration purposes. It implements basic e-commerce API functionalities such as products data retrieval, user authentication, carts and wishlist management, orders management and more!

## Base URL

All API requests should be made to: [`https://techbazaar-api.onrender.com/api/v1`](https://techbazaar-api.onrender.com/api/v1)

## Authentication

This API uses session-based authentication. To access authenticated endpoints:

Log in via the [`/auth/login`](./docs/auth/README.md#3-login-user) endpoint using valid credentials.
The server sets an authentication cookie in your browser or client that must be included with subsequent requests.
Sessions expire after 24 hour2 of inactivity.

## Error Handling

The API uses standardized error responses to ensure consistent communication of issues. Errors are returned with appropriate HTTP status codes and a detailed error message.

**Error Response Format**:

<!-- {
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A description of the error."
  }
} -->

```json
{
  "error": "A description of the error.",
  "stack": "The error's stack trace (only available if NODE_ENV is set to development)"
}
```

**Common Error Codes**:

| Status Code | Message                                 |
| ----------- | --------------------------------------- |
| 400         | The request data is invalid             |
| 401         | You must log in to access this resource |
| 403         | You do not have access rights           |
| 404         | The requested resource is missing       |
| 500         | An unexpected error occurred            |

## Rate Limiting

To ensure fair usage and maintain API performance, rate limiting is enforced on all endpoints. The default rate limit for all endpoints is 200 requests per minute.

If you exceed the limit, the API responds with a 429 Too Many Requests status code.

**Rate Limit Error Response**:

```json
{
  "error": "You have exceeded the maximum number of allowed requests. Please try again later."
}
```

You can monitor your usage via the X-RateLimit-\* headers included in every response:

- `X-RateLimit-Limit`: Maximum allowed requests in the current window.
- `X-RateLimit-Remaining`: Number of requests remaining.
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets.

## Endpoints

- **[Authentication](./docs/auth/README.md):**
  The authenticetion endpoints handle authentication and account management in the API, including account creation, user login, email verification e.t.c.

- **[Products](./docs/products/README.md):**
  The products endpoints contain routes for managing products in the API.

- **[Brands](./docs/brands/README.md):**
  The brands endpoints contain routes for managing brands in the API.

- **[Users](./docs/users/README.md):**
  The users endpoints contain routes related to user management, including profile updates, wishlist, cart, and orders

- **[Orders](./docs/orders/README.md):**
  The orders endpoints contain routes related to managing orders, including fetching all orders, retrieving specific orders by ID, and updating order statuses.
