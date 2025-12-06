# Technical Architecture - SellerBrain AI

**문서 버전**: 5.0 (Chatbot-First MVP)  
**작성일**: 2025-12-06  
**대상 독자**: 개발자

---

## 🎯 핵심 기술 목표

> **"챗봇 기반 이커머스 리스크 검사 SaaS"**

- 💬 **챗봇 UI**: 대화하듯 사용하는 인터페이스
- 🛡️ **리스크 검사**: 상표권/정책 위반 표현/저작권 사전 확인
- 🎯 **독립 기능**: 필요한 기능만 선택 사용
- 📊 **KIPRIS 데이터**: 50만+ 상표 데이터 기반

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SellerBrain AI Architecture                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  사용자                                                              │
│    │                                                                 │
│    ▼                                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  💬 챗봇 UI (Next.js + Vercel AI SDK)                          │ │
│  │                                                                 │ │
│  │  "무선 이어폰 키워드 검사해줘"                                   │ │
│  │  "이 상세페이지 문구 확인해줘"                                   │ │
│  │  "흰 배경으로 이미지 만들어줘"                                   │ │
│  └──────────────────────────┬─────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  🧠 Backend (FastAPI)                                          │ │
│  │                                                                 │ │
│  │  ├── /api/chat - 챗봇 응답                                      │ │
│  │  ├── /api/legal/keyword - 키워드 리스크 검사                    │ │
│  │  ├── /api/legal/content - 상세페이지 검사                       │ │
│  │  └── /api/image/generate - AI 이미지 생성                       │ │
│  └──────────────────────────┬─────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  📚 데이터 레이어                                               │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │ │
│  │  │ ChromaDB    │  │ Supabase    │  │ Supabase    │             │ │
│  │  │ (상표권 DB) │  │ (정책위반DB)│  │ (사용자DB)  │             │ │
│  │  │ RAG 검색    │  │             │  │ 검사 기록   │             │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  🔧 외부 서비스                                                 │ │
│  │                                                                 │ │
│  │  ├── KIPRIS Plus API - 상표 데이터 수집                         │ │
│  │  ├── OpenAI / Claude - LLM 응답                                 │ │
│  │  └── NanoBanana / DALL-E - 이미지 생성                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택

### 2.1 Core Stack

| Category | Technology | 역할 |
|----------|-----------|------|
| **Frontend** | Next.js 14 (App Router) | 웹 대시보드 |
| **UI** | Tailwind CSS, shadcn/ui | 스타일링 |
| **Chatbot UI** | Vercel AI SDK | 스트리밍 응답, 대화 UI |
| **Backend** | FastAPI (Python) | API 서버 |
| **Database** | Supabase (PostgreSQL) | 사용자, 검사 기록 |
| **Vector DB** | ChromaDB | 상표권 RAG 검색 |
| **Auth** | Supabase Auth | 사용자 인증 |
| **Hosting** | Vercel (FE), Railway (BE) | 배포 |

### 2.2 AI/ML Stack

| Category | Technology | 역할 |
|----------|-----------|------|
| **LLM** | OpenAI GPT-4o / Claude | 챗봇 응답, 문맥 분석 |
| **Embedding** | OpenAI Embeddings | 상표권 벡터화 |
| **Image Gen** | NanoBanana / DALL-E | AI 이미지 생성 |
| **Data Source** | KIPRIS Plus API | 상표 데이터 수집 |

---

## 3. 핵심 기능 아키텍처

### 3.1 키워드 리스크 검사

```
사용자 입력: "에어팟 스타일 무선 이어폰 최저가"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: 토큰화                                                  │
│  ["에어팟", "스타일", "무선", "이어폰", "최저가"]                 │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: 상표권 검사 (ChromaDB RAG)                              │
│                                                                  │
│  "에어팟" → 유사도 0.98 → ⚠️ 주의! (Apple 등록상표)              │
│           → 대체어: "무선 이어버드", "TWS"                        │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: 정책 위반 표현 검사 (Supabase)                          │
│                                                                  │
│  "최저가" → ⚠️ 주의! (마켓 정책 위반 가능)                       │
│           → 대체어: "합리적인 가격", "가성비"                    │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Output:                                                         │
│  {                                                               │
│    "status": "warning",                                          │
│    "issues": [                                                   │
│      { "word": "에어팟", "type": "trademark", "suggestion": "TWS" },
│      { "word": "최저가", "type": "policy", "suggestion": "가성비" }
│    ],                                                            │
│    "safe_version": "TWS 스타일 무선 이어폰 가성비"               │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 데이터베이스 스키마

#### 상표권 DB (ChromaDB)

```python
# Collection: trademarks
{
    "id": "tm_12345",
    "name": "에어팟",                    # 상표명
    "name_en": "AirPods",               # 영문명
    "holder": "Apple Inc.",             # 권리자
    "nice_classes": [9],                # 니스 분류
    "status": "active",                 # 상태
    "similar_terms": ["에어팟스", "airpod"],  # 유사 표현
    "embedding": [0.123, ...]           # 벡터 임베딩
}
```

#### 정책 위반 표현 DB (Supabase)

```sql
CREATE TABLE policy_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(100) NOT NULL,              -- 위반 표현
    category VARCHAR(50),                    -- 카테고리
    market VARCHAR(50) DEFAULT 'all',        -- 마켓
    severity VARCHAR(20) DEFAULT 'warning',  -- 위험도
    suggestions TEXT[],                      -- 대체어
    created_at TIMESTAMP DEFAULT NOW()
);

