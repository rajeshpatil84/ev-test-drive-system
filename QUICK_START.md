# Quick Start Guide - MongoDB Edition

## One-Step Setup with Docker (Easiest)

### Prerequisites
- Docker and Docker Compose installed

### Run Everything with One Command:
```bash
cd ev-test-drive-service
docker-compose up
```

This will:
- Start MongoDB (automatically seeded with data)
- Start Backend (http://localhost:5000)
- Start Frontend (http://localhost:3000)

Then open http://localhost:3000 in your browser.

---

## Manual Setup (3 Steps)

### Step 1: Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
- Run MongoDB Community Edition installer
- Service starts automatically

**Linux:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

### Step 2: Start Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults to local MongoDB)
npm install
npm start
```

You should see:
```
✅ MongoDB Connected: mongodb://localhost:27017/ev-test-drive
📦 Seeding vehicles...
✅ Vehicles seeded successfully
✅ Server is running on http://localhost:5000
```

### Step 3: Start Frontend

In a new terminal:
```bash
cd frontend
npm install
npm start
```

Opens at http://localhost:3000

---

## Verify It's Working

### Check Backend Health:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "Server is running",
  "database": "Connected",
  "timestamp": "2023-10-17T15:30:00Z"
}
```

### Check Frontend:
Open http://localhost:3000 in browser

---

## Test Booking Flow

1. Select a date/time within next 14 days
2. Choose duration (30 min to 2 hours)
3. Click "Check Availability"
4. See available vehicles (now with location)
5. Enter your details
6. Click "Confirm Booking"
7. See success message with booking ID

---

## Troubleshooting

### MongoDB Not Running
```bash
# Check if MongoDB is running
mongosh

# If command not found, install MongoDB first
brew install mongodb-community  # macOS
sudo apt-get install mongodb-org  # Linux
```

### Port Already in Use
```bash
# Backend on different port
cd backend
PORT=5001 npm start

# Frontend on different port  
cd frontend
PORT=3001 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### Database Connection Error
Check `.env` file has correct `MONGODB_URI`:
```bash
cd backend
cat .env

# Should show something like:
# MONGODB_URI=mongodb://localhost:27017/ev-test-drive
```

---

## MongoDB Atlas (Cloud Database)

If you prefer cloud database instead of local:

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Get connection string
4. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ev-test-drive
```
5. Restart backend: `npm start`

See `MONGODB_SETUP.md` for detailed cloud setup.

---

## Next Steps

1. ✅ Applications running
2. Read `README.md` for full documentation
3. Read `API.md` for API reference
4. Read `MONGODB_SETUP.md` for database details
5. Deploy to production

---

## Quick Commands Reference

```bash
# Start all services (Docker)
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Start just backend
cd backend && npm start

# Start just frontend
cd frontend && npm start

# Check MongoDB
mongosh

# View collections
use ev-test-drive
show collections
db.vehicles.count()
db.reservations.count()
```

---

**Done!** Your EV Test Drive system is running with MongoDB! 🚗⚡
