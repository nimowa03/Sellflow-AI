# 기술 사양서 (Tech Specs) - SellFlow-AI
**작성일**: 2025-11-23
**버전**: 1.1 (Framework Decision)

## 🟣 HOW | 어떻게 만드는가

### 1. AI 프레임워크 결정: CrewAI (for MVP)
*   **결정**: **CrewAI** 채택.
*   **이유**:
    *   **Role-Playing**: "소싱 담당자", "디자이너", "카피라이터" 등 역할 기반 협업 구조가 1인 셀러의 "AI 팀" 컨셉과 완벽히 일치.
    *   **빠른 MVP**: LangGraph는 복잡한 상태 관리(State Management)에 강하지만 초기 설정이 복잡함. 현재의 선형적(Linear) 파이프라인에는 CrewAI가 더 효율적.
    *   **확장성**: 추후 복잡한 분기 처리가 필요할 때 LangGraph로 마이그레이션 가능.

### 2. 전체 시스템 흐름 (Full Flow)
```mermaid
graph TD
    User((사용자/셀러)) -->|1. 경쟁사 URL/키워드 입력| Web[웹 대시보드 (Next.js)]
    Web -->|2. 작업 요청| Server[FastAPI 백엔드]
    
    subgraph "AI Brain (CrewAI)"
        Server -->|3. 실행| Crew[CrewAI 팀]
        Crew -->|4. 분석| Agent1[분석 에이전트]
        Crew -->|5. 기획| Agent2[기획 에이전트]
        Crew -->|6. 생성| Agent3[디자인 에이전트]
        Agent3 -->|7. 이미지 변환| Nano[나노바나나 API]
    end
    
    Crew -->|8. 결과 반환| Web
    User -->|9. HITL 피드백/수정| Web
    
    subgraph "Automation (n8n)"
        User -->|10. 최종 승인| n8n[n8n 워크플로우]
        n8n -->|11. 업로드| Market[오픈마켓 (쿠팡/네이버)]
        n8n -->|12. 알림| Slack[슬랙/이메일]
    end
```

### 3. AI 에이전트 팀 구성 (The SellFlow Team)
우리의 "AI 직원"들은 각자 전문적인 페르소나를 가집니다.

#### 🕵️‍♂️ 에이전트 1: 트렌드 헌터 (Trend Hunter)
*   **역할**: 수석 상품 소싱 전문가 (Senior Product Researcher)
*   **목표**: "검색량은 높지만 **지재권(상표권) 위험이 없는** '진짜 황금 키워드' 발굴"
*   **Backstory**: 10년 차 이커머스 MD. 단순 검색량만 보지 않고, **'나이키', '포켓몬' 같은 브랜드 키워드를 칼같이 제외**함. "법적으로 안전하면서도 돈이 되는" 비브랜드 신조어/카테고리 키워드를 찾아내는 데 천부적인 재능이 있음.

#### 🧠 에이전트 2: 마켓 스트래티지스트 (Market Strategist)
*   **역할**: 경쟁사 분석 전문가 (Lead Market Analyst)
*   **목표**: "1등 상품의 상세페이지를 벤치마킹하여, 그보다 더 매력적인 소구점(Selling Point) 도출"
*   **Backstory**: 전직 대기업 마케팅 전략가. 경쟁사의 리뷰를 1,000개씩 읽어 고객의 불만(Pain Point)을 찾아내고, 이를 해결할 우리만의 무기를 만들어냄.

#### 🎨 에이전트 3: 크리에이티브 디렉터 (Creative Director)
*   **역할**: 콘텐츠 제작 전문가 (Senior Content Creator)
*   **목표**: "고객의 지갑을 여는 '미친 흡입력'의 상세페이지와 이미지 제작"
*   **Backstory**: 억대 연봉의 카피라이터이자 비주얼 디렉터. **나노바나나(NanoBanana)**를 자유자재로 다뤄, 평범한 제품 사진을 '인스타 감성'의 고퀄리티 화보로 재탄생시킴.

#### ⚖️ 에이전트 4: 컴플라이언스 오피서 (Compliance Officer)
*   **역할**: 품질 및 리스크 관리자 (Quality Assurance Specialist)
*   **목표**: "상표권 침해 0건, 금지어 0건, 업로드 오류 0건의 완벽한 마무리"
*   **Backstory**: 꼼꼼함의 대명사. **RAG(검색 증강 생성) 기술**을 활용하여, LLM이 모르는 한국 특화 상표권(예: '쿼카', '마약베개' 등)까지 **벡터 DB(ChromaDB)**에서 조회하여 차단함. "포켓몬" 대신 "귀여운 몬스터"로 대체어를 제안하는 센스도 겸비.

### 4. 기술 스택 (Tech Stack)
| 구분 | 기술 | 역할 |
| :--- | :--- | :--- |
| **AI Engine** | **CrewAI** | "팀" 단위의 지능적 작업 처리 (분석, 기획, 생성) |
| **Memory (RAG)** | **ChromaDB** | **이커머스 특화 상표권/금지어 벡터 데이터베이스** |
| **Image Gen** | **NanoBanana** | 법적 안전성을 위한 제품 이미지 재가공 (배경/모델 생성) |
| **Automation** | **n8n** | 최종 결과물의 외부 플랫폼(마켓) 연동 및 알림 |
| **Backend** | **FastAPI** | 웹과 AI/n8n을 연결하는 컨트롤 타워 |
| **Frontend** | **Next.js** | 사용자가 AI와 소통하고 피드백을 주는 인터페이스 |

### 3. 상세 워크플로우 (Workflow)
*   **n8n**: 전체 오케스트레이션, 에이전트 간 데이터 전달 및 실행 관리.
*   **CrewAI**: 각 에이전트 병렬·직렬 처리 구조, 사용자의 명령/피드백 즉각 반영.
*   **나노바나나/LLM API**: 이미지·카피 생성, 안전성 변환, 자연어 이해.

### 4. 데이터베이스 스키마 (MongoDB Collections)
*   **`products`**: 수집된 상품 원본 데이터
*   **`sourcing_results`**: AI 에이전트의 소싱 분석 결과 (JSON)
*   **`keywords`**: 발굴된 키워드 및 황금 점수
*   **`contents`**: 생성된 상세페이지 및 카피라이팅 초안
