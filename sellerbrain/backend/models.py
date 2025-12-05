"""
MongoDB 데이터 모델 정의
SellFlow-AI 프로젝트의 모든 데이터 스키마를 Pydantic으로 정의
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ProductStatus(str, Enum):
    """상품 처리 상태"""
    SOURCED = "sourced"              # 소싱 완료
    ANALYZED = "analyzed"            # 경쟁사 분석 완료
    GENERATED = "generated"          # 콘텐츠 생성 완료
    IN_REVIEW = "in_review"          # HITL 검수 중
    APPROVED = "approved"            # 사용자 승인
    UPLOADED = "uploaded"            # 오픈마켓 업로드 완료
    FAILED = "failed"                # 실패


# ============================================
# 1. Product (상품 소싱 결과)
# ============================================

class Product(BaseModel):
    """
    Agent 1 (상품 소싱)의 결과물
    황금키워드 발굴 및 소싱 데이터
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    keyword: str = Field(..., description="사용자가 입력한 소싱 키워드")
    sourced_at: datetime = Field(default_factory=datetime.now)
    status: ProductStatus = Field(default=ProductStatus.SOURCED)

    # 황금키워드
    golden_keywords: List[str] = Field(default_factory=list, description="높은 검색량 + 낮은 경쟁 키워드")
    excluded_brands: List[str] = Field(default_factory=list, description="제외된 브랜드 키워드")

    # 메타데이터
    search_volume: Optional[int] = None
    competition_level: Optional[str] = None  # "low", "medium", "high"
    trend_score: Optional[float] = None

    # 추천 경쟁사 URL (분석 대상)
    competitor_urls: List[str] = Field(default_factory=list, description="분석할 베스트셀러 URL")

    class Config:
        json_schema_extra = {
            "example": {
                "keyword": "블루투스 이어폰",
                "golden_keywords": ["TWS 이어폰", "무선 이어폰", "노이즈캔슬링"],
                "excluded_brands": ["삼성", "애플", "소니"],
                "competitor_urls": ["https://coupang.com/example1", "https://coupang.com/example2"]
            }
        }


# ============================================
# 2. CompetitorAnalysis (경쟁사 분석)
# ============================================

class ImageAnalysis(BaseModel):
    """이미지 스타일 분석 결과"""
    color_tone: str = Field(..., description="색감 (예: 밝은 톤, 파스텔)")
    composition: str = Field(..., description="구도 (예: 45도 각도, 정면)")
    text_overlay: Optional[str] = Field(None, description="텍스트 오버레이 (예: 30% OFF)")
    style_keywords: List[str] = Field(default_factory=list)


class TitlePattern(BaseModel):
    """제목 패턴 분석"""
    length: int
    pattern: str = Field(..., description="제목 패턴 (예: 기능 + 제품명 + 특징)")
    keywords: List[str] = Field(default_factory=list)
    has_numbers: bool = False
    has_emoji: bool = False


class DetailStructure(BaseModel):
    """상세페이지 구조 분석"""
    sections: List[str] = Field(default_factory=list, description="섹션 순서 (예: ['제품 소개', '주요 특징', 'FAQ'])")
    emphasis_points: List[str] = Field(default_factory=list, description="강조 포인트 (예: ['30시간 재생', '노이즈캔슬링'])")
    has_comparison_table: bool = False
    has_faq: bool = False


class CompetitorAnalysis(BaseModel):
    """
    Agent 2 (경쟁사 페이지 분석)의 결과물
    베스트셀러 상품 페이지 전체 분석
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    product_id: str = Field(..., description="연결된 Product ID")
    competitor_url: str
    analyzed_at: datetime = Field(default_factory=datetime.now)

    # 분석 결과
    title_pattern: TitlePattern
    image_analysis: ImageAnalysis
    detail_structure: DetailStructure

    # 핵심 인사이트
    key_insights: List[str] = Field(default_factory=list, description="'왜 잘 팔리는가' 인사이트")
    value_proposition: str = Field(..., description="핵심 가치 제안")
    target_audience: str = Field(..., description="타겟 고객 (예: 20-30대 출퇴근족)")

    # 원본 데이터 (선택사항)
    raw_title: Optional[str] = None
    raw_price: Optional[int] = None
    raw_rating: Optional[float] = None
    raw_reviews: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "competitor_url": "https://coupang.com/example",
                "key_insights": [
                    "제목에 숫자 포함으로 구체성 강조",
                    "이미지는 밝은 톤 + 45도 각도로 고급스러움 연출"
                ],
                "value_proposition": "30시간 재생으로 출퇴근 고민 끝",
                "target_audience": "20-30대 출퇴근족"
            }
        }


# ============================================
# 3. GeneratedContent (생성된 콘텐츠)
# ============================================

class TitleOption(BaseModel):
    """제목 옵션 (3가지 생성)"""
    text: str
    length: int
    keywords_used: List[str]
    score: Optional[float] = None  # 품질 점수 (선택사항)


class ImageOption(BaseModel):
    """이미지 옵션 (2가지 생성)"""
    url: str
    style: str = Field(..., description="스타일 설명 (예: 밝은 톤, 45도 각도)")
    prompt_used: str = Field(..., description="생성에 사용된 프롬프트")
    provider: str = Field(default="nanobanana", description="이미지 생성 API")


class Concept(BaseModel):
    """콘텐츠 컨셉"""
    value_proposition: str
    target_audience: str
    tone: str = Field(..., description="톤앤매너 (예: 고급스러움 + 기술력)")


class GeneratedContent(BaseModel):
    """
    Agent 3 (상품 페이지 생성)의 결과물
    제목 + 이미지 + 상세페이지 HTML 전체
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    product_id: str
    analysis_id: str = Field(..., description="사용된 CompetitorAnalysis ID")
    generated_at: datetime = Field(default_factory=datetime.now)

    # 생성된 콘텐츠
    titles: List[TitleOption] = Field(..., description="3가지 제목 옵션")
    images: List[ImageOption] = Field(..., description="2가지 이미지 옵션")
    detail_html: str = Field(..., description="쿠팡/네이버 업로드용 HTML")
    concept: Concept

    # 품질 검증
    trademark_safe: bool = Field(default=True, description="상표권 안전 여부")
    risky_keywords: List[str] = Field(default_factory=list, description="위험 키워드 (제거된 것들)")
    quality_score: Optional[float] = Field(None, description="전체 품질 점수 (0-100)")

    # 사용자 선택 (HITL 이후)
    selected_title_index: Optional[int] = None
    selected_image_index: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "titles": [
                    {"text": "노이즈캔슬링 TWS 블루투스 이어폰 30시간 재생", "length": 25, "keywords_used": ["TWS", "노이즈캔슬링"]},
                    {"text": "30시간 초장시간 무선 이어폰 블루투스 5.3", "length": 22, "keywords_used": ["30시간", "무선"]}
                ],
                "trademark_safe": True,
                "risky_keywords": ["삼성", "애플"]
            }
        }


