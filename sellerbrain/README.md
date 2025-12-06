# SellerBrain AI

> **"업로드 전에 한번 확인해보세요. 문제될 키워드, 미리 알려드려요."**

이커머스 셀러를 위한 **리스크 검사 AI SaaS**입니다. 상품 등록 전, 상표권/정책 위반 표현/저작권 리스크를 챗봇과 대화하듯 간편하게 확인할 수 있습니다.

---

## ✨ 핵심 기능

| 기능 | 설명 |
|------|------|
| 🔍 **키워드 리스크 검사** | KIPRIS 50만+ 상표 데이터 기반 상표권 확인 |
| 📝 **상세페이지 검사** | 정책 위반 표현, 과장광고 확인 |
| 🖼️ **AI 이미지 생성** | 저작권 클리어 이미지 생성 |
| 💬 **챗봇 UI** | 대화하듯 편하게 사용 |

---

## 📂 프로젝트 구조

```
sellerbrain/
├── src/                      # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx          # 랜딩 페이지
│   │   └── dashboard/        # 대시보드
│   ├── components/           # UI 컴포넌트
│   └── features/             # 기능별 모듈
│
├── backend/                  # Backend (FastAPI)
│   ├── main.py               # API 서버
│   ├── agents/               # AI 에이전트
│   ├── tools/                # AI 도구
│   └── utils/                # 유틸리티
│
├── vooster-docs/             # 프로젝트 문서
│   ├── prd.md                # 제품 요구사항
│   └── architecture.md       # 기술 아키텍처
│
├── supabase/                 # DB 마이그레이션
│   └── migrations/
│
└── infrastructure/           # Docker 설정
    └── docker-compose.yml
```

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Vercel AI SDK** (챗봇)

### Backend
- **FastAPI** (Python)
- **ChromaDB** (RAG / 상표권 검색)
- **Supabase** (PostgreSQL)

### AI/ML
- **OpenAI GPT-4o / Claude** (LLM)
- **OpenAI Embeddings** (벡터화)
- **KIPRIS Plus API** (상표 데이터)

---

## 🚀 실행 방법

### 1. 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 필요한 API 키 입력
```

### 2. 프론트엔드 실행

```bash
npm install
npm run dev
```

- **웹**: http://localhost:3000

### 3. 백엔드 실행

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- **API 문서**: http://localhost:8000/docs

---

## 📚 문서

| 문서 | 설명 |
|------|------|
| [PRD](./vooster-docs/prd.md) | 제품 요구사항 |
| [Architecture](./vooster-docs/architecture.md) | 기술 아키텍처 |
| [Guideline](./vooster-docs/guideline.md) | 코드 가이드라인 |

---

## ⚠️ 면책 조항

본 서비스의 검사 결과는 **참고용**이며 법적 효력이 없습니다.  
정확한 상표권/저작권 확인은 [KIPRIS](https://kipris.or.kr), 변리사, 또는 법률 전문가 상담을 권장합니다.

---

## 📄 라이선스

MIT License
