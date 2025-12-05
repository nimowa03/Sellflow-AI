from celery import Celery
import os
import time
import json
import redis

# Celery Configuration
celery_app = Celery(
    "worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
)

# Redis Client for Pub/Sub (FastAPI WebSocket 통신용)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# (Legacy Task Removed)

@celery_app.task(name="worker.run_sourcing_task")
def run_sourcing_task(query: str):
    """
    Executes the product sourcing logic in background
    """
    
    # Helper to publish updates
    def publish_update(message):
        print(f"[소싱 에이전트] {message}")
        redis_client.publish("sourcing_updates", message)

    publish_update(f"소싱 작업 시작: {query}")
    time.sleep(1)
    
    publish_update(f"소싱 작업 시작: {query}")
    time.sleep(1)
    
    # CrewAI Execution
    try:
        from crew import create_sourcing_crew
        publish_update("CrewAI 에이전트 팀 구성 중...")
        
        # Note: In a real scenario, we would pass a callback to capture CrewAI's verbose output
        # and stream it via publish_update. For now, we just run it.
        result = create_sourcing_crew(query, callback_function=publish_update)
        result_str = str(result)
        
        publish_update("CrewAI 분석 완료! 결과 처리 중...")
        
        # Try to parse JSON from the result
        import re
        result_data = {}
        try:
            # Find JSON-like structure (starts with { and ends with })
            match = re.search(r'\{.*\}', result_str, re.DOTALL)
            if match:
                json_str = match.group(0)
                result_data = json.loads(json_str)
            else:
                 # If no JSON found, just wrap the string
                result_data = {"raw_output": result_str}
        except Exception as parse_error:
            print(f"JSON Parsing Error: {parse_error}")
            result_data = {"raw_output": result_str, "parse_error": str(parse_error)}

        # Publish final result for Frontend
        redis_client.publish("sourcing_updates", json.dumps({
            "type": "result",
            "data": result_data
        }, ensure_ascii=False))
        
        # Save to MongoDB (Sync)
        from pymongo import MongoClient
        mongo_client = MongoClient("mongodb://localhost:27017")
        db = mongo_client.ai_marketing
        db.sourcing_results.insert_one({
            "query": query,
            "result": result_data,
            "timestamp": time.time(),
            "status": "completed"
        })
        
        return {"query": query, "result": result_data, "status": "completed"}
        
    except Exception as e:
        error_msg = f"에러 발생: {str(e)}"
        publish_update(error_msg)
        return {"status": "failed", "error": str(e)}
