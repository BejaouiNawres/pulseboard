# Getting Started with PulseBoard

## Prerequisites
- Node.js 18+ installed
- Docker Desktop installed
- VS Code installed

---

## Step 1 — Start the database

```bash
# From the project root
docker-compose up -d
```

Check it works:
```bash
docker ps
# You should see pulseboard_postgres and pulseboard_redis running
```

---

## Step 2 — Start the backend

```bash
cd backend

# Install dependencies (first time only)
npm install

# Copy environment variables
cp .env.example .env

# Start in development mode (hot reload)
npm run start:dev
```

✅ You should see:
```
🚀 PulseBoard API running on http://localhost:3000/api
```

---

## Step 3 — Start the frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

✅ Open http://localhost:5173 in your browser

---

## Step 4 — Create your account

1. Go to http://localhost:5173/register
2. Create an account
3. You'll be redirected to the dashboard

---

## Step 5 — Push test metrics

Open a terminal and run these commands to simulate data sources:

```bash
# CPU usage
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"source": "server-01", "name": "cpu_usage", "value": 78.5, "unit": "%"}'

# Temperature
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"source": "machine-A", "name": "temperature", "value": 72.3, "unit": "°C"}'

# Trigger an alert (cpu > 90)
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"source": "server-01", "name": "cpu_usage", "value": 95.0, "unit": "%"}'
```

Watch the dashboard update in real-time! 🎉

---

## Running tests

### Backend
```bash
cd backend
npm run test          # unit tests
npm run test:cov      # with coverage
```

### Frontend
```bash
cd frontend
npm run test          # vitest
```

---

## Project structure

```
pulseboard/
├── backend/
│   └── src/
│       ├── auth/       ← JWT authentication
│       ├── users/      ← User management
│       ├── metrics/    ← Metrics ingestion & querying
│       ├── alerts/     ← Alert rules & management
│       └── events/     ← Socket.IO real-time gateway
├── frontend/
│   └── src/
│       ├── pages/      ← Login, Register, Dashboard, Alerts
│       ├── components/ ← Navbar, MetricCard, MetricChart, AlertList
│       ├── hooks/      ← useAuth, useSocket
│       └── services/   ← axios API client, Socket.IO
└── docker-compose.yml  ← PostgreSQL + Redis
```

---

## Common issues

**Port already in use**: Kill the process on port 3000 or 5173
```bash
lsof -ti:3000 | xargs kill -9
```

**Database connection error**: Make sure Docker is running
```bash
docker-compose up -d
```

**npm install fails**: Delete node_modules and retry
```bash
rm -rf node_modules && npm install
```
