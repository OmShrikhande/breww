# Games Backend API Documentation

## Overview
This document provides comprehensive API documentation for the Games Backend authentication system. The API uses JWT (JSON Web Tokens) for session management and supports user registration and login via email or mobile number.

## Base URL
```
http://192.168.1.33:3000
```

## API Endpoints Summary

| Sr. No. | Endpoint | Method | Token Needed | Request Body/Parameters | Expected Response | Description | Status Codes |
|---------|----------|--------|--------------|------------------------|-------------------|-------------|--------------|
| 1 | `/api/auth/register` | POST | No | `{"email": "user@example.com", "mobile": "1234567890", "password": "password123", "agreement": true}` | `{"success": true, "message": "User registered successfully", "data": {"user": {...}, "token": "jwt_token"}}` | Register a new user with email or mobile, password, and agreement acceptance. Either email or mobile is required, but not both. | 201: Success, 400: Validation error, 409: User with this email already exists / User with this mobile number already exists, 500: Server error |
| 2 | `/api/auth/login` | POST | No | `{"identifier": "user@example.com" or "1234567890", "password": "password123"}` | `{"success": true, "message": "Login successful", "data": {"user": {...}, "token": "jwt_token"}}` | Login with email or mobile number and password. Returns JWT token for session management. | 200: Success, 400: Missing fields, 401: Invalid credentials, 500: Server error |
| 3 | `/api/auth/profile` | GET | Yes (Bearer Token) | None | `{"success": true, "data": {"user": {...}}}` | Get authenticated user's profile information. Requires valid JWT token in Authorization header. | 200: Success, 401: Invalid/expired token, 500: Server error |
| 4 | `/api/games` | POST | Yes (Bearer Token) | `{"name": "Game Name", "logo": "https://example.com/logo.png", "description": "Game description", "genre": "Action", "platform": "PC", "release_date": "2024-01-01", "developer": "Developer Name", "publisher": "Publisher Name", "rating": 8.5}` | `{"success": true, "message": "Game added successfully", "data": {"game": {...}}}` | Add a new game to the database. Requires authentication. | 201: Success, 400: Validation error, 409: Game already exists, 401: Unauthorized, 500: Server error |
| 5 | `/api/games` | GET | No | Query params: `genre`, `platform`, `developer` | `{"success": true, "message": "Games retrieved successfully", "data": {"games": [...], "count": 10}}` | Get all games with optional filtering by genre, platform, or developer. | 200: Success, 500: Server error |
| 6 | `/api/games/:id` | GET | No | None | `{"success": true, "message": "Game retrieved successfully", "data": {"game": {...}}}` | Get a specific game by ID. | 200: Success, 404: Game not found, 500: Server error |
| 7 | `/api/games/:id` | PUT | Yes (Bearer Token) | Same as POST | `{"success": true, "message": "Game updated successfully", "data": {"game": {...}}}` | Update an existing game. Requires authentication. | 200: Success, 400: Validation error, 404: Game not found, 401: Unauthorized, 500: Server error |
| 8 | `/api/games/:id` | DELETE | Yes (Bearer Token) | None | `{"success": true, "message": "Game deleted successfully"}` | Delete a game by ID. Requires authentication. | 200: Success, 404: Game not found, 401: Unauthorized, 500: Server error |
| 9 | `/health` | GET | No | None | `{"success": true, "message": "Server is running", "timestamp": "2024-01-01T00:00:00.000Z"}` | Health check endpoint to verify server status and connectivity. | 200: Server running, 500: Server error |

## Authentication
The API uses JWT Bearer tokens for protected endpoints. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. User Registration

### Endpoint
```
POST /api/auth/register
```

### Description
Register a new user account with email or mobile number, password, and agreement acceptance.

