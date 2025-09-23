# EPG Manager Enterprise API Documentation

## Overview

The EPG Manager Enterprise API provides comprehensive endpoints for managing Electronic Program Guides (EPG) with enterprise-grade security, monitoring, and scalability features.

## Base URL

```
Production: https://api.epgmanager.com/v1
Staging: https://staging-api.epgmanager.com/v1
Development: http://localhost:3000/api
```

## Authentication

### Session-based Authentication

Use NextAuth.js session cookies for web applications.

### API Key Authentication

Include your API key in the request header:

```
X-API-Key: epg_your_api_key_here
```

### Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Admin endpoints**: 200 requests per minute

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "companyName": "Example TV Network"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}
```

#### POST /api/auth/signin

Sign in with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Users

#### GET /api/users

Get all users (Admin only).

**Headers:**

```
Authorization: Bearer <session_token>
```

**Response:**

```json
[
  {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CLIENT",
    "companyName": "Example TV Network",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "_count": {
      "channels": 5,
      "programs": 25,
      "schedules": 100
    }
  }
]
```

#### GET /api/users/{id}

Get user by ID.

#### PUT /api/users/{id}

Update user information.

#### DELETE /api/users/{id}

Delete user (Admin only).

### Channels

#### GET /api/channels

Get all channels for the authenticated user.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `isActive` (optional): Filter by active status

**Response:**

```json
{
  "channels": [
    {
      "id": "channel_id",
      "name": "news-channel",
      "displayName": "News Channel",
      "description": "24/7 News Channel",
      "logoUrl": "https://example.com/logo.png",
      "streamUrl": "https://example.com/stream.m3u8",
      "number": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### POST /api/channels

Create a new channel.

**Request Body:**

```json
{
  "name": "sports-channel",
  "displayName": "Sports Channel",
  "description": "Sports and Entertainment",
  "logoUrl": "https://example.com/sports-logo.png",
  "streamUrl": "https://example.com/sports.m3u8",
  "number": 2
}
```

#### PUT /api/channels/{id}

Update channel information.

#### DELETE /api/channels/{id}

Delete channel.

### Programs

#### GET /api/programs

Get all programs for the authenticated user.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `category` (optional): Filter by category

**Response:**

```json
{
  "programs": [
    {
      "id": "program_id",
      "title": "Morning News",
      "description": "Daily morning news update",
      "category": "News",
      "duration": 60,
      "imageUrl": "https://example.com/news-image.jpg",
      "isRepeat": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### POST /api/programs

Create a new program.

**Request Body:**

```json
{
  "title": "Evening Sports",
  "description": "Evening sports highlights",
  "category": "Sports",
  "duration": 90,
  "imageUrl": "https://example.com/sports-image.jpg",
  "isRepeat": false
}
```

#### POST /api/programs/{id}/copy

Copy an existing program.

#### PUT /api/programs/{id}

Update program information.

#### DELETE /api/programs/{id}

Delete program.

### Schedules

#### GET /api/schedules

Get all schedules for the authenticated user.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `channelId` (optional): Filter by channel
- `programId` (optional): Filter by program
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**

```json
{
  "schedules": [
    {
      "id": "schedule_id",
      "channelId": "channel_id",
      "programId": "program_id",
      "startTime": "2024-01-01T06:00:00Z",
      "endTime": "2024-01-01T07:00:00Z",
      "isLive": true,
      "isNew": false,
      "channel": {
        "id": "channel_id",
        "name": "news-channel",
        "displayName": "News Channel"
      },
      "program": {
        "id": "program_id",
        "title": "Morning News",
        "category": "News"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "pages": 10
  }
}
```

#### POST /api/schedules

Create a new schedule.

**Request Body:**

```json
{
  "channelId": "channel_id",
  "programId": "program_id",
  "startTime": "2024-01-01T06:00:00Z",
  "endTime": "2024-01-01T07:00:00Z",
  "isLive": true,
  "isNew": false
}
```

#### PUT /api/schedules/{id}

Update schedule information.

#### DELETE /api/schedules/{id}

Delete schedule.

### EPG Generation

#### GET /api/epg

Get EPG generation options and status.

#### POST /api/epg/generate

Generate EPG file.

**Request Body:**

```json
{
  "format": "xmltv",
  "channels": ["channel_id_1", "channel_id_2"],
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z",
  "includeImages": true
}
```

**Response:**

```json
{
  "epgUrl": "https://api.epgmanager.com/epg/user_id/epg.xml",
  "downloadUrl": "https://api.epgmanager.com/api/epg/download/epg_id",
  "expiresAt": "2024-01-08T00:00:00Z"
}
```

#### GET /api/epg/hosted/{userId}

Get hosted EPG URL for a user.

### Admin Endpoints

#### GET /api/admin/stats

Get system-wide statistics (Admin only).

**Response:**

```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalChannels": 500,
  "totalPrograms": 2500,
  "totalSchedules": 10000,
  "recentUsers": [
    {
      "id": "user_id",
      "email": "new@example.com",
      "name": "New User",
      "companyName": "New Company",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/admin/users

Get all users with detailed information (Admin only).

#### PUT /api/admin/users/{id}/toggle

Toggle user active status (Admin only).

### System Endpoints

#### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

#### GET /api/metrics

Get system metrics (Admin only).

**Response:**

```json
{
  "requestsPerMinute": 150,
  "averageResponseTime": 250,
  "errorRate": 0.02,
  "activeUsers": 45,
  "memoryUsage": {
    "used": 512000000,
    "total": 1024000000
  }
}
```

## WebSocket API

### Connection

Connect to WebSocket at: `ws://localhost:3000/api/socketio`

### Events

#### Client Events

- `message`: Send a message to the server
- `join_room`: Join a specific room (e.g., user-specific updates)
- `leave_room`: Leave a room

#### Server Events

- `message`: Echo message from server
- `epg_updated`: EPG generation completed
- `schedule_updated`: Schedule changes
- `system_notification`: System-wide notifications

### Example Usage

```javascript
const socket = io('ws://localhost:3000/api/socketio');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.emit('join_room', 'user_123');

socket.on('epg_updated', data => {
  console.log('EPG updated:', data);
});
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @epgmanager/sdk
```

```javascript
import { EPGManagerClient } from '@epgmanager/sdk';

const client = new EPGManagerClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.epgmanager.com/v1',
});

// Get channels
const channels = await client.channels.list();

// Create a program
const program = await client.programs.create({
  title: 'New Program',
  description: 'Program description',
  category: 'Entertainment',
  duration: 60,
});
```

### Python

```bash
pip install epgmanager-sdk
```

```python
from epgmanager import EPGManagerClient

client = EPGManagerClient(
    api_key='your_api_key',
    base_url='https://api.epgmanager.com/v1'
)

# Get channels
channels = client.channels.list()

# Create a program
program = client.programs.create({
    'title': 'New Program',
    'description': 'Program description',
    'category': 'Entertainment',
    'duration': 60
})
```

## Rate Limiting

Rate limits are applied per IP address and reset every minute. When rate limited, you'll receive a 429 status code with the following headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-01T00:01:00Z
Retry-After: 60
```

## Webhooks

Configure webhooks to receive real-time notifications about EPG changes.

### Webhook Events

- `epg.generated`: EPG file generated
- `schedule.created`: New schedule created
- `schedule.updated`: Schedule updated
- `schedule.deleted`: Schedule deleted
- `channel.created`: New channel created
- `program.created`: New program created

### Webhook Payload

```json
{
  "event": "epg.generated",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "userId": "user_id",
    "epgUrl": "https://api.epgmanager.com/epg/user_id/epg.xml",
    "channels": 5,
    "programs": 25
  }
}
```

## Support

For API support and questions:

- Email: api-support@epgmanager.com
- Documentation: https://docs.epgmanager.com
- Status Page: https://status.epgmanager.com
