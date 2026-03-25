# SignalAI - Setup Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Telegram Bot Token (from @BotFather)
- Google Gemini API Key (from ai.google.dev)

## Quick Start

### 1. Clone & Install
```bash
cd eldorbot
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start Database (Docker)
```bash
docker-compose up db -d
```

### 4. Run Backend
```bash
npm run dev:backend
```

### 5. Run Frontend
```bash
npm run dev:frontend
```

### 6. Run Bot
```bash
npm run dev:bot
```

## Docker (Full Stack)
```bash
docker-compose up --build
```

## BotFather Setup
1. Create bot via @BotFather
2. Set Menu Button: `/setmenubutton` -> your webapp URL
3. Copy bot token to `.env`

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/problems` - Create problem
- `GET /api/problems` - List problems
- `GET /api/problems/:id` - Problem detail
- `POST /api/vote` - Toggle vote
- `GET /api/analytics` - Dashboard data
- `POST /api/upload` - Upload image
