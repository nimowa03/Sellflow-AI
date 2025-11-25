# 🔧 AI 모델 업데이트 가이드

이 문서는 SellFlow-AI 프로젝트에서 사용하는 AI 모델을 최신 버전으로 업데이트하는 방법을 안내합니다.

---

## 📍 모델 변경 위치

### **방법 1: `.env` 파일 수정 (권장)**

프로젝트 루트의 `.env` 파일에서 모델명을 변경하세요.

```bash
# backend/.env

# Gemini 모델 (텍스트 분석)
GEMINI_MODEL=gemini-1.5-pro

# Gemini Vision 모델 (이미지 분석)
GEMINI_VISION_MODEL=gemini-1.5-flash

# Imagen 모델 (이미지 생성)
IMAGEN_MODEL=imagen-3.0-generate-001

# Claude 모델 (콘텐츠 생성)
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

**변경 후 재시작:**
```bash
docker-compose restart backend
```

---

### **방법 2: `config.py` 직접 수정**

`.env` 파일이 없거나 직접 수정하고 싶다면, `/backend/config.py` 파일의 기본값을 변경하세요.

**파일 위치:** `backend/config.py`

```python
# Line 20-25
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-1.5-pro"  # ← 여기를 최신 모델명으로 변경
)

# Line 28-32
GEMINI_VISION_MODEL = os.getenv(
    "GEMINI_VISION_MODEL",
    "gemini-1.5-flash"  # ← 여기를 최신 모델명으로 변경
)

# Line 35-39
IMAGEN_MODEL = os.getenv(
    "IMAGEN_MODEL",
    "imagen-3.0-generate-001"  # ← 여기를 최신 모델명으로 변경
)

# Line 48-52
CLAUDE_MODEL = os.getenv(
    "CLAUDE_MODEL",
    "claude-3-5-sonnet-20241022"  # ← 여기를 최신 모델명으로 변경
)
```

---

## 🔍 최신 모델명 확인 방법

### **1. Google AI (Gemini + Imagen)**

**Google AI Studio**: https://aistudio.google.com/

1. 로그인 후 상단 메뉴에서 **"Models"** 클릭
2. 사용 가능한 최신 모델 목록 확인
3. 모델명 복사 (예: `gemini-2.0-flash-exp`)

**주요 모델:**
- **Gemini 1.5 Pro**: `gemini-1.5-pro` (안정 버전, 추론 강력)
- **Gemini 1.5 Flash**: `gemini-1.5-flash` (빠른 버전, Vision 작업)
- **Gemini 2.0 Flash**: `gemini-2.0-flash-exp` (실험 버전, 최신 기능)
- **Imagen 3**: `imagen-3.0-generate-001` (이미지 생성)

---

### **2. Anthropic (Claude)**

**Anthropic Console**: https://console.anthropic.com/

1. 로그인 후 **"Settings"** → **"Models"** 탭
2. 사용 가능한 모델 목록 확인
3. 모델명 복사 (예: `claude-3-5-sonnet-20241022`)

**주요 모델:**
- **Claude 3.5 Sonnet**: `claude-3-5-sonnet-20241022` (균형 잡힌 성능)
- **Claude 3 Opus**: `claude-3-opus-20240229` (최고 성능, 비용 높음)
- **Claude 3 Haiku**: `claude-3-haiku-20240307` (빠르고 저렴)

---

## 📝 모델 변경 예시

### **예시 1: Gemini 2.0 Flash로 업그레이드**

**`.env` 파일:**
```bash
# 기존
GEMINI_MODEL=gemini-1.5-pro

# 변경
GEMINI_MODEL=gemini-2.0-flash-exp
```

**변경 후:**
```bash
docker-compose restart backend
```

---

### **예시 2: Claude 최신 버전으로 업데이트**

**`.env` 파일:**
```bash
# 기존
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# 변경 (가상의 최신 버전)
CLAUDE_MODEL=claude-3-5-sonnet-20250115
```

**변경 후:**
```bash
docker-compose restart backend
```

---

## ⚠️ 주의사항

### **1. API 키 권한 확인**

모델을 변경하기 전에, 해당 모델에 대한 API 접근 권한이 있는지 확인하세요.

- **Google AI Studio**: API 키 설정 → 허용 모델 확인
- **Anthropic Console**: Billing → 사용 가능 모델 확인

---

### **2. 비용 확인**

최신 모델은 기존 모델보다 비용이 높을 수 있습니다.

**비용 확인 링크:**
- Gemini: https://ai.google.dev/pricing
- Claude: https://www.anthropic.com/pricing

---

### **3. 실험 버전 주의**

`-exp` 또는 `experimental`이 붙은 모델은 불안정할 수 있습니다.

- **프로덕션**: 안정 버전 사용 권장 (`gemini-1.5-pro`)
- **테스트/개발**: 실험 버전 사용 가능 (`gemini-2.0-flash-exp`)

---

## 🧪 모델 변경 후 테스트

모델을 변경한 후, 다음 명령어로 정상 작동하는지 확인하세요:

### **1. Config 확인**

```bash
cd backend
python config.py
```

**출력 예시:**
```
==================================================
🤖 현재 AI 모델 설정
==================================================
📝 Gemini (분석):     gemini-2.0-flash-exp
👁️  Gemini Vision:    gemini-1.5-flash
🎨 Imagen (이미지):   imagen-3.0-generate-001
✍️  Claude (콘텐츠):   claude-3-5-sonnet-20241022
==================================================
```

---

### **2. 개별 Tool 테스트**

```bash
# Imagen Tool 테스트
python tools/imagen_tool.py

