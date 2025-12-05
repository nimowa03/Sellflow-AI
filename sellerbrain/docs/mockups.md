# 목업 및 UI 플로우 (Mockups) - SellFlow-AI
**작성일**: 2025-11-23
**버전**: 1.0

## 🎨 UI/UX 컨셉
*   **톤앤매너**: 신뢰감을 주는 딥 블루 & 깔끔한 화이트, AI를 상징하는 그라데이션 포인트.
*   **레이아웃**: 좌측 사이드바(네비게이션), 중앙 메인 워크스페이스, 우측 AI 채팅/로그 패널.

## 📱 주요 화면 구성

### 1. 온보딩 페이지 (Landing)
*   **Hero Section**:
    *   Copy: "AI 에이전트가 당신의 상품 등록과 마케팅을 자동화합니다."
    *   CTA Button: "무료로 시작하기" (중앙 배치)
*   **Features**: 4단계 아이콘 (경쟁사 분석 -> 소싱 -> 생성 -> 업로드)
*   **Demo**: 경쟁사 URL을 넣으면 AI가 분석하여 내 상품 페이지를 만드는 과정 시연

### 2. 대시보드 (Dashboard)
*   **Status Cards**:
    *   [소싱된 상품: 12개]
    *   [분석 완료: 5개]
    *   [업로드 대기: 3개]
*   **Recent Activity**: 에이전트의 최근 활동 로그 리스트

### 3. 소싱 및 분석 화면 (Sourcing View)
*   **Input**: 키워드 입력창 ("여름 원피스 찾아줘")
*   **Result Table**:
    *   상품명 | 가격 | 경쟁강도 | 예상수익 | AI 추천점수
    *   [선택] 체크박스 제공

### 4. 상세페이지 생성 및 HITL (Creative View)
*   **Split View**:
    *   좌측: AI가 생성한 초안 (이미지 + 텍스트)
    *   우측: 수정 요청 채팅창 ("이 문구 좀 더 감성적으로 바꿔줘")
*   **Action Buttons**: [재생성] [승인 및 업로드]

### 5. 설정 (Settings)
*   **API Keys**: OpenAI, Google Gemini, Naver/Coupang API 키 관리
*   **Notifications**: 슬랙/이메일 알림 설정 (n8n 연동)