### Request Body
```json
{
  "email": "user@example.com",
  "mobile": "1234567890",
  "password": "password123",
  "agreement": true
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | No* | User's email address (*Either email or mobile required) |
| mobile | string | No* | User's mobile number (*Either email or mobile required) |
| password | string | Yes | User's password (min 6 characters recommended) |
| agreement | boolean | Yes | User agreement acceptance |

### Response (Success - 201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "mobile": "1234567890",
      "agreement": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Either email or mobile number is required | Neither email nor mobile provided |
| 400 | Password is required | Password field missing |
| 400 | You must agree to the terms and conditions | Agreement not accepted |
| 400 | Invalid email format | Email format validation failed |
| 400 | Invalid mobile number format | Mobile format validation failed |
| 409 | User with this email already exists | Email already registered |
| 409 | User with this mobile number already exists | Mobile number already registered |
| 500 | Internal server error | Server-side error |

---

## 2. User Login

### Endpoint
```
POST /api/auth/login
```

### Description
Authenticate user with email/mobile and password, returns JWT token for session management.

### Request Body
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| identifier | string | Yes | User's email or mobile number |
| password | string | Yes | User's password |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "mobile": "1234567890",
      "agreement": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Email/mobile and password are required | Missing required fields |
| 401 | Invalid credentials | Wrong email/mobile or password |
| 500 | Internal server error | Server-side error |

---

## 3. Get User Profile

### Endpoint
```
GET /api/auth/profile
```

### Description
Retrieve authenticated user's profile information. Requires valid JWT token.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "mobile": "1234567890",
      "agreement": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Access token is required | No token provided |
| 401 | Token has expired | JWT token expired |
| 401 | Invalid token | Invalid JWT token |
| 401 | User not found | User associated with token doesn't exist |
| 500 | Internal server error | Server-side error |

---

## 4. Add Game

### Endpoint
```
POST /api/games
```

### Description
Add a new game to the database. Requires authentication with a valid JWT token.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "name": "Cyberpunk 2077",
  "logo": "https://example.com/cyberpunk-logo.png",
  "description": "An open-world, action-adventure RPG set in the dark future of Night City.",
  "genre": "RPG",
  "platform": "PC, PlayStation, Xbox",
  "release_date": "2020-12-10",
  "developer": "CD Projekt Red",
  "publisher": "CD Projekt",
  "rating": 7.5
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Game name (unique, max 255 characters) |
| logo | string | No | URL to game logo image |
| description | string | No | Game description |
| genre | string | No | Game genre (e.g., Action, RPG, Strategy) |
| platform | string | No | Supported platforms |
| release_date | string | No | Release date in YYYY-MM-DD format |
| developer | string | No | Game developer name |
| publisher | string | No | Game publisher name |
| rating | number | No | Game rating (0-10, decimal allowed) |

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Game added successfully",
  "data": {
    "game": {
      "id": 1,
      "name": "Cyberpunk 2077",
      "logo": "https://example.com/cyberpunk-logo.png",
      "description": "An open-world, action-adventure RPG set in the dark future of Night City.",
      "genre": "RPG",
      "platform": "PC, PlayStation, Xbox",
      "release_date": "2020-12-10T00:00:00.000Z",
      "developer": "CD Projekt Red",
      "publisher": "CD Projekt",
      "rating": 7.5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Game name is required | Name field is missing or empty |
| 400 | Rating must be between 0 and 10 | Rating value is out of valid range |
| 401 | Access token is required | No JWT token provided |
| 401 | Token has expired | JWT token expired |
| 401 | Invalid token | Invalid JWT token |
| 409 | Game with this name already exists | Game name already in database |
| 500 | Internal server error | Server-side error |

---

## 5. Get All Games

### Endpoint
```
GET /api/games
```

### Description
Retrieve all games from the database with optional filtering.

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| genre | string | Filter by game genre |
| platform | string | Filter by platform |
| developer | string | Filter by developer |

### Example Requests
```
GET /api/games
GET /api/games?genre=RPG
GET /api/games?platform=PC&developer=CD%20Projekt%20Red
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": {
    "games": [
      {
        "id": 1,
        "name": "Cyberpunk 2077",
        "logo": "https://example.com/cyberpunk-logo.png",
        "description": "An open-world, action-adventure RPG...",
        "genre": "RPG",
        "platform": "PC, PlayStation, Xbox",
        "release_date": "2020-12-10T00:00:00.000Z",
        "developer": "CD Projekt Red",
        "publisher": "CD Projekt",
        "rating": 7.5,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

## 6. Get Game by ID

### Endpoint
```
GET /api/games/:id
```

### Description
Retrieve a specific game by its ID.

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Game ID (URL parameter) |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Game retrieved successfully",
  "data": {
    "game": {
      "id": 1,
      "name": "Cyberpunk 2077",
      "logo": "https://example.com/cyberpunk-logo.png",
      "description": "An open-world, action-adventure RPG...",
      "genre": "RPG",
      "platform": "PC, PlayStation, Xbox",
      "release_date": "2020-12-10T00:00:00.000Z",
      "developer": "CD Projekt Red",
      "publisher": "CD Projekt",
      "rating": 7.5,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 404 | Game not found | No game exists with the specified ID |
| 500 | Internal server error | Server-side error |

---

## 7. Update Game

### Endpoint
```
PUT /api/games/:id
```

### Description
Update an existing game. Requires authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Game ID (URL parameter) |

### Request Body
Same as Add Game endpoint. All fields are optional for updates.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Game updated successfully",
  "data": {
    "game": {
      "id": 1,
      "name": "Cyberpunk 2077",
      "logo": "https://example.com/updated-logo.png",
      "description": "Updated description...",
      "genre": "RPG",
      "platform": "PC, PlayStation, Xbox, Nintendo Switch",
      "release_date": "2020-12-10T00:00:00.000Z",
      "developer": "CD Projekt Red",
      "publisher": "CD Projekt",
      "rating": 8.0,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

## 8. Delete Game

### Endpoint
```
DELETE /api/games/:id
```

### Description
Delete a game by ID. Requires authentication.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Game ID (URL parameter) |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Game deleted successfully"
}
```

---

## 9. Health Check

### Endpoint
```
GET /health
```

### Description
Check server health and connectivity status.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 500 | Internal server error | Server-side error |

---

## Data Validation Rules

### Email Format
- Must be valid email format (e.g., user@example.com)
- Checked using regex pattern

### Mobile Number Format
- Must contain only digits
- Length: 1-15 digits
- Can include country code

### Password
- No specific format enforced (recommended: min 8 characters, mixed case, numbers, symbols)
- Hashed using bcrypt with salt rounds of 12

### JWT Token
- Expires in 7 days (configurable)
- Contains user ID in payload
- Must be included in Authorization header for protected routes

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  agreement BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_or_mobile CHECK (
    (email IS NOT NULL AND mobile IS NULL) OR
    (email IS NULL AND mobile IS NOT NULL) OR
    (email IS NOT NULL AND mobile IS NOT NULL)
  )
);
```

### Games Table
```sql
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  logo VARCHAR(500),
  description TEXT,
  genre VARCHAR(100),
  platform VARCHAR(100),
  release_date DATE,
  developer VARCHAR(255),
  publisher VARCHAR(255),
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables Required

Create a `.env` file in the project root with:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=games_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
```

## Error Response Format

All error responses follow this consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Success Response Format

All success responses follow this consistent format:
```json
{
  "success": true,
  "message": "Success description",
  "data": {
    // Response data
  }
}
```

## Rate Limiting
Currently not implemented. Consider adding rate limiting for production use.

## CORS
CORS is enabled for cross-origin requests from any origin.

## Testing the API

### Using cURL

#### Register User
```bash
curl -X POST http://192.168.1.33:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mobile": "1234567890",
    "password": "password123",
    "agreement": true
  }'
```

#### Login User
```bash
curl -X POST http://192.168.1.33:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

#### Get Profile (replace TOKEN with actual JWT)
```bash
curl -X GET http://192.168.1.33:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

#### Add Game (replace TOKEN with actual JWT)
```bash
curl -X POST http://192.168.1.33:3000/api/games \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Witcher 3: Wild Hunt",
    "logo": "https://example.com/witcher3-logo.png",
    "description": "An open-world RPG with deep storytelling and monster hunting.",
    "genre": "RPG",
    "platform": "PC, PlayStation, Xbox",
    "release_date": "2015-05-19",
    "developer": "CD Projekt Red",
    "publisher": "CD Projekt",
    "rating": 9.5
  }'
```

#### Get All Games
```bash
curl http://192.168.1.33:3000/api/games
```

#### Get Games by Genre
```bash
curl "http://192.168.1.33:3000/api/games?genre=RPG"
```

#### Get Game by ID
```bash
curl http://192.168.1.33:3000/api/games/1
```

#### Update Game (replace TOKEN with actual JWT)
```bash
curl -X PUT http://192.168.1.33:3000/api/games/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 9.7
  }'
```

#### Delete Game (replace TOKEN with actual JWT)
```bash
curl -X DELETE http://192.168.1.33:3000/api/games/1 \
  -H "Authorization: Bearer TOKEN"
```

#### Health Check
```bash
curl http://192.168.1.33:3000/health
```