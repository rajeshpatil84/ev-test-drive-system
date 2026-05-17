# EV Test Drive Scheduling Service

A full-stack web application for managing electric vehicle test drive reservations. Built with Node.js/Express backend and React frontend.

## Project Structure

```
ev-test-drive-service/
├── backend/
│   ├── data/
│   │   ├── vehicles.json       # Vehicle inventory
│   │   └── reservations.json   # Booking records
│   ├── services/
│   │   └── schedulingService.js # Core scheduling logic
│   ├── utils/
│   │   └── dataStore.js        # Data persistence utility
│   ├── server.js               # Express server & API endpoints
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TestDriveBooking.js
│   │   │   └── TestDriveBooking.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── README.md
└── .gitignore
```

## Features

### Backend API

#### 1. Check Vehicle Availability
**Endpoint:** `GET /api/availability`

Query Parameters:
- `vehicleType` - Type of vehicle (e.g., tesla_model3, tesla_modelx)
- `location` - Location (e.g., dublin, cork)
- `startDateTime` - Start time in ISO 8601 format (e.g., 2023-11-01T09:00:00Z)
- `durationMins` - Duration in minutes

**Response Example:**
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
      }
    ]
  }
}
```

#### 2. Schedule a Test Drive
**Endpoint:** `POST /api/bookings`

Request Body:
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

**Response Example:**
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

#### 3. Get Vehicle Bookings
**Endpoint:** `GET /api/bookings/:vehicleId`

**Response Example:**
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
    }
  ]
}
```

### Frontend Features

- **Intuitive Booking Interface**: Two-step booking process
  1. Check availability for desired date/time
  2. Complete customer details and confirm booking
- **Dynamic Vehicle Selection**: Automatically selects available vehicles
- **14-Day Booking Window**: Users can book up to 14 days in advance
- **Configurable Vehicle Type & Location**: Component props allow customization
- **Real-time Validation**: Client and server-side validation
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

To use development mode with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, for non-localhost API):
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Testing the Solution

### Using cURL (Backend Testing)

1. **Check Availability:**
```bash
curl "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2023-10-18T09:00:00Z&durationMins=45"
```

2. **Schedule a Test Drive:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2023-10-18T10:00:00Z",
    "durationMins": 45,
    "customerName": "Jane Doe",
    "customerPhone": "+353851234567",
    "customerEmail": "jane@example.com"
  }'
```

3. **Get Vehicle Bookings:**
```bash
curl http://localhost:5000/api/bookings/tesla_1001
```

### Using Postman

1. Import the collection or manually create requests
2. Test each endpoint with the examples provided above
3. Verify responses and error handling

### Using the Frontend UI

1. Ensure both backend and frontend servers are running
2. Navigate to `http://localhost:3000`
3. Select a date and time within the next 14 days
4. Choose a duration (30 min to 2 hours)
5. Review available vehicles
6. Enter your details and confirm the booking
7. Receive confirmation with booking ID

## API Constraints & Validation

### Availability Check Constraints
- Vehicles must match the requested type
- Vehicles must be at the requested location
- Booking date must be within the next 14 days
- Booking must fall within the vehicle's operating hours
- Booking day must be in the vehicle's available days list
- No conflicts with existing reservations
- Minimum 15-minute buffer between bookings

### Booking Constraints
- All required fields must be provided
- Email must be a valid format
- Vehicle must be available for the requested time
- Start time must be in the future
- Duration must be positive

## Vehicle Inventory

The system includes 6 Tesla vehicles:

**Dublin:**
- tesla_1001: Tesla Model 3 (08:00-18:00, Mon-Fri)
- tesla_1002: Tesla Model X (10:00-20:00, Mon-Sat)
- tesla_1003: Tesla Model Y (10:00-16:00, Fri-Sun)

**Cork:**
- tesla_1004: Tesla Model 3 (08:00-18:00, Mon-Fri)
- tesla_1005: Tesla Model X (10:00-20:00, Mon-Sat)
- tesla_1006: Tesla Model Y (10:00-16:00, Fri-Sun)

## Data Persistence

The system uses JSON files for data persistence:
- `backend/data/vehicles.json` - Vehicle inventory
- `backend/data/reservations.json` - All bookings

Both files are automatically created if they don't exist.

## Customizing the Frontend Component

The `TestDriveBooking` component accepts props:

```jsx
<TestDriveBooking 
  vehicleType="tesla_modelx"     // Default vehicle type
  location="cork"                 // Default location
  apiBaseUrl="http://api.example.com:5000"  // API endpoint
/>
```

## Error Handling

The system provides clear error messages for:
- Invalid date/time formats
- Missing required fields
- Vehicle not found
- Time conflicts with existing bookings
- Operating hours violations
- Booking window exceeded (>14 days)

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication and profiles
- Email notifications
- Cancellation and rescheduling
- Admin dashboard
- Analytics and reporting
- Multiple language support
- Payment integration

## License

MIT

## Support

For issues or questions, please contact the development team.
