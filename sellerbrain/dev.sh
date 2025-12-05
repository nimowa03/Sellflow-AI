#!/bin/bash

# Kill ports if already running
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "🚀 Starting AI Marketing Hacker (SaaS Platform)..."

# Start Infrastructure (Docker)
echo "🐳 Starting Docker Containers (Mongo, n8n, Redis)..."
cd infrastructure
docker-compose up -d
cd ..

# Start Backend (FastAPI)
echo "🐍 Starting Backend API..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Start Celery Worker
echo "👷 Starting Celery Worker..."
celery -A worker.celery_app worker --loglevel=info &
WORKER_PID=$!
cd ..

# Start Frontend (Next.js)
echo "⚛️ Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All Services Started!"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo "   - n8n: http://localhost:5678"
echo "   - Docker: Mongo(27017), Redis(6379)"
echo "   (Press Ctrl+C to stop)"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID $WORKER_PID
