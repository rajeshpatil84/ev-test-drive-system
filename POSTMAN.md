# EV Test Drive System — API Curl Reference

Base URL: `http://localhost:5000`

## Vehicle Availability Constraints (seed data)

| Vehicle Type       | Location | Days Available          | Hours (UTC)     |
|--------------------|----------|-------------------------|-----------------|
| `tesla_model3`     | dublin   | Mon–Fri                 | 08:00 – 18:00   |
| `tesla_model3`     | cork     | Mon–Fri                 | 08:00 – 18:00   |
| `tesla_modelx`     | dublin   | Mon–Sat                 | 10:00 – 20:00   |
| `tesla_modelx`     | cork     | Mon–Sat                 | 10:00 – 20:00   |
| `tesla_modely`     | dublin   | Fri–Sun                 | 10:00 – 16:00   |
| `tesla_modely`     | cork     | Fri–Sun                 | 10:00 – 16:00   |
| `volkswagen_id4`   | dublin   | Mon–Sat                 | 09:00 – 18:00   |
| `volkswagen_id4`   | cork     | Mon–Sat                 | 09:00 – 18:00   |

> **Important:** `startDateTime` must be a weekday/time that falls within the vehicle's schedule above,
> and within 14 days from today. Requests outside these windows return an empty `availableVehicles` array.

---

## 1. Health Check

**GET /api/health**

```bash
curl -X GET http://localhost:5000/api/health \
  -H "Accept: application/json"
```

Expected response `200 OK`:
```json
{
  "status": "Server is running",
  "database": "Connected",
  "timestamp": "2026-05-26T09:00:00.000Z"
}
```

---

## 2. Check Availability

**GET /api/availability**

Required query params: `vehicleType`, `location`, `startDateTime` (ISO 8601), `durationMins`

**Tesla Model 3 — Dublin — Tuesday 09:00 (valid weekday, within hours):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-06-02T09:00:00&durationMins=45" \
  -H "Accept: application/json"
```

**Tesla Model X — Dublin — Saturday 11:00 (Mon–Sat vehicle):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_modelx&location=dublin&startDateTime=2026-05-30T11:00:00&durationMins=60" \
  -H "Accept: application/json"
```

**Tesla Model Y — Cork — Friday 10:00 (Fri–Sun vehicle):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_modely&location=cork&startDateTime=2026-05-29T10:00:00&durationMins=30" \
  -H "Accept: application/json"
```

**Volkswagen ID4 — Dublin — Wednesday 14:00:**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=volkswagen_id4&location=dublin&startDateTime=2026-06-03T14:00:00&durationMins=60" \
  -H "Accept: application/json"
```

Expected response `200 OK`:
```json
{
  "success": true,
  "data": {
    "requestedVehicleType": "tesla_model3",
    "location": "dublin",
    "startDateTime": "2026-06-02T09:00:00",
    "durationMins": 45,
    "availableVehicles": [
      { "id": "tesla_1001", "type": "tesla_model3", "location": "dublin" },
      { "id": "tesla_1007", "type": "tesla_model3", "location": "dublin" }
    ]
  }
}
```

### Availability — cases that correctly return empty results

**Saturday — tesla_model3 is Mon–Fri only (returns empty, not an error):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-06-06T09:00:00&durationMins=45" \
  -H "Accept: application/json"
```

**After closing time — 21:10 is past 18:00 for tesla_model3:**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-06-02T21:10:00&durationMins=45" \
  -H "Accept: application/json"
```

### Availability — validation errors

**Missing parameter (400):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin" \
  -H "Accept: application/json"
```

**Invalid date format (400):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=06-06-2026&durationMins=45" \
  -H "Accept: application/json"
```

**Date beyond 14-day window (400):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-12-01T09:00:00&durationMins=45" \
  -H "Accept: application/json"
```

**Negative duration (400):**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-06-02T09:00:00&durationMins=-10" \
  -H "Accept: application/json"
```

---

## 3. Book a Test Drive

**POST /api/bookings**

Required body fields: `vehicleId`, `startDateTime`, `durationMins`, `customerName`, `customerPhone`, `customerEmail`

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-02T09:00:00",
    "durationMins": 45,
    "customerName": "John Doe",
    "customerPhone": "+353871234567",
    "customerEmail": "john.doe@example.com"
  }'
```

Expected response `201 Created`:
```json
{
  "success": true,
  "message": "Test drive scheduled successfully",
  "reservation": {
    "id": "reservation-uuid",
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-02T09:00:00.000Z",
    "endDateTime": "2026-06-02T09:45:00.000Z",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "customerPhone": "+353871234567",
    "bookingDate": "2026-05-25T10:00:00.000Z",
    "status": "confirmed"
  }
}
```

### Booking — error cases

**Missing fields (400):**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-02T09:00:00"
  }'
```

**Invalid email (400):**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-02T09:00:00",
    "durationMins": 45,
    "customerName": "John Doe",
    "customerPhone": "+353871234567",
    "customerEmail": "not-an-email"
  }'
```

**Conflicting time slot (409 — run this twice to trigger conflict):**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-03T10:00:00",
    "durationMins": 45,
    "customerName": "Jane Smith",
    "customerPhone": "+353871234568",
    "customerEmail": "jane.smith@example.com"
  }'
```

---

## 4. Get Reservations for a Vehicle

**GET /api/bookings/:vehicleId**

```bash
curl -X GET http://localhost:5000/api/bookings/tesla_1001 \
  -H "Accept: application/json"
```

**Vehicle with no bookings:**
```bash
curl -X GET http://localhost:5000/api/bookings/tesla_1007 \
  -H "Accept: application/json"
```

Expected response `200 OK`:
```json
{
  "success": true,
  "vehicleId": "tesla_1001",
  "reservations": [
    {
      "id": "18726",
      "vehicleId": "tesla_1001",
      "startDateTime": "2023-10-18T09:00:00.000Z",
      "endDateTime": "2023-10-18T09:45:00.000Z",
      "customerName": "John Smith",
      "customerEmail": "john@smith.com",
      "customerPhone": "+353851234567",
      "bookingDate": "2023-10-17T15:30:00.000Z",
      "status": "confirmed"
    }
  ]
}
```

---

## 5. List All Vehicles

**GET /api/vehicles**

```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Accept: application/json"
```

Expected response `200 OK`:
```json
{
  "success": true,
  "vehicles": [
    {
      "id": "tesla_1001",
      "type": "tesla_model3",
      "location": "dublin",
      "availableFromTime": "08:00:00",
      "availableToTime": "18:00:00",
      "availableDays": ["mon", "tue", "wed", "thur", "fri"],
      "minimumMinutesBetweenBookings": 15,
      "isActive": true
    }
  ]
}
```

---

## End-to-End Flow

Run these in order to complete a full booking:

**Step 1 — List all vehicles (see IDs and schedules):**
```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Accept: application/json"
```

**Step 2 — Check availability for a valid weekday within business hours:**
```bash
curl -X GET "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2026-06-02T09:00:00&durationMins=45" \
  -H "Accept: application/json"
```

**Step 3 — Book using a vehicleId from Step 2:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2026-06-02T09:00:00",
    "durationMins": 45,
    "customerName": "John Doe",
    "customerPhone": "+353871234567",
    "customerEmail": "john.doe@example.com"
  }'
```

**Step 4 — Confirm the booking was saved:**
```bash
curl -X GET http://localhost:5000/api/bookings/tesla_1001 \
  -H "Accept: application/json"
```
