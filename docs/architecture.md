# AI 상품 등록 자동화 시스템 - 기술 아키텍처

**문서 버전**: 2.0
**작성일**: 2025-11-21
**대상 독자**: 개발자, 시스템 운영자

---

## 목차
1. [시스템 개요](#1-시스템-개요)
2. [아키텍처 다이어그램](#2-아키텍처-다이어그램)
3. [기술 스택 상세](#3-기술-스택-상세)
4. [데이터 흐름](#4-데이터-흐름)
5. [배포 아키텍처](#5-배포-아키텍처)
6. [보안 아키텍처](#6-보안-아키텍처)
7. [확장성 및 성능](#7-확장성-및-성능)
8. [모니터링 및 로깅](#8-모니터링-및-로깅)
9. [비용 구조](#9-비용-구조)
10. [장애 복구 계획](#10-장애-복구-계획)

---

## 1. 시스템 개요

### 1.1 아키텍처 원칙
- **마이크로서비스 지향**: 각 기능(소싱, 분석, 생성)을 독립적인 워크플로우로 분리
- **API 우선**: 모든 외부 서비스는 API를 통해 연동
- **이벤트 드리븐**: Webhook, Cron 등 이벤트 기반 자동화
- **Human-in-the-Loop**: 중요한 의사결정은 사람이 개입
- **비용 효율성**: 오픈소스 및 무료/저가 서비스 우선 활용

### 1.2 핵심 컴포넌트
| 컴포넌트 | 역할 | 기술 |
|----------|------|------|
| **에이전트 오케스트레이션** | 5개 AI 에이전트 협업 관리 | CrewAI |
| **워크플로우 엔진** | 자동화 실행 및 스케줄링 | n8n (셀프호스팅) |
| **데이터 수집기** | 웹 크롤링/스크래핑 | Apify |
| **AI 엔진** | 페이지 분석, 이미지 인식 및 생성 | Gemini 2.0 Flash |
| **AI 콘텐츠 생성기** | 제목/상세페이지 HTML 생성 | Claude 3.5 Sonnet |
| **HITL 피드백 시스템** | 사용자 검수 및 자연어 피드백 | Notion (챗봇 UI) |
| **데이터 저장소** | 구조화 데이터 관리 | Google Sheets, Notion |
| **업로드 자동화** | 쿠팡/네이버 자동 등록 | 쿠팡/네이버 API |
| **클라우드 인프라** | 서버 호스팅 | GCP (Compute Engine) |

---

## 2. 아키텍처 다이어그램

### 2.1 전체 시스템 아키텍처 (CrewAI 기반 5-Agent 협업)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              사용자 레이어 (HITL)                           │
│  ┌──────────────────────┐     ┌──────────────────────┐                    │
│  │  Notion 챗봇 UI      │ ◄──►│   쿠팡/네이버         │                    │
│  │  (피드백 루프)       │     │   (자동 업로드)       │                    │
│  │  "제목 짧게 해줘"    │     │                       │                    │
│  └──────────┬───────────┘     └───────────▲───────────┘                    │
│             │                             │                                │
│             └─────────────┐       ┌───────┘                                │
│                           │       │                                        │
└───────────────────────────┼───────┼────────────────────────────────────────┘
                            │       │
                            ▼       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    CrewAI 에이전트 오케스트레이션 레이어                    │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                   Agent 5: 오케스트레이션 관리자                     │  │
│  │                  (전체 프로세스 조율 및 우선순위 관리)                │  │
│  └────────────────┬───────────────────┬───────────────────┬──────────────┘  │
│                   │                   │                   │                │
│  ┌────────────────▼──────┐  ┌────────▼────────┐  ┌───────▼──────────┐    │
│  │  Agent 1:             │  │  Agent 2:        │  │  Agent 3:        │    │
│  │  상품 소싱            │  │  경쟁사 페이지   │  │  상품 페이지     │    │
│  │                       │  │  분석            │  │  생성            │    │
│  │  황금키워드 발굴     │→│                   │→│                   │    │
│  └───────────────────────┘  │  제목/이미지/    │  │  제목 3종        │    │
│                              │  상세페이지      │  │  + 이미지 2종    │    │
│                              │  인사이트 도출   │  │  + 상세HTML      │    │
│                              └──────────────────┘  └─────────┬────────┘    │
│                                                               │             │
│                         ┌─────────────────────────────────────┘             │
│                         │                                                   │
│                         ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Agent 4: 업로드 및 피드백 검수                                       │  │
│  │                                                                        │  │
│  │  1. Notion에 초안 전송 ──┐                                            │  │
│  │  2. 사용자 검수 ◄────────┘                                            │  │
│  │  3. 피드백 수신 ("제목 짧게", "이미지 밝게")                          │  │
│  │  4. Agent 3에 재생성 요청 ──┐                                         │  │
│  │  5. 재검수 ◄────────────────┘                                         │  │
│  │  6. 승인 시 → 쿠팡/네이버 자동 업로드                                 │  │
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        n8n 워크플로우 엔진                           │  │
│  │  (Cron Trigger, Webhook, Error Handler, Agent 실행 스케줄링)        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────┬──────────────┬──────────────┬──────────────┬─────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           외부 서비스 레이어                                │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Apify   │  │     Gemini       │  │  Claude  │  │  Google  │          │
│  │ (크롤링) │  │ (페이지 분석 +   │  │ (제목/   │  │  Sheets/ │          │
│  │          │  │  이미지 생성)    │  │  HTML)   │  │  Notion  │          │
│  └────┬─────┘  └────┬─────────────┘  └────┬─────┘  └────┬─────┘          │
│       │             │                     │             │                 │
│  쿠팡/네이버   경쟁사 페이지 분석      상세페이지       구조화             │
│  인기상품       + 이미지 생성         HTML 생성        저장               │
└────────────────────────────────────────────────────────────────────────────┘
```

**핵심 특징**:
- ✅ **5개 자율 에이전트**: 각 에이전트가 독립적으로 의사결정
- ✅ **HITL 피드백 루프**: Agent 4가 사용자 피드백을 받아 Agent 3에 재생성 요청
- ✅ **오케스트레이션**: Agent 5가 전체 프로세스 조율 및 병목 해소
- ✅ **자동 업로드**: 승인 시 쿠팡/네이버에 자동 등록

### 2.2 데이터 흐름 다이어그램 (HITL 피드백 루프 포함)

```
[Agent 1: 상품 소싱]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
쿠팡/네이버    →   Apify 크롤링   →   황금키워드 발굴   →   Google Sheets
웹페이지           (HTML → JSON)      (트렌드 분석)        (상품 DB 저장)
                                                           ↓
[Agent 2: 경쟁사 페이지 분석]                               |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
베스트셀러     →   Apify 크롤링   →   Gemini 페이지   →   Notion DB
상품 URL           (전체 페이지)      분석 (제목/      (인사이트 저장)
                                      이미지/HTML)            ↓
                                                              |
[Agent 3: 상품 페이지 생성]                                   |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상품정보 +     →   Claude API     →   Gemini 이미지  →   완성된 페이지
경쟁사 인사이트     (제목/HTML)        생성              (제목+이미지+HTML)
                                                              ↓
[Agent 4: 업로드 및 피드백 검수]                              |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Notion에       →   사용자 검수    →   피드백 처리     →   재생성 요청
초안 전송          (챗봇 UI)          ("제목 짧게")        (Agent 3)
     ↓                                                       ↓
     ◄───────────────────────────────────────────────────────┘
                       (피드백 루프 반복)
     ↓
     승인 시
     ↓
쿠팡/네이버 자동 업로드 (쿠팡/네이버 API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ↓
✅ 상품 등록 완료 (알림: Slack)
```

**핵심 플로우**:
1. **Agent 1** → 황금키워드 발굴 → Google Sheets 저장
2. **Agent 2** → 경쟁사 페이지 전체 분석 → Notion 인사이트 저장
3. **Agent 3** → 제목+이미지+HTML 생성 → Agent 4로 전달
4. **Agent 4** → Notion 챗봇에 초안 전송 → 사용자 검수
5. **피드백 루프**: 수정 요청 시 Agent 3 재생성 → 재검수
6. **승인 시**: 쿠팡/네이버 자동 업로드 → 완료

---

## 3. 기술 스택 상세

### 3.1 워크플로우 자동화: n8n

#### 선택 이유
- **오픈소스**: 무료, 커스터마이징 가능
- **노코드/로우코드**: 시각적 워크플로우 디자인
- **풍부한 통합**: 400+ 서비스 기본 연동
- **셀프호스팅**: 데이터 통제권, 비용 절감

#### 배포 방식 비교

| 항목 | 셀프호스팅 (GCP) | n8n Cloud |
|------|------------------|-----------|
| **비용** | $10-20/월 (VM 비용만) | $20-50/월 (플랜에 따라) |
| **통제권** | 완전 통제 | 제한적 |
| **유지보수** | 직접 관리 필요 | 자동 관리 |
| **확장성** | 자유롭게 스케일업 | 플랜별 제한 |
| **보안** | 직접 책임 | n8n 관리 |
| **추천** | ✅ 코딩 가능, 비용 절감 우선 | 비기술자, 빠른 시작 |

#### 선택: 셀프호스팅
- 이유: 사용자가 코딩 가능, GCP 크레딧 활용, 장기 비용 절감

#### 기술 세부사항
- **설치 방법**: npm global install
- **프로세스 관리**: PM2 (자동 재시작, 로그 관리)
- **데이터베이스**: SQLite (기본) 또는 PostgreSQL (확장 시)
- **인증**: Basic Auth 또는 OAuth 2.0
- **HTTPS**: Nginx 리버스 프록시 + Let's Encrypt

---

### 3.2 데이터 수집: Apify

#### 선택 이유
- **전문 크롤러**: 플랫폼별 최적화된 Actor 제공
- **안정성**: robots.txt 준수, Rate Limit 자동 처리
- **클라우드 실행**: 로컬 리소스 소모 없음
- **API 연동**: n8n과 쉽게 통합

#### 사용 Actor

| Actor | 용도 | 예상 비용 |
|-------|------|-----------|
| **Coupang Product Scraper** | 쿠팡 베스트셀러 수집 | $2-5/월 |
| **Naver Shopping Scraper** | 네이버 쇼핑 인기 상품 | $2-5/월 |
| **Facebook Ads Library Scraper** | 경쟁사 광고 수집 | $5-10/월 |
| **Instagram Profile Scraper** | Instagram 광고 (옵션) | $5-10/월 |

#### 플랜 선택
- **초기**: 무료 플랜 (월 $5 크레딧)
- **확장**: Starter 플랜 ($49/월, $50 크레딧 포함)

#### 최적화 전략
- 크롤링 빈도 조절 (일 1회 → 주 3회 등)
- 필요한 데이터만 수집 (불필요한 필드 제외)
- 캐싱 활용 (중복 요청 방지)

---

### 3.3 AI/LLM: Gemini + Claude

#### 3.3.1 Gemini 2.0 Flash (분석용)

**선택 이유**:
- **멀티모달**: 텍스트 + 이미지 동시 분석 가능
- **비용 효율**: $0.075/1M tokens (GPT-4의 1/10)
- **한국어 성능**: GPT-3.5 수준 (분석에는 충분)
- **빠른 응답**: Flash 모델은 지연 시간 짧음

**사용 사례**:
- 경쟁사 광고 카피 분석
- 광고 이미지 디자인 패턴 분석
- 키워드 추출 및 감정 톤 분석

**API 호출 예시**:
```bash
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

{
  "contents": [{
    "parts": [
      {"text": "다음 광고를 분석해주세요: ..."},
      {"inline_data": {"mime_type": "image/jpeg", "data": "base64..."}}
    ]
  }]
}
```

**월 예상 비용**: $10-30
- 주간 100개 광고 분석
- 평균 1,000 tokens/광고
- $0.075 × 400,000 tokens = $30

---

#### 3.3.2 Claude 3.5 Sonnet (카피 생성용)

**선택 이유**:
- **최고 수준 한국어**: 자연스러운 문장, 문화적 뉘앙스 이해
- **창의성**: GPT-4보다 카피 품질 우수 (사용자 평가 기준)
- **긴 컨텍스트**: 200K tokens (상품 정보 + 경쟁사 인사이트 동시 처리)
- **안전성**: 유해 콘텐츠 생성 낮음

**사용 사례**:
- 상세페이지 텍스트 작성
- Facebook/Instagram 광고 카피 작성
- FAQ 생성

**API 호출 예시**:
```bash
POST https://api.anthropic.com/v1/messages

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2000,
  "messages": [{
    "role": "user",
    "content": "당신은 전자상거래 전문 카피라이터입니다. ..."
  }]
}
```

**월 예상 비용**: $20-50
- 월 50개 상품 카피 생성
- 평균 2,000 tokens/상품 (입력 1,000 + 출력 1,000)
- $3/1M input tokens × 50K = $1.5
- $15/1M output tokens × 50K = $7.5
- 총 약 $10 (안전 마진 포함 $20-50)

---

#### 3.3.3 AI 모델 선택 매트릭스

| 작업 | 모델 | 이유 |
|------|------|------|
| 광고 카피 분석 | Gemini Flash | 비용 효율, 멀티모달 |
| 이미지 디자인 분석 | Gemini Flash | Vision 기능 |
| 상세페이지 작성 | Claude Sonnet | 한국어 품질 |
| 광고 카피 작성 | Claude Sonnet | 창의성, 자연스러움 |
| 키워드 추출 | Gemini Flash | 빠른 처리 |
| FAQ 생성 | Claude Sonnet | 맥락 이해 |

---

### 3.4 데이터 저장소

#### 3.4.1 Google Sheets

**용도**: 상품 소싱 데이터 DB

**장점**:
- 무료 (15GB까지)
- n8n 기본 통합
- 필터링/정렬 쉬움
- 수식으로 간단한 분석 가능

**스키마**:
```
Sheet: "Products"
┌──────────┬─────────┬─────────┬────────┬────────┬────────┬───────────┐
│ 날짜     │ 플랫폼  │ 상품명  │ 가격   │ 리뷰수 │ 평점   │ 트렌드점수│
├──────────┼─────────┼─────────┼────────┼────────┼────────┼───────────┤
│ 2024-... │ 쿠팡    │ ...     │ 39,900 │ 1,234  │ 4.5    │ 2,500     │
└──────────┴─────────┴─────────┴────────┴────────┴────────┴───────────┘
```

**제약사항**:
- 행 제한: 1,000만 셀 (충분)
- API Quota: 100 requests/100초/프로젝트 (배치 처리로 해결)

---

#### 3.4.2 Notion

**용도**: 광고 분석 결과, 카피 초안, HITL 워크스페이스

**장점**:
- 시각적으로 보기 좋음
- 데이터베이스 + 협업 도구
- 검토/승인 워크플로우 구현 쉬움
- 모바일 앱 지원

**데이터베이스 구조**:

**1) Ad Analysis DB**
```
Properties:
- 광고 이미지 (Files)
- 카피 원문 (Text)
- 타겟 (Multi-select: 20대 여성, 30대 남성 등)
- 소구점 (Multi-select: 편의성, 가성비, 품질 등)
- 키워드 (Multi-select)
- 감정 톤 (Select: 긴급성, 희소성, 신뢰성)
- 좋아요 수 (Number)
- 분석 날짜 (Date)
```

**2) Copy Drafts DB**
```
Properties:
- 상품명 (Title)
- 후킹 타이틀 (Text)
- 주요 특징 (Text)
- 상세 설명 (Text)
- FAQ (Text)
- 상태 (Select: 검수 중, 수정 필요, 승인)
- 생성 날짜 (Date)
- 승인 날짜 (Date)
```

**API 제약사항**:
- Rate Limit: 3 requests/초
- 페이지 크기: 최대 100개/요청 (페이지네이션 필요)

---

### 3.5 클라우드 인프라: GCP

#### 3.5.1 Compute Engine (n8n 호스팅)

**인스턴스 스펙**:
```
이름: n8n-server
리전: asia-northeast3 (서울)
존: asia-northeast3-a
머신 유형: e2-micro
  - vCPU: 0.25-1 (버스트)
  - 메모리: 1GB
  - 디스크: 10GB (Ubuntu 22.04 LTS)
네트워크: VPC 기본, 외부 IP (고정)
방화벽: HTTP (80), HTTPS (443), Custom (5678)
```

**비용**: $7-10/월 (무료 티어 활용 시 $0)

**성능 고려**:
- e2-micro는 가벼운 워크로드에 적합
- n8n만 실행하므로 충분
- 확장 시 e2-small ($15/월) 또는 e2-medium ($30/월)로 업그레이드

---

#### 3.5.2 Cloud Storage

**용도**: 크롤링 데이터 임시 저장, 백업

**버킷 설정**:
```
이름: ai-marketing-data
위치: asia-northeast3
스토리지 클래스: Standard
공개 액세스: 차단
수명 주기: 30일 후 자동 삭제
```

**비용**: $0.023/GB/월 (예상 사용량 1GB = $0.02/월)

---

#### 3.5.3 IAM 및 보안

**서비스 계정**:
```
이름: n8n-service-account@PROJECT_ID.iam.gserviceaccount.com
역할:
  - Storage Object Admin (버킷 읽기/쓰기)
  - Compute Instance Admin (v2) (VM 관리)
```

**API 키 저장**:
- GCP Secret Manager (옵션, 추가 비용 $0.06/비밀/월)
- 또는 VM 내 `.env` 파일 (권한 600으로 제한)

---

## 4. 데이터 흐름

### 4.1 상품 소싱 파이프라인

```
1. [Trigger] Cron (매일 09:00 KST)
   ↓
2. [Apify] 쿠팡 베스트셀러 크롤링
   - Input: {"category": "electronics", "maxItems": 50}
   - Output: [{productName, price, reviewCount, rating, url}, ...]
   ↓
3. [Apify] 네이버 쇼핑 인기 상품 크롤링
   - 병렬 실행
   ↓
4. [n8n Merge] 두 데이터 소스 결합
   ↓
5. [n8n Function] 필터링
   - 조건: reviewCount >= 100 && rating >= 4.0
   ↓
6. [n8n Function] 트렌드 점수 계산
   - 공식: reviewCount * 0.7 + rating * 100 * 0.3
   ↓
7. [Google Sheets] 데이터 적재
   - Sheet: "Products"
   - Operation: Append
   ↓
8. [Slack] 완료 알림
   - 메시지: "✅ 상품 소싱 완료! 수집: 100개, 필터링 후: 45개"
```

**데이터 샘플**:
```json
{
  "collectedAt": "2024-01-15T09:00:00Z",
  "platform": "쿠팡",
  "productName": "삼성 갤럭시 버즈2 프로",
  "price": 189000,
  "reviewCount": 2345,
  "rating": 4.6,
  "url": "https://coupang.com/...",
  "trendScore": 2021
}
```

---

### 4.2 광고 분석 파이프라인

```
1. [Trigger] Cron (매주 월요일 10:00 KST)
   ↓
2. [Google Sheets] 키워드 목록 읽기
   - Sheet: "Ad Keywords"
   - Output: ["스킨케어", "무선이어폰", "홈트레이닝"]
   ↓
3. [n8n Loop] 각 키워드별 반복
   ↓
4. [Apify] Facebook Ads Library 크롤링
   - Input: {"searchTerm": "{{keyword}}", "country": "KR", "maxAds": 20}
   - Output: [{adCopy, imageUrl, likes, activedays}, ...]
   ↓
5. [n8n Function] 필터링
   - 조건: likes >= 1000 && activeDays >= 30
   ↓
6. [Gemini API] 광고 분석
   - Prompt: "다음 광고를 분석해주세요: ... (타겟, 소구점, 키워드, 감정 톤)"
   - Output: {"target": "20대 여성", "painPoint": "피부 트러블", ...}
   ↓
7. [n8n Function] JSON 파싱 및 검증
   ↓
8. [Notion] 분석 결과 저장
   - Database: "Ad Analysis DB"
   ↓
9. [Slack] 완료 알림
```

**Gemini 프롬프트**:
```
다음 Facebook 광고를 분석해주세요:

광고 카피:
"{{adCopy}}"

이미지 URL:
{{imageUrl}}

분석 항목:
1. 타겟 (연령, 성별, 관심사 추정)
2. 소구점 (어떤 문제를 해결한다고 주장하는가?)
3. 핵심 키워드 5개
4. 감정 톤 (긴급성/희소성/신뢰성 중 하나)

JSON 형식으로 답변해주세요:
{
  "target": "...",
  "painPoint": "...",
  "keywords": ["...", "...", "...", "...", "..."],
  "tone": "..."
}
```

---

### 4.3 카피 생성 파이프라인 (HITL)

```
1. [Trigger] Notion Webhook (사용자가 "카피 생성" 버튼 클릭)
   - Input: {"productId": "12345"}
   ↓
2. [Google Sheets] 상품 정보 조회
   - Lookup: productId
   - Output: {productName, price, specs, reviewSummary}
   ↓
3. [Notion] 경쟁사 인사이트 조회
   - Database: "Ad Analysis DB"
   - Filter: 관련 키워드
   - Sort: likes DESC
   - Limit: 5
   - Output: [{target, painPoint, keywords, tone}, ...]
   ↓
4. [n8n Function] 프롬프트 조합
   - 템플릿에 변수 삽입
   ↓
5. [Claude API] 카피 생성
   - Model: claude-3-5-sonnet-20241022
   - Prompt: (상품 정보 + 경쟁사 인사이트 결합)
   - Output: {"hookTitle": "...", "features": [...], "detailDescription": "...", "faq": [...]}
   ↓
6. [n8n Function] JSON 파싱 및 검증
   ↓
7. [Notion] 초안 저장
   - Database: "Copy Drafts DB"
   - Status: "검수 중"
   ↓
8. [Slack] 검수 요청 알림
   - 메시지: "📝 카피 초안 생성 완료! Notion에서 확인하세요."
   ↓
9. [사용자] Notion에서 검수 및 수정
   ↓
10. [사용자] "승인" 버튼 클릭
   ↓
11. [Notion Webhook] 승인 이벤트 트리거
   ↓
12. [n8n] (옵션) 쿠팡/네이버 API로 자동 업로드
```

**Claude 프롬프트 예시**:
```
당신은 전자상거래 전문 카피라이터입니다. 한국 소비자의 구매 심리를 잘 이해하고 있습니다.

[상품 정보]
- 상품명: {{productName}}
- 가격: {{price}}원
- 주요 스펙: {{specs}}
- 리뷰 요약: {{reviewSummary}}

[경쟁사 인사이트]
- 잘 나가는 광고의 타겟: {{target}}
- 소구점: {{painPoint}}
- 핵심 키워드: {{keywords}}
- 감정 톤: {{tone}}

위 정보를 바탕으로 다음을 JSON 형식으로 작성해주세요:

1. hookTitle: 클릭을 유도하는 강력한 한 문장 (20자 이내)
2. features: 구매 결정에 영향을 주는 5가지 특징 (각 1줄)
3. detailDescription: 제품의 가치를 전달하는 상세 설명 (3-4 문단, 500자 내외)
4. faq: 예상되는 질문 3개와 답변

출력 형식:
{
  "hookTitle": "...",
  "features": ["...", "...", "...", "...", "..."],
  "detailDescription": "...",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}
```

---

## 4.4 에이전트 협업 시나리오 (전체 플로우)

### 4.4.1 시나리오: "블루투스 이어폰" 상품 등록 자동화

이 시나리오는 5개 AI 에이전트가 협업하여 **"블루투스 이어폰"을 자동으로 소싱하고, 경쟁사 페이지를 분석하고, 완벽한 상품 페이지를 생성한 후, 사용자 피드백을 받아 수정하고, 최종 승인 시 쿠팡/네이버에 자동 업로드**하는 전체 과정을 보여줍니다.

---

#### **Step 1: Agent 5 (오케스트레이션 관리자) - 프로세스 시작**

```
[08:00] n8n Cron Trigger → Agent 5 실행

Agent 5:
"오늘의 상품 등록 자동화를 시작합니다.
Step 1: Agent 1 (상품 소싱)을 실행하여 황금키워드 발굴 및 베스트셀러 상품 수집"
```

**Agent 5 역할**:
- 전체 프로세스 순서 관리
- 각 Agent의 작업 완료 여부 확인
- 병목 지점 감지 및 우선순위 조정
- 최종 리포트 생성

---

#### **Step 2: Agent 1 (상품 소싱) - 황금키워드 발굴**

```python
Agent 1:
  # 1. 쿠팡/네이버에서 "블루투스 이어폰" 카테고리 베스트셀러 수집
  products = ApifyCoupangTool().run(category="electronics", keyword="블루투스 이어폰", max_items=50)

  # 2. 황금키워드 분석
  golden_keywords = GoldenKeywordAnalyzerTool().analyze(products)
  # Output: ["블루투스 이어폰", "TWS 이어폰", "무선 이어폰", "노이즈캔슬링"]

  # 3. Google Sheets에 저장
  GoogleSheetsTool().append(sheet="Products", data=products + golden_keywords)

  # 4. Agent 5에 완료 보고
  return {
    "status": "completed",
    "products_count": 50,
    "golden_keywords": ["블루투스 이어폰", "TWS 이어폰", "무선 이어폰", "노이즈캔슬링"],
    "next_agent": "Agent 2"
  }
```

**결과**:
- Google Sheets에 50개 상품 저장
- 황금키워드 4개 발굴
- Agent 5에 완료 보고

---

#### **Step 3: Agent 2 (경쟁사 페이지 분석) - 베스트셀러 페이지 분석**

```python
Agent 2:
  # 1. Agent 1이 수집한 베스트셀러 상품 중 상위 5개 선택
  top_products = GoogleSheetsTool().read(sheet="Products", sort_by="trendScore", limit=5)

  # 2. 각 상품 페이지 전체 크롤링
  for product in top_products:
    page_data = ApifyCoupangTool().scrape_product_page(product.url)

    # 3. Gemini Vision으로 이미지 분석
    image_insights = GeminiVisionTool().analyze(page_data.images)
    # Output: {"color_tone": "밝은 톤", "composition": "45도 각도", "text_overlay": "30% OFF"}

    # 4. Claude로 제목/상세페이지 패턴 분석
    title_pattern = ClaudeAPITool().analyze_title(page_data.title)
    # Output: {"pattern": "기능 + 제품명 + 특징", "length": 35, "keywords": ["노이즈캔슬링", "30시간"]}

    detail_insights = HTMLParserTool().parse_structure(page_data.detail_html)
    # Output: {"sections": ["제품 소개", "주요 특징", "FAQ"], "emphasis": ["30시간 재생", "노이즈캔슬링"]}

  # 5. Notion에 인사이트 저장
  NotionTool().create_page(
    database="Competitor Insights",
    data={
      "product": "블루투스 이어폰 (베스트셀러 분석)",
      "title_pattern": title_pattern,
      "image_insights": image_insights,
      "detail_structure": detail_insights,
      "key_insights": [
        "제목에 숫자 포함으로 구체성 강조 (예: 30시간 재생)",
        "이미지는 밝은 톤 + 45도 각도로 고급스러움 연출",
        "상세페이지는 '제품 소개 → 주요 특징 → FAQ' 구조",
        "'노이즈캔슬링'과 '30시간 재생'이 가장 강조되는 키워드"
      ]
    }
  )

  # 6. Agent 5에 완료 보고
  return {
    "status": "completed",
    "insights_count": 4,
    "next_agent": "Agent 3"
  }
```

**결과**:
- 베스트셀러 5개 상품 페이지 전체 분석 완료
- 제목 패턴, 이미지 스타일, 상세페이지 구조 인사이트 도출
- Notion에 구조화 저장

---

#### **Step 4: Agent 3 (상품 페이지 생성) - 제목/이미지/HTML 생성**

```python
Agent 3:
  # 1. Agent 1의 상품 정보 + Agent 2의 인사이트 가져오기
  product_info = GoogleSheetsTool().read(sheet="Products", filter="trendScore > 2000", limit=1)[0]
  insights = NotionTool().query(database="Competitor Insights", sort_by="created_time", limit=1)[0]
  golden_keywords = ["블루투스 이어폰", "TWS 이어폰", "노이즈캔슬링", "30시간 재생"]

  # 2. Claude로 제목 3가지 생성
  titles = ClaudeAPITool().generate_titles(
    product_info=product_info,
    insights=insights,
    golden_keywords=golden_keywords,
    count=3
  )
  # Output:
  # [
  #   "노이즈캔슬링 TWS 블루투스 이어폰 30시간 재생 무선충전",
  #   "30시간 초장시간 무선 이어폰 블루투스 5.3 노이즈캔슬링",
  #   "프리미엄 블루투스 이어폰 노이즈캔슬링 IPX7 방수 30시간"
  # ]

  # 3. 컨셉 설정
  concept = ClaudeAPITool().generate_concept(product_info, insights)
  # Output:
  # {
  #   "value_proposition": "30시간 재생으로 출퇴근 고민 끝, 노이즈캔슬링으로 나만의 공간",
  #   "target": "20-30대 출퇴근족, 재택근무자",
  #   "tone": "고급스러움 + 기술력"
  # }

  # 4. Gemini로 썸네일 이미지 2종 생성
  image_prompts = [
    "Premium wireless earbuds, 45-degree angle, bright tone, minimalist background, Korean e-commerce style",
    "Bluetooth earbuds in charging case, soft lighting, white background, product photography"
  ]
  images = []
  for prompt in image_prompts:
    image_url = GeminiImageTool().generate(prompt=prompt)
    images.append({"prompt": prompt, "url": image_url})

  # 5. Claude로 상세페이지 HTML 생성
  detail_html = ClaudeAPITool().generate_detail_page(
    product_info=product_info,
    concept=concept,
    insights=insights,
    golden_keywords=golden_keywords
  )
  # Output: 쿠팡/네이버 업로드용 HTML (제품 소개, 주요 특징, FAQ, 스펙 표 포함)

  # 6. 상표권 체크
  trademark_check = BrandNameDetectorTool().check(titles + [detail_html])
  if not trademark_check["safe"]:
    # 위험 키워드 제거 후 재생성
    titles = ClaudeAPITool().regenerate_titles(titles, remove_keywords=trademark_check["risky_keywords"])

  # 7. Agent 4로 전달
  return {
    "status": "completed",
    "titles": titles,
    "concept": concept,
    "images": images,
    "detail_html": detail_html,
    "trademark_safe": True,
    "next_agent": "Agent 4"
  }
```

**결과**:
- 제목 3종 생성 (황금키워드 포함, 상표권 안전)
- 컨셉 설정 (가치 제안, 타겟, 톤)
- 썸네일 이미지 2종 생성 (Gemini)
- 상세페이지 HTML 생성 (Claude)
- Agent 4로 전달

---

#### **Step 5: Agent 4 (업로드 및 피드백 검수) - HITL 피드백 루프**

```python
Agent 4:
  # 1. Agent 3의 결과물을 Notion 챗봇 UI에 전송
  draft = Agent3.get_output()

  NotionTool().create_page(
    database="Product Drafts",
    data={
      "product_name": draft["titles"][0],
      "titles_options": draft["titles"],
      "images": draft["images"],
      "detail_html": draft["detail_html"],
      "status": "검수 중"
    }
  )

  # 2. Slack 알림
  SlackTool().send_message(
    channel="#product-review",
    message="📝 새 상품 페이지 초안이 생성되었습니다. Notion에서 확인해주세요!"
  )

  # 3. 사용자 피드백 대기 (Notion 챗봇 UI)
  feedback = NotionWebhookTool().wait_for_feedback()

  # === 피드백 루프 시작 ===
  while feedback["action"] != "approve":
    if feedback["command"] == "제목을 25자 이내로 줄여줘":
      # 4a. 피드백 파싱
      modification = FeedbackProcessorTool().parse(feedback["command"])
      # Output: {"action": "shorten_title", "params": {"max_length": 25}}

      # 4b. Agent 3에 재생성 요청
      new_titles = Agent3.regenerate_titles(
        current_titles=draft["titles"],
        modification=modification
      )

      # 4c. Notion에 재생성된 제목 업데이트
      NotionTool().update_page(draft_id, {"titles_options": new_titles})

      # 4d. 재검수 요청
      SlackTool().send_message("#product-review", "✅ 제목을 25자 이내로 수정했습니다. 다시 확인해주세요.")
      feedback = NotionWebhookTool().wait_for_feedback()

    elif feedback["command"] == "이미지 A 선택, 배경 더 밝게":
      # 5a. 이미지 수정 요청
      new_image = Agent3.regenerate_image(
        base_image=draft["images"][0],
        modification={"brightness": "increase", "background": "whiter"}
      )

      NotionTool().update_page(draft_id, {"selected_image": new_image})
      SlackTool().send_message("#product-review", "✅ 이미지를 더 밝게 수정했습니다.")
      feedback = NotionWebhookTool().wait_for_feedback()

    elif feedback["command"] == "상세페이지에서 '삼성' 키워드 제거":
      # 6a. 상세페이지 재생성 (위험 키워드 제거)
      new_html = Agent3.regenerate_detail_html(
        current_html=draft["detail_html"],
        remove_keywords=["삼성"]
      )

      NotionTool().update_page(draft_id, {"detail_html": new_html})
      SlackTool().send_message("#product-review", "✅ '삼성' 키워드를 제거했습니다.")
      feedback = NotionWebhookTool().wait_for_feedback()

  # === 피드백 루프 종료 (승인) ===

  # 7. 쿠팡 자동 업로드
  coupang_result = CoupangUploaderTool().upload(
    title=draft["titles"][0],
    image_url=draft["images"][0]["url"],
    detail_html=draft["detail_html"],
    price=product_info["price"],
    category="electronics"
  )

  # 8. 네이버 자동 업로드
  naver_result = NaverUploaderTool().upload(
    title=draft["titles"][0],
    image_url=draft["images"][0]["url"],
    detail_html=draft["detail_html"],
    price=product_info["price"],
    category="전자제품"
  )

  # 9. Slack 완료 알림
  SlackTool().send_message(
    channel="#product-review",
    message=f"""
    ✅ 상품 등록 완료!

    - 쿠팡: {coupang_result["product_url"]}
    - 네이버: {naver_result["product_url"]}
    - 제목: {draft["titles"][0]}
    """
  )

  # 10. Agent 5에 완료 보고
  return {
    "status": "completed",
    "coupang_url": coupang_result["product_url"],
    "naver_url": naver_result["product_url"]
  }
```

**결과**:
- Notion 챗봇 UI에 초안 전송
- 사용자 피드백 수신 및 처리 (제목 수정, 이미지 수정, 키워드 제거)
- 피드백 루프 반복 (승인 시까지)
- 쿠팡/네이버 자동 업로드
- 완료 알림

---

#### **Step 6: Agent 5 (오케스트레이션 관리자) - 최종 리포트**

```python
Agent 5:
  # 1. 전체 프로세스 완료 확인
  process_summary = {
    "start_time": "2024-01-15 08:00:00",
    "end_time": "2024-01-15 09:45:00",
    "duration": "1시간 45분",
    "agents_executed": [
      {"agent": "Agent 1", "status": "completed", "time": "10분"},
      {"agent": "Agent 2", "status": "completed", "time": "20분"},
      {"agent": "Agent 3", "status": "completed", "time": "15분"},
      {"agent": "Agent 4", "status": "completed", "time": "1시간 (피드백 루프 포함)"}
    ],
    "results": {
      "products_sourced": 50,
      "golden_keywords": 4,
      "insights_generated": 4,
      "titles_created": 3,
      "images_created": 2,
      "feedback_rounds": 3,
      "uploads": ["쿠팡", "네이버"]
    }
  }

  # 2. Notion에 최종 리포트 저장
  NotionTool().create_page(
    database="Daily Reports",
    data=process_summary
  )

  # 3. Slack 최종 알림
  SlackTool().send_message(
    channel="#automation-summary",
    message=f"""
    🎉 오늘의 상품 등록 자동화 완료!

    ⏱ 소요 시간: 1시간 45분
    📦 상품 소싱: 50개
    🔍 황금키워드: 4개
    📊 경쟁사 분석: 5개 페이지
    ✍️ 페이지 생성: 제목 3종 + 이미지 2종 + HTML
    🔄 피드백 루프: 3회
    ✅ 업로드: 쿠팡, 네이버

    다음 실행: 내일 08:00
    """
  )

  return {"status": "completed", "summary": process_summary}
```

**최종 결과**:
- 전체 프로세스 1시간 45분 소요
- 상품 소싱 → 분석 → 생성 → 피드백 → 업로드 완료
- 사용자는 피드백만 3회 제공 (약 1시간)
- 나머지 작업은 AI 에이전트가 자동 처리

---

### 4.4.2 협업 패턴

#### 패턴 1: 순차 협업 (Sequential)
```
Agent 1 → Agent 2 → Agent 3 → Agent 4 → Agent 5
```
- 각 Agent의 출력이 다음 Agent의 입력이 됨
- 의존성이 명확한 작업에 적합

#### 패턴 2: 병렬 협업 (Parallel)
```
        ┌─ Agent 2 (쿠팡 분석) ─┐
Agent 1 ┤                       ├─ Agent 3
        └─ Agent 2 (네이버 분석) ┘
```
- 독립적인 작업을 동시에 실행
- 시간 단축 효과

#### 패턴 3: 피드백 루프 (Feedback Loop)
```
Agent 3 → Agent 4 → [사용자 피드백] → Agent 3 → Agent 4 → ...
```
- 사용자 승인 시까지 반복
- HITL의 핵심 패턴

#### 패턴 4: 오케스트레이션 (Orchestration)
```
                  Agent 5
                    |
      ┌─────────────┼─────────────┐
      ↓             ↓             ↓
  Agent 1       Agent 2       Agent 3
      ↓             ↓             ↓
      └─────────────┼─────────────┘
                    ↓
                 Agent 4
```
- Agent 5가 전체 프로세스 조율
- 우선순위 관리 및 병목 해소

---

### 4.4.3 에이전트 간 데이터 전달 방식

```python
# 방법 1: 직접 전달 (함수 호출)
result = Agent1.run()
Agent2.run(input=result)

# 방법 2: 공유 저장소 (Google Sheets, Notion)
Agent1.save_to_sheets(data)
data = Agent2.load_from_sheets()

# 방법 3: 메시지 큐 (n8n Webhook)
Agent1.send_webhook(data)
Agent2.listen_webhook()

# 방법 4: CrewAI 내부 메커니즘 (권장)
crew = Crew(agents=[Agent1, Agent2, Agent3, Agent4, Agent5])
result = crew.kickoff()  # CrewAI가 자동으로 데이터 전달 관리
```

---

## 5. 배포 아키텍처

### 5.1 개발 환경 vs 프로덕션 환경

| 항목 | 개발 (로컬) | 프로덕션 (GCP) |
|------|-------------|----------------|
| **n8n** | 로컬 실행 (npm start) | PM2로 데몬 실행 |
| **데이터베이스** | SQLite | SQLite (또는 PostgreSQL) |
| **HTTPS** | HTTP (테스트용) | HTTPS (Let's Encrypt) |
| **도메인** | localhost:5678 | n8n.yourdomain.com |
| **백업** | 수동 | 자동 (cron + Cloud Storage) |
| **모니터링** | 없음 | GCP Monitoring + Slack 알림 |

### 5.2 배포 프로세스

```
1. 로컬 개발
   - n8n 워크플로우 설계
   - 테스트 실행
   ↓
2. 워크플로우 Export
   - n8n UI에서 JSON Export
   - Git에 커밋 (workflows/ 디렉토리)
   ↓
3. GCP VM에 배포
   - SSH 접속
   - Git Pull
   - n8n 워크플로우 Import
   - PM2 재시작
   ↓
4. 검증
   - 수동 실행 테스트
   - Cron 스케줄 확인
   - Slack 알림 수신 확인
```

### 5.3 롤백 전략

- **워크플로우 롤백**: Git에서 이전 버전 가져와 Import
- **VM 롤백**: GCP Snapshot으로 복원
- **데이터 롤백**: Cloud Storage 백업에서 복원

---

## 6. 보안 아키텍처

### 6.1 인증 및 권한

#### n8n 접근 제어
- **Basic Auth**: 초기 설정
  ```
  N8N_BASIC_AUTH_ACTIVE=true
  N8N_BASIC_AUTH_USER=admin
  N8N_BASIC_AUTH_PASSWORD=secure_password_here
  ```
- **OAuth 2.0**: 향후 고도화 시 적용

#### API 키 관리
- **저장 위치**: `.env` 파일 (권한 600)
- **Git 제외**: `.gitignore`에 포함
- **백업**: 암호화 후 안전한 위치 (1Password, Bitwarden 등)

#### GCP IAM
- **최소 권한 원칙**: 서비스 계정에 필요한 역할만 부여
- **정기 검토**: 월 1회 권한 감사

### 6.2 네트워크 보안

#### 방화벽 규칙
```
허용:
- SSH (22): 특정 IP만 허용 (사용자 IP)
- HTTP (80): 전체 허용 (HTTPS 리디렉션용)
- HTTPS (443): 전체 허용
- n8n (5678): 특정 IP만 허용 (또는 Nginx로 HTTPS 전환 후 차단)

차단:
- 기타 모든 포트
```

#### HTTPS 설정 (Nginx + Let's Encrypt)
```nginx
server {
    listen 80;
    server_name n8n.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/n8n.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6.3 데이터 보안

#### 전송 중 암호화
- 모든 API 통신: HTTPS/TLS 1.2+
- Webhook: HTTPS 필수

#### 저장 중 암호화
- GCP Cloud Storage: 기본 암호화 (AES-256)
- 민감 정보: 추가 암호화 (선택)

#### 개인정보 처리
- 크롤링 데이터: 개인정보 제외
- 광고 데이터: 공개 정보만 수집
- 리뷰 데이터: 사용자 이름 제외, 텍스트만 수집

---

## 7. 확장성 및 성능

### 7.1 수평 확장 (Scale Out)

#### 워크플로우 병렬 실행
- **현재**: 단일 VM에서 순차 실행
- **확장**: n8n의 Queue Mode 활성화
  - Worker 노드 추가 (VM 2대 이상)
  - Redis로 작업 큐 관리
  - 각 Worker가 독립적으로 작업 처리

```
       ┌─────────────┐
       │ Redis Queue │
       └─────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Worker 1│ │Worker 2│ │Worker 3│
└────────┘ └────────┘ └────────┘
```

### 7.2 수직 확장 (Scale Up)

#### VM 인스턴스 업그레이드
- **현재**: e2-micro (1GB RAM)
- **확장 1단계**: e2-small (2GB RAM) - $15/월
- **확장 2단계**: e2-medium (4GB RAM) - $30/월

#### 데이터베이스 마이그레이션
- **현재**: SQLite (파일 기반)
- **확장**: PostgreSQL (Cloud SQL)
  - 동시 접속 지원
  - 트랜잭션 안정성
  - 비용: $10-20/월

### 7.3 성능 최적화

#### 캐싱 전략
- **Apify 결과 캐싱**: 동일 요청 24시간 캐시
- **LLM 응답 캐싱**: 유사 프롬프트 캐싱
- **구현**: Redis 또는 n8n 내장 캐시

#### API 호출 최적화
- **배치 처리**: 여러 요청을 하나로 묶기
- **Rate Limit 준수**: 재시도 로직 (Exponential Backoff)
- **병렬 호출**: 독립적인 API는 동시 호출

---

## 8. 모니터링 및 로깅

### 8.1 시스템 모니터링

#### GCP Monitoring
- **메트릭**:
  - CPU 사용률
  - 메모리 사용률
  - 디스크 I/O
  - 네트워크 트래픽
- **알림**:
  - CPU > 80% → Email
  - 디스크 > 90% → Email

#### n8n 실행 로그
- **저장 위치**: `/home/user/.n8n/logs/`
- **로그 레벨**: INFO (프로덕션), DEBUG (개발)
- **로그 로테이션**: logrotate (일 1회)

### 8.2 애플리케이션 모니터링

#### 워크플로우 실행 추적
- **n8n UI**: Executions 탭에서 실시간 확인
- **Slack 알림**:
  - 성공: "✅ [워크플로우명] 완료"
  - 실패: "❌ [워크플로우명] 실패: [에러 메시지]"

#### 에러 추적
- **n8n Error Trigger**: 모든 워크플로우에 에러 핸들러 추가
- **Slack 알림**: 에러 발생 시 즉시 알림
- **로그 저장**: Cloud Storage에 에러 로그 백업

### 8.3 비용 모니터링

#### GCP Billing Alerts
- **예산 설정**: 월 $50
- **알림 기준**:
  - 50% 도달 → Email
  - 80% 도달 → Email + Slack
  - 100% 도달 → Email + Slack (긴급)

#### API 비용 추적
- **Spreadsheet**: 주간 API 호출 수 및 비용 기록
- **자동화**: n8n 워크플로우로 API 사용량 집계

---

## 9. 비용 구조

### 9.1 월 예상 비용 (초기)

| 항목 | 서비스 | 비용 |
|------|--------|------|
| **인프라** | GCP Compute Engine (e2-micro) | $7-10 |
| | GCP Cloud Storage (1GB) | $0.02 |
| **데이터 수집** | Apify (무료 플랜) | $0 |
| **AI/LLM** | Gemini API (100 광고 분석/주) | $10-30 |
| | Claude API (50 카피 생성/월) | $20-50 |
| **기타** | Notion (무료 플랜) | $0 |
| | Google Sheets (무료) | $0 |
| | Slack (무료 플랜) | $0 |
| **합계** | | **$37-90/월** |

### 9.2 월 예상 비용 (확장 시)

| 항목 | 서비스 | 비용 |
|------|--------|------|
| **인프라** | GCP Compute Engine (e2-small) | $15 |
| | GCP Cloud SQL (PostgreSQL) | $10 |
| **데이터 수집** | Apify (Starter 플랜) | $49 |
| **AI/LLM** | Gemini API (500 광고/주) | $50-100 |
| | Claude API (200 카피/월) | $50-100 |
| **합계** | | **$174-274/월** |

### 9.3 비용 절감 전략

- **GCP 무료 티어**: e2-micro는 월 1개 무료 (미국 리전, 아시아는 유료)
- **Apify 무료 크레딧**: 월 $5 크레딧 활용
- **LLM 모델 선택**: 분석은 Gemini (저렴), 카피는 Claude (품질)
- **캐싱**: 중복 요청 방지
- **스케줄 최적화**: 크롤링 빈도 조절 (일 1회 → 주 3회)

---

## 10. 장애 복구 계획 (Disaster Recovery)

### 10.1 백업 전략

#### 자동 백업
- **n8n 데이터베이스**: 일 1회 백업
  ```bash
  # cron: 매일 02:00
  0 2 * * * /home/user/backup-n8n.sh
  ```
  ```bash
  # backup-n8n.sh
  #!/bin/bash
  DATE=$(date +%Y%m%d)
  tar -czf /tmp/n8n-backup-$DATE.tar.gz ~/.n8n
  gsutil cp /tmp/n8n-backup-$DATE.tar.gz gs://ai-marketing-data/backups/
  rm /tmp/n8n-backup-$DATE.tar.gz
  ```

- **워크플로우**: Git에 버전 관리
- **환경 변수**: 암호화 후 Cloud Storage

#### 백업 보관 정책
- 일간 백업: 7일 보관
- 주간 백업: 4주 보관
- 월간 백업: 12개월 보관

### 10.2 복구 절차

#### 시나리오 1: n8n 서비스 다운
```
1. PM2 상태 확인
   pm2 status

2. n8n 재시작
   pm2 restart n8n

3. 로그 확인
   pm2 logs n8n

4. 재시작 실패 시 수동 실행
   n8n start
```

#### 시나리오 2: VM 인스턴스 장애
```
1. GCP Console에서 새 VM 생성
2. Snapshot 또는 백업에서 복원
3. n8n 재설치 및 백업 데이터 복구
   gsutil cp gs://ai-marketing-data/backups/latest.tar.gz /tmp/
   tar -xzf /tmp/latest.tar.gz -C ~/
4. PM2로 n8n 재시작
5. 워크플로우 동작 확인
```

#### 시나리오 3: 데이터 손실
```
1. Cloud Storage 백업 목록 확인
   gsutil ls gs://ai-marketing-data/backups/

2. 최신 백업 다운로드 및 복원
3. Google Sheets는 자동 버전 관리로 복원
4. Notion은 히스토리에서 복원
```

### 10.3 RTO/RPO 목표

- **RTO (Recovery Time Objective)**: 4시간 이내
  - VM 재생성 및 복구: 2시간
  - 데이터 복원 및 검증: 2시간

- **RPO (Recovery Point Objective)**: 24시간 이내
  - 일 1회 백업으로 최대 24시간 데이터 손실 가능
  - 중요 데이터는 Google Sheets/Notion에 실시간 저장으로 손실 최소화

---

## 11. 향후 개선 계획

### 11.1 기술적 개선
- [ ] PostgreSQL 마이그레이션 (확장성)
- [ ] Redis 캐싱 레이어 추가 (성능)
- [ ] Kubernetes 배포 (고가용성)
- [ ] CI/CD 파이프라인 구축 (자동 배포)

### 11.2 기능적 개선
- [ ] 광고 이미지 자동 생성 (Gemini Imagen)
- [ ] A/B 테스트 자동화 (카피 변형 생성)
- [ ] 경쟁사 가격 모니터링
- [ ] 재고 관리 연동

### 11.3 운영적 개선
- [ ] 대시보드 고도화 (Grafana)
- [ ] 자동화 성과 리포트 (주간/월간)
- [ ] 모바일 앱 (React Native + Notion API)

---

## 12. 참고 자료

### 12.1 공식 문서
- [n8n Documentation](https://docs.n8n.io/)
- [Apify Documentation](https://docs.apify.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Claude API Documentation](https://docs.anthropic.com/)
- [GCP Documentation](https://cloud.google.com/docs)

### 12.2 커뮤니티
- [n8n Community Forum](https://community.n8n.io/)
- [Apify Discord](https://discord.com/invite/jyEM2PRvMU)
- [GCP Reddit](https://www.reddit.com/r/googlecloud/)

---

## 부록: 아키텍처 결정 기록 (ADR)

### ADR-001: n8n 셀프호스팅 vs 클라우드
- **결정**: 셀프호스팅 선택
- **이유**: 비용 절감 ($10 vs $20-50/월), 사용자 코딩 가능, GCP 크레딧 활용
- **트레이드오프**: 초기 설정 복잡도 증가, 유지보수 책임

### ADR-002: Gemini + Claude 하이브리드 전략
- **결정**: 분석은 Gemini, 카피는 Claude
- **이유**: 비용 효율 + 한국어 품질 균형
- **트레이드오프**: 두 API 관리 필요

### ADR-003: Google Sheets + Notion 이중 저장소
- **결정**: 상품 DB는 Sheets, 광고 분석/카피는 Notion
- **이유**: Sheets는 필터링/정렬 쉬움, Notion은 HITL에 최적
- **트레이드오프**: 데이터 분산으로 통합 쿼리 어려움

---

**문서 관리**:
- 최초 작성: 2025-11-21
- 마지막 업데이트: 2025-11-21
- 다음 검토 예정일: 2026-02-21 (분기별)
