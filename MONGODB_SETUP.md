# MongoDB Setup Guide

## Option 1: Local MongoDB Installation (Recommended for Development)

### macOS (Using Homebrew)

1. Install MongoDB Community Edition:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

2. Start MongoDB service:
```bash
brew services start mongodb-community
```

3. Verify MongoDB is running:
```bash
mongosh
```

4. Exit MongoDB shell:
```
exit
```

### Windows

1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community

2. Run the installer and follow the installation wizard

3. MongoDB will be installed and started automatically

4. Verify installation by opening Command Prompt and running:
```bash
mongosh
```

### Linux (Ubuntu/Debian)

1. Install MongoDB:
```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
```

2. Start MongoDB:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. Verify installation:
```bash
mongosh
```

---

## Option 2: MongoDB Atlas (Cloud Database - Recommended for Production)

### Setup Steps:

1. Go to https://www.mongodb.com/cloud/atlas

2. Create a free account (M0 cluster is free)

3. Create a new cluster:
   - Click "Create a Cluster"
   - Choose "M0 Shared" (free tier)
   - Select your region
   - Click "Create Cluster"

4. Set up authentication:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Click "Add User"

5. Set up network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - For production, specify your IP address

6. Get connection string:
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

7. Update your `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ev-test-drive
```

---

## Option 3: Docker (Easiest - No Installation Needed)

If you have Docker installed, you can run MongoDB in a container:

```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

This will:
- Download and start MongoDB in a container
- Make it available on `localhost:27017`
- Keep data persistent in a Docker volume

---

## Verify MongoDB Connection

### Using Mongosh (MongoDB Shell)

```bash
# Connect to local MongoDB
mongosh

# Or connect with URI
mongosh "mongodb://localhost:27017"

# Check databases
show databases

# Switch to ev-test-drive database
use ev-test-drive

# Check collections
show collections

# Exit
exit
```

### Using MongoDB Compass (GUI)

1. Download from: https://www.mongodb.com/products/compass

2. Open Compass and connect to `mongodb://localhost:27017`

3. You should see the `ev-test-drive` database with `vehicles` and `reservations` collections

---

## Backend Configuration

### 1. Copy environment file:
```bash
cd backend
cp .env.example .env
```

### 2. Update `.env` with your MongoDB connection string:

**For local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/ev-test-drive
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ev-test-drive
PORT=5000
NODE_ENV=development
```

### 3. Install dependencies:
```bash
npm install
```

### 4. Start the server:
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: mongodb://localhost:27017/ev-test-drive
📦 Seeding vehicles...
✅ Vehicles seeded successfully
📦 Seeding sample reservations...
✅ Sample reservations seeded successfully

✅ Server is running on http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
🚗 API Available at: http://localhost:5000/api

📊 Database: MongoDB (mongodb://localhost:27017/ev-test-drive)
```

---

## Troubleshooting

### MongoDB connection refused
- Ensure MongoDB service is running
- Check your MONGODB_URI in `.env` file
- Try connecting with `mongosh` to verify

### Port 27017 already in use
```bash
# Find process using port 27017
lsof -i :27017

# Kill the process
kill -9 <PID>
```

### Permission denied error
- On Linux, ensure MongoDB user has proper permissions
- Run: `sudo chown -R mongodb:mongodb /var/lib/mongodb`

### Connection timeout
- Check if MongoDB service is actually running
- Try: `sudo systemctl restart mongod` (Linux)
- Or: `brew services restart mongodb-community` (macOS)

---

## Database Schema

### Vehicles Collection
```json
{
  "id": "tesla_1001",
  "type": "tesla_model3",
  "location": "dublin",
  "availableFromTime": "08:00:00",
  "availableToTime": "18:00:00",
  "availableDays": ["mon", "tue", "wed", "thur", "fri"],
  "minimumMinutesBetweenBookings": 15,
  "isActive": true,
  "createdAt": "2023-10-17T15:30:00Z",
  "updatedAt": "2023-10-17T15:30:00Z"
}
```

### Reservations Collection
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "tesla_1001",
  "startDateTime": "2023-10-18T09:00:00Z",
  "endDateTime": "2023-10-18T09:45:00Z",
  "customerName": "John Smith",
  "customerEmail": "john@smith.com",
  "customerPhone": "+353851234567",
  "bookingDate": "2023-10-17T15:30:00Z",
  "status": "confirmed",
  "notes": "",
  "createdAt": "2023-10-17T15:30:00Z",
  "updatedAt": "2023-10-17T15:30:00Z"
}
```

---

## Useful MongoDB Commands

### Connect to database:
```bash
mongosh "mongodb://localhost:27017/ev-test-drive"
```

### View all vehicles:
```javascript
db.vehicles.find().pretty()
```

### View all reservations:
```javascript
db.reservations.find().pretty()
```

### View specific vehicle's bookings:
```javascript
db.reservations.find({vehicleId: "tesla_1001"}).pretty()
```

### Count documents:
```javascript
db.vehicles.countDocuments()
db.reservations.countDocuments()
```

### Clear all data:
```javascript
db.vehicles.deleteMany({})
db.reservations.deleteMany({})
```

---

## Next Steps

1. ✅ Install MongoDB (choose option 1, 2, or 3)
2. ✅ Copy `.env.example` to `.env`
3. ✅ Update MONGODB_URI in `.env`
4. ✅ Run `npm install` in backend directory
5. ✅ Start backend with `npm start`
6. ✅ Verify at http://localhost:5000/api/health
7. ✅ Start frontend and test booking flow

---

## Production Recommendations

1. **Use MongoDB Atlas** for managed cloud database
2. **Enable TLS/SSL** connections
3. **Use strong passwords** for database users
4. **Restrict IP addresses** in Network Access
5. **Enable database backups** (automatic in Atlas)
6. **Monitor database performance** with Atlas tools
7. **Use environment variables** for sensitive data
8. **Implement database logging** and auditing

---

For more information, visit: https://www.mongodb.com/docs/
