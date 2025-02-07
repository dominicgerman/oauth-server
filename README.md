# OAuth 2.0 Authorization and Token Server (TypeScript)

This project implements a simple OAuth 2.0 authorization and token server in TypeScript using `express` and `jose` for JWT handling.

## Features

- Implements OAuth 2.0 **Authorization Code Grant**.
- Provides an **Authorization Endpoint** (`/api/oauth/authorize`).
- Provides a **Token Endpoint** (`/api/oauth/token`).
- Issues **JWT-based access tokens**.
- Supports **state parameter** for CSRF protection.

## Prerequisites

- Node.js (>= 18)
- npm (>= 8)

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/dominicgerman/oauth-server.git
cd oauth-server
npm install
```

## Usage

Start the server:

```sh
npm start
```

The server will be available at <http://localhost:8080>.

## API Endpoints

### **1. Authorization Endpoint**

**URL:**  
`GET /api/oauth/authorize`

**Description:**  
Initiates the OAuth 2.0 authorization flow by redirecting the user to the provided `redirect_uri` with an authorization code.

**Request Parameters:**

| Parameter       | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `response_type` | `string` | ✅ | Must be `"code"` |
| `client_id`    | `string` | ✅ | Must be `"upfirst"` |
| `redirect_uri` | `string` | ✅ | Must be `"http://localhost:8081/process"` |
| `state`        | `string` | ❌ | Optional. If provided, it will be returned in the redirect response. |

**Example Request:**

```sh
curl -X GET "http://localhost:8080/api/oauth/authorize?response_type=code&client_id=upfirst&redirect_uri=http://localhost:8081/process&state=xyz123"
```

Example Response (Redirect):

```text
HTTP/1.1 302 Found
Location: http://localhost:8081/process?code=SOME_CODE&state=xyz123
```

### **2. Token Endpoint**

**URL:**
`POST /api/oauth/token`

**Description:**
Exchanges an authorization code for an access token.

Request Headers:

```text
Content-Type: application/x-www-form-urlencoded
```

Request Body:

| Parameter       | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `grant_type` | `string` | ✅ | Must be `"authorization_code"` |
| `code`    | `string` | ✅ | Authorization code from the previous step |
| `client_id` | `string` | ✅ | Must be `"upfirst"` |
| `redirect_uri`        | `string` | ✅ | Must match the original `redirect_uri` |

Example Request:

```sh
curl -X POST "http://localhost:8080/api/oauth/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=SOME_CODE&client_id=upfirst&redirect_uri=http://localhost:8081/process"
```

Example Response:

```json
{
  "access_token": "SOME_JWT_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600
}
```