# ============================================
# 4. FeedbackHistory (HITL 피드백)
# ============================================

class FeedbackAction(str, Enum):
    """피드백 액션 타입"""
    REGENERATE_TITLE = "regenerate_title"
    REGENERATE_IMAGE = "regenerate_image"
    REGENERATE_HTML = "regenerate_html"
    MODIFY_TITLE = "modify_title"
    REMOVE_KEYWORD = "remove_keyword"
    APPROVE = "approve"
    REJECT = "reject"


class ParsedFeedback(BaseModel):
    """파싱된 피드백 구조"""
    action: FeedbackAction
    target: str = Field(..., description="수정 대상 (title, image, html)")
    parameters: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {
            "example": {
                "action": "regenerate_title",
                "target": "title",
                "parameters": {"max_length": 25, "remove_keywords": ["삼성"]}
            }
        }


class FeedbackHistory(BaseModel):
    """
    Agent 4 (피드백 처리)의 입력/출력
    사용자 피드백 및 재생성 이력
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    content_id: str = Field(..., description="연결된 GeneratedContent ID")
    feedback_at: datetime = Field(default_factory=datetime.now)

    # 사용자 입력 (자연어)
    user_feedback: str = Field(..., description="자연어 피드백 (예: '제목을 25자로 줄이고 이미지를 더 밝게')")

    # 파싱 결과
    parsed_action: ParsedFeedback

    # 재생성 결과
    regenerated: bool = Field(default=False)
    new_content_id: Optional[str] = Field(None, description="재생성된 새로운 GeneratedContent ID")

    class Config:
        json_schema_extra = {
            "example": {
                "user_feedback": "제목을 25자 이내로 줄이고, 이미지를 더 밝게 해줘",
                "parsed_action": {
                    "action": "regenerate_title",
                    "target": "title",
                    "parameters": {"max_length": 25}
                }
            }
        }


# ============================================
# 5. UploadRecord (업로드 기록)
# ============================================

class UploadPlatform(str, Enum):
    """업로드 플랫폼"""
    COUPANG = "coupang"
    NAVER = "naver"
    AUCTION = "auction"
    GMARKET = "gmarket"


class UploadStatus(str, Enum):
    """업로드 상태"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"


class UploadRecord(BaseModel):
    """
    쿠팡/네이버 업로드 기록
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    content_id: str = Field(..., description="업로드된 GeneratedContent ID")
    platform: UploadPlatform
    uploaded_at: datetime = Field(default_factory=datetime.now)
    status: UploadStatus = Field(default=UploadStatus.PENDING)

    # 업로드 데이터
    product_url: Optional[str] = Field(None, description="업로드 후 상품 URL")
    platform_product_id: Optional[str] = Field(None, description="플랫폼의 상품 ID")

    # 에러 정보
    error_message: Optional[str] = None
    retry_count: int = Field(default=0)

    class Config:
        json_schema_extra = {
            "example": {
                "platform": "coupang",
                "status": "success",
                "product_url": "https://coupang.com/vp/products/123456",
                "platform_product_id": "123456"
            }
        }


# ============================================
# 6. AgentLog (에이전트 실행 로그)
# ============================================

class AgentLog(BaseModel):
    """
    각 에이전트의 실행 로그 (디버깅 및 모니터링용)
    """
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    agent_name: str = Field(..., description="에이전트 이름 (예: ProductSourcingAgent)")
    task_id: str = Field(..., description="Celery Task ID")
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

    # 실행 정보
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Optional[Dict[str, Any]] = None
    status: str = Field(default="running")  # running, completed, failed
    error: Optional[str] = None

    # 성능 메트릭
    execution_time_seconds: Optional[float] = None
    llm_calls: int = Field(default=0)
    tokens_used: Optional[int] = None
    cost_usd: Optional[float] = None
