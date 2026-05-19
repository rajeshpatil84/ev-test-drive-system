# EV Test Drive Scheduling Service - MongoDB Edition

A full-stack web application for managing electric vehicle test drive reservations. Built with Node.js/Express backend (with MongoDB), React frontend, and Docker.

## Project Structure

```
ev-test-drive-service/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── models/
│   │   ├── Vehicle.js                 # Mongoose schema for vehicles
│   │   └── Reservation.js             # Mongoose schema for reservations
│   ├── services/
│   │   └── schedulingService.js       # Core scheduling logic (MongoDB)
│   ├── scripts/
│   │   └── initializeDB.js            # Database seeding
│   ├── server.js                      # Express server & API endpoints
│   ├── .env.example                   # Environment variables template
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
├── MONGODB_SETUP.md                   # Complete MongoDB setup guide
├── README.md                          # This file
├── QUICK_START.md
├── API.md
├── setup.sh / setup.bat               # Setup scripts
├── docker-compose.yml                 # Docker configuration
└── .gitignore
```

## Key Improvements with MongoDB

✅ **Persistent Data Storage** - Data survives server restarts
✅ **Scalability** - Handle thousands of bookings efficiently
✅ **Query Flexibility** - Complex queries on vehicle and reservation data
✅ **Indexes** - Optimized performance for common queries
✅ **Cloud Ready** - Easy deployment to MongoDB Atlas
✅ **Schema Validation** - Data integrity with Mongoose schemas
✅ **Full CRUD Operations** - Complete data management

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

#### 3. Get Vehicle Bookings
**Endpoint:** `GET /api/bookings/:vehicleId`

#### 4. Get All Vehicles (Admin)
**Endpoint:** `GET /api/vehicles`

### Frontend Features

- **Intuitive Booking Interface**: Two-step booking process
- **Dynamic Vehicle Selection**: Automatically selects available vehicles
- **14-Day Booking Window**: Users can book up to 14 days in advance
- **Configurable Vehicle Type & Location**: Component props allow customization
- **Real-time Validation**: Client and server-side validation
- **Responsive Design**: Works on desktop and mobile devices
- **Detailed Availability Messages**: Tells users why vehicles aren't available

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas cloud)
- Git

### Step 1: MongoDB Setup

Choose one of three options:

**Option A: Local MongoDB (Recommended for Development)**

macOS with Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Windows: Download from https://www.mongodb.com/try/download/community

Linux:
```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Docker:
```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

**Option B: MongoDB Atlas (Cloud - Free tier available)**

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create M0 free cluster
3. Set up authentication
4. Get connection string
5. Copy connection string to `.env` file

See `MONGODB_SETUP.md` for detailed instructions.

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection:
```
MONGODB_URI=mongodb://localhost:27017/ev-test-drive
PORT=5000
NODE_ENV=development
```

4. Install dependencies:
```bash
npm install
```

5. Start the server:
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: mongodb://localhost:27017/ev-test-drive
📦 Seeding vehicles...
✅ Vehicles seeded successfully
✅ Server is running on http://localhost:5000
```

### Step 3: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Docker Setup (Alternative)

If you prefer Docker:

```bash
docker-compose up
```

This will:
- Start MongoDB container
- Start backend service
- Start frontend service
- All services will be available on localhost

## Testing the Solution

### Phase 1: API Testing

1. **Health Check:**
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "Server is running",
  "database": "Connected",
  "timestamp": "2023-10-17T15:30:00Z"
}
```

2. **Check Availability:**
```bash
curl "http://localhost:5000/api/availability?vehicleType=tesla_model3&location=dublin&startDateTime=2023-11-01T09:00:00Z&durationMins=45"
```

3. **Make a Booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "tesla_1001",
    "startDateTime": "2023-11-01T09:00:00Z",
    "durationMins": 45,
    "customerName": "Jane Doe",
    "customerPhone": "+353851234567",
    "customerEmail": "jane@example.com"
  }'
```

### Phase 2: Frontend Testing

1. Open http://localhost:3000
2. Select date and time within next 14 days
3. Check availability
4. Review available vehicles (now shows location)
5. Enter customer details
6. Confirm booking
7. See success message with booking ID

### Phase 3: Database Verification

Using MongoDB shell:
```bash
mongosh

