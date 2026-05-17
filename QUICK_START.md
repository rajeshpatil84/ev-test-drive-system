# Quick Start Guide

## One-Step Setup

### For Backend:
```bash
cd backend
npm install
npm start
```
Server runs on: http://localhost:5000

### For Frontend:
```bash
cd frontend
npm install
npm start
```
Application opens on: http://localhost:3000

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:

**For Backend:**
```bash
PORT=5001 npm start
# Then update frontend to use http://localhost:5001
```

**For Frontend:**
```bash
PORT=3001 npm start
# Opens on http://localhost:3001
```

### CORS Issues
The backend includes CORS headers. If you're accessing from a different domain, you may need to:

1. Update the CORS configuration in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://your-frontend-domain.com'
}));
```

2. Update the API URL in the frontend component:
```jsx
<TestDriveBooking apiBaseUrl="http://your-backend-domain.com:5000" />
```

### Module Not Found Errors
Make sure all dependencies are installed:
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

## Testing Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open browser to http://localhost:3000
4. Select a date/time and check availability
5. Complete the booking with customer details
6. Receive confirmation with booking ID

## Sample Test Data

The system comes with sample vehicles and reservations. Some dates already have bookings:
- Date: 2023-10-18 (Wednesday)
- Time slots with reservations: 9:00-9:45, 11:30-12:15, 14:45-15:30

Try booking different times on the same date or different dates to see availability.
