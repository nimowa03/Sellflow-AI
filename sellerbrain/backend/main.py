from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from celery import Celery
import os
import json # JSONB 처리를 위해 유지
import asyncio
import redis.asyncio as redis

app = FastAPI(title="AI Marketing Hacker API (SaaS)", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 설정 (MongoDB)
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ai_marketing
products_collection = db.products

# Celery 설정 (Redis)
celery_app = Celery(
    "worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
)

# WebSocket 연결 관리자 (Connection Manager)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Redis 구독자 (Subscriber) - 워커 메시지를 웹소켓으로 중계
async def redis_connector():
    redis_conn = redis.from_url(os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"))
    pubsub = redis_conn.pubsub()
    await pubsub.subscribe("sourcing_updates")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            decoded_message = message["data"].decode("utf-8")
            await manager.broadcast(decoded_message)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_connector())

# API Endpoints
class ProductCreate(BaseModel):
    name: str
    price: int

class SourcingRequest(BaseModel):
    query: str

@app.post("/sourcing/")
def start_sourcing(request: SourcingRequest):
    """
    상품 소싱 작업 시작 (황금 키워드 발굴)
    """
    # Trigger Celery Task
    task = celery_app.send_task("worker.run_sourcing_task", args=[request.query])
    return {"task_id": task.id, "status": "started", "query": request.query}

@app.post("/products/")
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_dict["status"] = "queued"
    result = await products_collection.insert_one(product_dict)
    
    # Trigger Celery Task (Legacy)
    # celery_app.send_task("worker.run_ai_agent_task", args=[str(result.inserted_id), product.name])
    
    return {"id": str(result.inserted_id), "name": product.name, "status": "queued"}

@app.get("/products/")
async def read_products():
    products = []
    async for product in products_collection.find():
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    return products

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
