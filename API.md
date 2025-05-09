# Sirenda Hire API Documentation

This document provides detailed information about the Sirenda Hire API endpoints.

## Authentication

All API endpoints (except login/register) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Base URL

Development: `http://localhost:3000/api`
Production: `https://api.sirendahire.com/api`

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "userType": "user" | "company"
}
```

#### Login
```http
POST /auth/login
```

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

### Users

#### Get Current User
```http
GET /users/me
```

#### Update User Profile
```http
PUT /users/me
```

Request body:
```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### Vehicles

#### List Vehicles
```http
GET /vehicles
```

Query parameters:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string
- `minPrice`: number
- `maxPrice`: number
- `location`: string

#### Get Vehicle Details
```http
GET /vehicles/:id
```

#### Create Vehicle (Company only)
```http
POST /vehicles
```

Request body:
```json
{
  "brand": "string",
  "model": "string",
  "year": "number",
  "pricePerDay": "number",
  "category": "string",
  "location": "string",
  "description": "string",
  "features": "string[]",
  "images": "File[]"
}
```

#### Update Vehicle (Company only)
```http
PUT /vehicles/:id
```

#### Delete Vehicle (Company only)
```http
DELETE /vehicles/:id
```

### Bookings

#### Create Booking
```http
POST /bookings
```

Request body:
```json
{
  "vehicleId": "number",
  "pickupDate": "string (ISO date)",
  "returnDate": "string (ISO date)",
  "totalPrice": "number"
}
```

#### Get User Bookings
```http
GET /bookings
```

#### Get Booking Details
```http
GET /bookings/:id
```

#### Cancel Booking
```http
DELETE /bookings/:id
```

### Company Management

#### Get Company Vehicles
```http
GET /company/vehicles
```

#### Get Company Bookings
```http
GET /company/bookings
```

#### Update Vehicle Availability
```http
PUT /company/vehicles/:id/availability
```

Request body:
```json
{
  "available": "boolean"
}
```

### Admin Endpoints

#### Get All Users
```http
GET /admin/users
```

#### Get All Companies
```http
GET /admin/companies
```

#### Get All Bookings
```http
GET /admin/bookings
```

#### Update User Status
```http
PUT /admin/users/:id/status
```

Request body:
```json
{
  "status": "active" | "suspended" | "banned"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes for authenticated users
- 50 requests per 15 minutes for unauthenticated users

## WebSocket Events

The API also provides real-time updates via WebSocket:

```typescript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Listen for events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle event
};

// Available events:
// - booking.created
// - booking.updated
// - booking.cancelled
// - vehicle.updated
// - vehicle.availability_changed
```

## Pagination

All list endpoints support pagination. The response includes:

```json
{
  "data": [],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

## File Uploads

File uploads are supported for vehicle images. The maximum file size is 5MB, and only image files (JPEG, PNG, GIF) are allowed.

## Versioning

The API is versioned. The current version is v1. Include the version in the URL:

```
/api/v1/endpoint
```

## Support

For API support or questions:
1. Check the documentation
2. Contact the development team
3. Open an issue in the repository 