# Switch to database
use ev-test-drive

# View vehicles
db.vehicles.find().pretty()

# View reservations
db.reservations.find().pretty()

# View specific vehicle's bookings
db.reservations.find({vehicleId: "tesla_1001"}).pretty()

# Count bookings
db.reservations.countDocuments()

# Find bookings for specific customer
db.reservations.find({customerEmail: "jane@example.com"}).pretty()
```

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

All vehicles are automatically seeded into MongoDB on first run.

## Database Schemas

### Vehicle Collection
```javascript
{
  id: String (unique, indexed),
  type: String (indexed),
  location: String (indexed, lowercase),
  availableFromTime: String,
  availableToTime: String,
  availableDays: [String],
  minimumMinutesBetweenBookings: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Reservation Collection
```javascript
{
  id: String (unique, indexed),
  vehicleId: String (indexed),
  startDateTime: Date (indexed),
  endDateTime: Date (indexed),
  customerName: String,
  customerEmail: String (indexed, lowercase),
  customerPhone: String,
  bookingDate: Date,
  status: String (confirmed/completed/cancelled, indexed),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Data Persistence

All data is stored in MongoDB with automatic persistence:
- **Automatic Backups**: MongoDB handles data backups
- **Indexes**: Optimized queries for better performance
- **Transactions**: Ensure data consistency
- **Replication**: Data reliability (MongoDB Atlas)

Data is automatically seeded on first run with:
- 6 Tesla vehicles across 2 locations
- 3 sample reservations for testing

## Customizing the Frontend Component

The `TestDriveBooking` component accepts props:

```jsx
<TestDriveBooking 
  vehicleType="tesla_modelx"     // Default vehicle type
  location="cork"                 // Default location
  apiBaseUrl="http://api.example.com:5000"  // API endpoint
/>
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ev-test-drive

# Server Configuration
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ev-test-drive
```

## Error Handling

The system provides clear error messages for:
- Invalid date/time formats
- Missing required fields
- Vehicle not found
- Time conflicts with existing bookings
- Operating hours violations
- Booking window exceeded (>14 days)
- Invalid email format
- Database connection errors

## Production Deployment

### Using MongoDB Atlas (Recommended)

1. Create MongoDB Atlas account and cluster
2. Get connection string
3. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ev-test-drive
NODE_ENV=production
```

### Deployment Platforms

**Heroku:**
```bash
git push heroku main
```

**Railway/Render:**
- Connect GitHub repository
- Set MongoDB URI environment variable
- Deploy automatically

**Docker:**
```bash
docker build -t ev-drive-backend .
docker run -e MONGODB_URI=<uri> -p 5000:5000 ev-drive-backend
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check MONGODB_URI in `.env`
- Try connecting with mongosh: `mongosh`
- For Atlas, check IP whitelist in Network Access

### Port Already in Use
```bash
# Change port in .env or use:
PORT=5001 npm start
```

### Data Not Persisting
- Verify MongoDB is running
- Check MongoDB storage location has write permissions
- Check disk space availability

### CORS Issues
The backend includes CORS headers. If accessing from different domain:
```javascript
// Update in server.js:
app.use(cors({
  origin: 'http://your-frontend-domain.com'
}));
```

## Next Steps

1. ✅ Set up MongoDB (see MONGODB_SETUP.md)
2. ✅ Configure `.env` file
3. ✅ Start backend service
4. ✅ Start frontend service
5. ✅ Test booking flow
6. ✅ Deploy to production

## Technology Stack

- **Frontend**: React 18, Axios, Moment.js, CSS3
- **Backend**: Node.js, Express, Mongoose, MongoDB
- **Database**: MongoDB (local or MongoDB Atlas)
- **DevOps**: Docker, Docker Compose

## Support

- See `API.md` for detailed API documentation
- See `MONGODB_SETUP.md` for complete database setup
- See `QUICK_START.md` for quick reference
- See `INSTALLATION_TESTING_GUIDE.md` for testing procedures

## License

MIT

## Version

- **Version**: 2.0.0
- **Database**: MongoDB with Mongoose
- **Status**: Production Ready
- **Last Updated**: May 17, 2026