-- 예시 데이터
INSERT INTO policy_violations (word, category, market, severity, suggestions) VALUES
('최저가', 'pricing', 'all', 'warning', ARRAY['합리적인 가격', '가성비']),
('1위', 'ranking', 'all', 'warning', ARRAY['인기', '베스트']),
('100% 효과', 'exaggeration', 'all', 'block', ARRAY['효과적인']);
```

#### 사용자 DB (Supabase)

```sql
-- 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 검사 기록
CREATE TABLE check_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    input_text TEXT NOT NULL,
    result JSONB NOT NULL,
    check_type VARCHAR(50),  -- 'keyword', 'content', 'image'
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API 설계

### 4.1 챗봇 API

```python
# POST /api/chat
{
    "message": "무선 이어폰 키워드 검사해줘",
    "session_id": "uuid"
}

# Response (Streaming)
{
    "type": "text",
    "content": "검사 결과입니다:\n\n✅ '무선 이어폰' - 확인됨 (일반 명사)..."
}
```

### 4.2 키워드 검사 API

```python
# POST /api/legal/keyword
{
    "keywords": ["에어팟", "스타일", "무선", "이어폰"]
}

# Response
{
    "status": "warning",
    "issues": [
        {
            "word": "에어팟",
            "type": "trademark",
            "severity": "high",
            "holder": "Apple Inc.",
            "suggestions": ["TWS", "무선 이어버드"]
        }
    ],
    "safe_keywords": ["스타일", "무선", "이어폰"],
    "recommendation": "TWS 스타일 무선 이어폰"
}
```

### 4.3 상세페이지 검사 API

```python
# POST /api/legal/content
{
    "content": "최저가 노이즈캔슬링 이어폰! 100% 만족 보장!"
}

# Response
{
    "status": "warning",
    "issues": [
        { "word": "최저가", "type": "policy", "suggestions": ["합리적인 가격"] },
        { "word": "100% 만족 보장", "type": "exaggeration", "suggestions": ["높은 만족도"] }
    ],
    "safe_version": "합리적인 가격의 노이즈캔슬링 이어폰! 높은 만족도!"
}
```

---

## 5. 프로젝트 구조

```
sellerbrain/
├── src/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # 대시보드 홈
│   │   │   └── chat/
│   │   │       └── page.tsx      # AI 챗봇
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts      # 챗봇 API (Vercel AI SDK)
│   ├── components/
│   │   └── ui/                   # shadcn/ui
│   ├── features/
│   │   ├── chat/                 # 챗봇 기능
│   │   └── dashboard/            # 대시보드 기능
│   └── lib/
│       └── utils.ts
│
├── backend/                      # Backend (FastAPI)
│   ├── main.py                   # FastAPI 앱
│   ├── api/
│   │   ├── chat.py               # 챗봇 API
│   │   └── legal.py              # 리스크 검사 API
│   ├── services/
│   │   ├── trademark.py          # 상표권 검사 서비스
│   │   ├── policy.py             # 정책 위반 검사 서비스
│   │   └── llm.py                # LLM 서비스
│   ├── db/
│   │   ├── chromadb.py           # ChromaDB 연결
│   │   └── supabase.py           # Supabase 연결
│   └── requirements.txt
│
├── supabase/
│   └── migrations/               # DB 마이그레이션
│
├── vooster-docs/                 # 프로젝트 문서
│   ├── prd.md
│   └── architecture.md
│
└── docker-compose.yml
```

---

## 6. MVP 개발 계획

### Phase 1: 기반 구축 (1주)

- [x] Next.js + Supabase 설정
- [x] 랜딩 페이지
- [x] 대시보드 레이아웃
- [ ] Supabase Auth 연동

### Phase 2: 챗봇 UI (1주)

- [ ] Vercel AI SDK 연동
- [ ] 챗봇 페이지 구현
- [ ] 스트리밍 응답 UI

### Phase 3: 리스크 검사 (2주)

- [ ] FastAPI 백엔드 설정
- [ ] ChromaDB 설정 + KIPRIS 데이터 입력
- [ ] 상표권 검사 API
- [ ] 정책 위반 검사 API
- [ ] 챗봇과 검사 API 연동

### Phase 4: 테스트 & 배포 (1주)

- [ ] 테스트
- [ ] Vercel + Railway 배포
- [ ] 베타 테스트

---

## 7. 환경 변수

```env
# .env.local (Frontend)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=

# .env (Backend)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
OPENAI_API_KEY=
CHROMADB_PATH=./chroma_db
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|-----|------|----------|
| 5.0 | 2025-12-06 | MVP 중심으로 간소화, 챗봇 기반 아키텍처 |
| 4.0 | 2025-12-05 | LangGraph + MCP 추가 |
| 3.0 | 2025-11-23 | 법적 안전성 시스템 추가 |
