# SellFlow-AI (AI Product Automation)

> **AI 에이전트가 경쟁사 분석부터 상품 등록, 이미지/상세페이지 생성, 자동 업로드까지 처리하는 n8n 기반 자동화 워크플로우.**

이 프로젝트는 Python(FastAPI)의 강력한 AI 처리 능력과 n8n의 유연한 워크플로우 자동화를 결합한 하이브리드 시스템입니다.

## 📂 프로젝트 구조

*   **`docs/`**: 프로젝트 핵심 문서
    *   [PRD.md](docs/PRD.md): 제품 요구사항 정의서 (WHY & WHAT)
    *   [tech_specs.md](docs/tech_specs.md): 기술 사양서 (HOW & Architecture)
    *   [mockups.md](docs/mockups.md): UI/UX 목업 및 플로우
*   **`backend/`**: FastAPI 서버 및 CrewAI 에이전트
*   **`frontend/`**: Next.js 웹 대시보드
*   **`infrastructure/`**: Docker Compose 설정 (Mongo, Chroma, n8n, Redis)

### `backend/` (API 서버 및 AI 워커)
Python FastAPI와 Celery를 사용하여 구축된 백엔드입니다.

- **`main.py`**: API 서버의 진입점입니다.
    - 프론트엔드와 통신하는 REST API (`/sourcing/` 등)를 제공합니다.
    - WebSocket (`/ws`)을 통해 AI 에이전트의 작업 상황을 실시간으로 중계합니다.
    - **MongoDB** 데이터베이스와 비동기(`Motor`)로 연결됩니다.
- **`worker.py`**: 백그라운드 작업을 처리하는 Celery 워커입니다.
    - `run_sourcing_task`: 상품 소싱 요청을 받아 `crew.py`를 실행하고, 진행 상황을 Redis로 발행(Publish)합니다.
    - 작업 결과는 **MongoDB**에 저장됩니다.
- **`crew.py`**: CrewAI 기반의 AI 에이전트 정의 파일입니다.
    - `Senior Product Researcher` 에이전트와 그가 수행할 Task가 정의되어 있습니다.
    - 실제 LLM(Gemini 1.5 Pro)을 호출하여 지능적인 작업을 수행합니다.

### 2. `frontend/` (웹 대시보드)
Next.js 14 (React)로 구축된 사용자 인터페이스입니다.

- **`app/page.tsx`**: 메인 페이지입니다.
    - 상품 키워드 입력 폼과 실시간 로그 뷰어가 있습니다.
    - WebSocket을 통해 백엔드와 연결되어 에이전트의 활동을 실시간으로 보여줍니다.

### 3. `infrastructure/` (인프라)
Docker를 이용한 서비스 환경 설정입니다.

- **`docker-compose.yml`**:
    - **MongoDB**: 유연한 JSON 데이터 저장을 위한 메인 데이터베이스.
    - **Redis**: 메시지 큐 및 실시간 통신 브로커.
    - **n8n**: 후속 업무 자동화(알림, 이메일 등)를 위한 워크플로우 엔진.

### 4. 루트 디렉토리
- **`dev.sh`**: 전체 시스템(Docker, Backend, Worker, Frontend)을 한 번에 실행하는 스크립트입니다.
- **`PRD.md`**: 제품 요구사항 정의서입니다.
- **`TASKS.md`**: 개발 작업 목록입니다.

## 🚀 실행 방법

터미널에서 다음 명령어를 실행하면 모든 서비스가 시작됩니다.

```bash
./dev.sh
```

- **웹 대시보드**: http://localhost:3000
- **API 문서**: http://localhost:8000/docs
- **n8n 자동화**: http://localhost:5678 (ID: admin / PW: password)
