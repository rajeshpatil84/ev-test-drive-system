FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend
RUN npm run build

# Copy all source code
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose ports
EXPOSE 5000 3000

# Run backend and frontend
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