# Claude Tool 테스트
python tools/claude_tool.py

# Vision Tool 테스트
python tools/vision_tool.py
```

---

### **3. Agent 테스트**

```bash
# Agent 2 (경쟁사 분석) 테스트
python agents/competitor_analyzer.py

# Agent 3 (콘텐츠 생성) 테스트
python agents/content_creator.py
```

---

## 📂 파일 구조 요약

```
backend/
├── config.py                      # 🔧 모델 설정 (기본값)
├── .env                           # 🔧 모델 설정 (환경변수)
├── .env.example                   # 📖 환경변수 예시
├── AI_MODEL_UPDATE_GUIDE.md       # 📖 이 문서
│
├── tools/
│   ├── imagen_tool.py             # Imagen 3 사용
│   ├── claude_tool.py             # Claude 사용
│   ├── vision_tool.py             # Gemini Vision 사용
│   └── apify_tool.py
│
└── agents/
    ├── competitor_analyzer.py     # Gemini 사용
    └── content_creator.py         # Gemini 사용
```

---

## 🚀 빠른 시작

### **최신 모델로 업그레이드 (3단계)**

```bash
# 1. .env 파일 수정 (모델명 변경)
nano backend/.env

# 2. 백엔드 재시작
docker-compose restart backend

# 3. 모델 설정 확인
cd backend && python config.py
```

---

## 📞 문제 해결

### **문제 1: 모델명이 인식되지 않음**

**증상:**
```
Error: Model 'gemini-2.0-flash-exp' not found
```

**해결:**
1. Google AI Studio에서 모델명이 정확한지 확인
2. API 키에 해당 모델 접근 권한이 있는지 확인
3. 오타 확인 (대소문자 구분)

---

### **문제 2: API 키 오류**

**증상:**
```
⚠️  경고: 다음 API 키가 .env에 없습니다: GEMINI_API_KEY
```

**해결:**
1. `.env` 파일에 API 키가 올바르게 설정되어 있는지 확인
2. API 키 앞뒤 공백 제거
3. `docker-compose restart backend`로 재시작

---

### **문제 3: 비용 초과**

**증상:**
```
Error: Quota exceeded
```

**해결:**
1. Google/Anthropic Console에서 사용량 확인
2. 더 저렴한 모델로 변경 (`gemini-1.5-flash`, `claude-haiku`)
3. Rate Limiting 설정 추가

---

## 📌 권장 모델 조합 (2025년 기준)

### **프로덕션 환경 (안정성 우선)**

```bash
GEMINI_MODEL=gemini-1.5-pro
GEMINI_VISION_MODEL=gemini-1.5-flash
IMAGEN_MODEL=imagen-3.0-generate-001
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### **개발 환경 (최신 기능 테스트)**

```bash
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_VISION_MODEL=gemini-1.5-flash
IMAGEN_MODEL=imagen-3.0-generate-001
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### **비용 절감 환경**

```bash
GEMINI_MODEL=gemini-1.5-flash
GEMINI_VISION_MODEL=gemini-1.5-flash
IMAGEN_MODEL=imagen-3.0-generate-001
CLAUDE_MODEL=claude-3-haiku-20240307
```

---

## ✅ 체크리스트

모델 업데이트 전 확인하세요:

- [ ] Google AI Studio / Anthropic Console에서 최신 모델명 확인
- [ ] API 키에 해당 모델 접근 권한 확인
- [ ] 비용 확인 (신규 모델은 더 비쌀 수 있음)
- [ ] `.env` 파일 또는 `config.py` 수정
- [ ] 백엔드 재시작 (`docker-compose restart backend`)
- [ ] `python config.py`로 모델 설정 확인
- [ ] 개별 Tool 테스트 실행
- [ ] Agent 테스트 실행

---

**작성일:** 2025-11-24
**작성자:** SellFlow-AI Team
**최종 수정:** 2025-11-24
