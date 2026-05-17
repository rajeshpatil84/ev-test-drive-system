# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "Server is running"
}
```

---

### 2. Check Vehicle Availability
**GET** `/availability`

Find available vehicles for a given date, time, location, and vehicle type.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vehicleType | string | Yes | Type of vehicle (e.g., tesla_model3, tesla_modelx, tesla_modely) |
| location | string | Yes | Location (e.g., dublin, cork) |
| startDateTime | string (ISO 8601) | Yes | Start time (e.g., 2023-11-01T09:00:00Z) |
| durationMins | number | Yes | Duration in minutes (must be positive) |

**Example Request:**
```bash
GET /api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2023-11-01T09:00:00Z&durationMins=45
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "requestedVehicleType": "tesla_model3",
    "location": "dublin",
    "startDateTime": "2023-11-01T09:00:00Z",
    "durationMins": 45,
    "availableVehicles": [
      {
        "id": "tesla_1001",
        "type": "tesla_model3",
        "location": "dublin"
      },
      {
        "id": "tesla_1004",
        "type": "tesla_model3",
        "location": "cork"
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Missing required parameters: vehicleType, location, startDateTime, durationMins"
}
```

**Error Response (400) - Future booking limit:**
```json
{
  "success": false,
  "message": "Bookings are only available for up to 14 days in the future"
}
```

---

### 3. Schedule a Test Drive
**POST** `/bookings`

Create a new test drive reservation.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "vehicleId": "tesla_1001",
  "startDateTime": "2023-11-01T09:00:00Z",
  "durationMins": 45,
  "customerName": "John Smith",
  "customerPhone": "+353851234567",
  "customerEmail": "john@smith.com"
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vehicleId | string | Yes | ID of the vehicle |
| startDateTime | string (ISO 8601) | Yes | Start time |
| durationMins | number | Yes | Duration in minutes |
| customerName | string | Yes | Full name of the customer |
| customerPhone | string | Yes | Phone number with country code |
| customerEmail | string | Yes | Valid email address |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Test drive scheduled successfully",
  "reservation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "vehicleId": "tesla_1001",
    "startDateTime": "2023-11-01T09:00:00Z",
    "endDateTime": "2023-11-01T09:45:00Z",
    "customerName": "John Smith",
    "customerEmail": "john@smith.com",
    "customerPhone": "+353851234567",
    "bookingDate": "2023-10-17T15:30:00Z"
  }
}
```

**Error Response (400) - Missing fields:**
```json
{
  "success": false,
  "message": "Missing required fields: vehicleId, startDateTime, durationMins, customerName, customerPhone, customerEmail"
}
```

**Error Response (409) - Vehicle not available:**
```json
{
  "success": false,
  "message": "Vehicle is not available for the requested time slot"
}
```

---

### 4. Get Vehicle Reservations
**GET** `/bookings/:vehicleId`

Retrieve all reservations for a specific vehicle.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vehicleId | string | Yes | ID of the vehicle |

**Example Request:**
```bash
GET /api/bookings/tesla_1001
```

**Success Response (200):**
```json
{
  "success": true,
  "vehicleId": "tesla_1001",
  "reservations": [
    {
      "id": "18726",
      "vehicleId": "tesla_1001",
      "startDateTime": "2023-10-18T09:00:00Z",
      "endDateTime": "2023-10-18T09:45:00Z",
      "customerName": "John Smith",
      "customerEmail": "john@smith.com",
      "customerPhone": "+353851234567",
      "bookingDate": "2023-10-17T15:30:00Z"
    },
    {
      "id": "18727",
      "vehicleId": "tesla_1001",
      "startDateTime": "2023-10-18T11:30:00Z",
      "endDateTime": "2023-10-18T12:15:00Z",
      "customerName": "Jill Jones",
      "customerEmail": "jill@jones.com",
      "customerPhone": "+353879876543",
      "bookingDate": "2023-10-17T14:00:00Z"
    }
  ]
}
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 409 | Conflict | Vehicle not available or booking conflict |
| 500 | Server Error | Internal server error |

---

## Example Workflows

### Workflow 1: Complete Booking Flow

1. **Check Availability:**
```bash
curl "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2023-11-15T10:00:00Z&durationMins=45"
```

Response shows available vehicles (e.g., tesla_1001).

2. **Book a Vehicle:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2023-11-15T10:00:00Z",
    "durationMins": 45,
    "customerName": "Sarah Connor",
    "customerPhone": "+353851234567",
    "customerEmail": "sarah@example.com"
  }'
```

3. **View All Bookings:**
```bash
curl http://localhost:5000/api/bookings/tesla_1001
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:
- Per-IP rate limits
- Per-user rate limits
- API key authentication

---

## Data Validation

### Email Validation
Must be a valid email format: `user@domain.com`

### Phone Number Format
Accepts any format, e.g.:
- +353851234567
- +1-555-123-4567
- 00353851234567

### DateTime Format
Must be ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`

### Duration
Must be a positive integer (in minutes)

---

## Best Practices

1. **Always validate inputs on the client side**
2. **Use ISO 8601 format for all dates and times**
3. **Include timezone information (Z for UTC)**
4. **Handle errors gracefully in your client**
5. **Cache availability results when appropriate**
6. **Implement retry logic for network failures**

---

## Support

For API issues, check:
1. Backend server is running
2. Correct URL and HTTP method
3. Required parameters are provided
4. Date/time format is correct
5. JSON syntax in POST body is valid
