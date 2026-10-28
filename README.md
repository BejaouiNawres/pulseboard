# PulseBoard 📊

> Real-time metrics monitoring & alerting platform

[![Backend CI](https://github.com/BejaouiNawres/pulseboard/actions/workflows/ci.yml/badge.svg)](https://github.com/BejaouiNawres/pulseboard/actions)

## Overview

PulseBoard is a full-stack real-time monitoring platform where data sources push metrics (CPU, temperature, KPIs, etc.) to a REST API, and users watch live dashboards that update instantly via WebSockets.

Built to showcase production-grade architecture patterns:
- **Event-driven real-time updates** via Socket.IO + Redis pub/sub
- **JWT authentication** with role-based access control
- **Clean layered architecture** with NestJS modules
- **Automated testing** with Jest (backend) + Vitest (frontend)
- **Containerized** with Docker Compose
- **CI/CD** with GitHub Actions

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS · TypeScript · TypeORM |
| Database | PostgreSQL · Redis |
| Real-time | Socket.IO |
| Frontend | React · TypeScript · Vite |
| Charts | Recharts |
| Styling | Tailwind CSS |
| DevOps | Docker · GitHub Actions |
| Deploy | Railway (backend) · Vercel (frontend) |

## Architecture

```
┌─────────────────┐     REST API      ┌──────────────────┐
│  Data Sources   │ ──────────────► │   NestJS API     │
│ (sensors/apps)  │                  │                  │
└─────────────────┘                  │  ┌────────────┐  │
                                     │  │ PostgreSQL │  │
┌─────────────────┐   Socket.IO      │  └────────────┘  │
│  React Frontend │ ◄──────────────  │  ┌────────────┐  │
│   Dashboard     │                  │  │   Redis    │  │
└─────────────────┘                  │  └────────────┘  │
                                     └──────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Clone & start infrastructure
```bash
git clone https://github.com/BejaouiNawres/pulseboard.git
cd pulseboard
docker-compose up -d
```

### 2. Start backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 🚀

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login & get JWT token |
| GET | /metrics | Get all metrics (paginated) |
| POST | /metrics | Push a new metric |
| GET | /alerts | Get all alerts |
| PUT | /alerts/:id/resolve | Resolve an alert |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `metric:new` | Server → Client | New metric received |
| `alert:triggered` | Server → Client | Alert threshold exceeded |
| `subscribe:source` | Client → Server | Subscribe to a data source |

## Features

- 🔐 JWT Authentication (Register / Login)
- 📊 Real-time charts (Line, Area, Bar) with Recharts
- 🔔 Alert system with threshold rules
- 👥 Role-based access (Admin / Viewer)
- 🐳 Docker Compose for local dev
- ✅ Unit & integration tests
- 🚀 CI/CD with GitHub Actions

## Author

**Nawres Bejaoui** — Full Stack Developer
- LinkedIn: [linkedin.com/in/nawres-bejaoui](https://linkedin.com/in/nawres-bejaoui)
- GitHub: [github.com/BejaouiNawres](https://github.com/BejaouiNawres)
