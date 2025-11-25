"""
Agent 3: 상품 페이지 생성 에이전트
경쟁사 분석을 바탕으로 제목 + 이미지 + 상세페이지 HTML 생성
"""

from crewai import Agent, Task, Crew
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Dict, Any, List
import os
import sys

# Tools import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.imagen_tool import generate_product_image, generate_image_from_competitor_analysis
from tools.claude_tool import generate_product_titles, generate_detail_html
from config import GEMINI_MODEL, GEMINI_API_KEY, GEMINI_TEMPERATURE

# LLM 설정
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    temperature=GEMINI_TEMPERATURE,
    google_api_key=GEMINI_API_KEY
) if GEMINI_API_KEY else None


def create_content_creator_agent() -> Agent:
    """
    상품 페이지 생성 에이전트 생성

    Role: 크리에이티브 디렉터
    Goal: 경쟁사 분석을 바탕으로 최적화된 상품 페이지 생성
    """

    agent = Agent(
        role="크리에이티브 디렉터 (Creative Director)",
        goal="경쟁사 인사이트를 바탕으로 매력적인 상품 페이지를 생성합니다",
        backstory="""
        당신은 10년 경력의 전자상거래 콘텐츠 크리에이터입니다.
        수백 개의 베스트셀러 상품 페이지를 제작한 경험으로,
        고객의 마음을 사로잡는 콘텐츠를 만드는 비법을 알고 있습니다.

        전문 분야:
        - 클릭률 높은 제목 작성 (키워드 최적화 + 감성 카피)
        - 시선을 사로잡는 상품 이미지 기획
        - 전환율 높은 상세페이지 구조 설계
        - 상표권 및 법적 리스크 회피

        당신이 만든 콘텐츠는 항상 데이터 기반이며,
        경쟁사 분석을 바탕으로 차별화된 가치를 전달합니다.
        """,
        tools=[
            generate_product_titles,           # Claude: 제목 3가지 생성
            generate_detail_html,              # Claude: 상세페이지 HTML 생성
            generate_product_image,            # Imagen 3: 이미지 생성
            generate_image_from_competitor_analysis  # Imagen 3: 스타일 기반 이미지 생성
        ],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        memory=True
    )

    return agent


def create_content_generation_task(
    product_name: str,
    golden_keywords: List[str],
    competitor_analysis: Dict[str, Any]
) -> Task:
    """
    콘텐츠 생성 Task 생성

    Args:
        product_name: 상품명 (예: "무선 블루투스 이어폰")
        golden_keywords: 황금키워드 (예: ["TWS", "노이즈캔슬링", "30시간"])
        competitor_analysis: Agent 2의 분석 결과
            {
                'title_pattern': {...},
                'image_analysis': {...},
                'detail_structure': {...},
                'key_insights': [...],
                'value_proposition': str,
                'target_audience': str
            }

    Returns:
        Task 객체
    """

    # 분석 결과 추출
    title_pattern = competitor_analysis.get('title_pattern', {})
    image_analysis = competitor_analysis.get('image_analysis', {})
    detail_structure = competitor_analysis.get('detail_structure', {})
    value_proposition = competitor_analysis.get('value_proposition', '프리미엄 품질')
    target_audience = competitor_analysis.get('target_audience', '20-30대')

    task = Task(
        description=f"""
        다음 정보를 바탕으로 완벽한 상품 페이지를 생성하세요:

        **기본 정보:**
        - 상품명: {product_name}
        - 황금 키워드: {', '.join(golden_keywords)}

        **경쟁사 분석 인사이트:**
        - 제목 패턴: {title_pattern}
        - 이미지 스타일: {image_analysis}
        - 상세페이지 구조: {detail_structure}
        - 핵심 가치: {value_proposition}
        - 타겟 고객: {target_audience}

        **생성할 콘텐츠:**

        1. **제목 3가지 옵션**
           - generate_product_titles 도구 사용
           - 경쟁사 패턴 기반 (길이, 구조, 키워드 배치)
           - 황금 키워드 최대 2-3개 포함
           - 각 제목 최대 50자 이내
           - 브랜드명 제외 (삼성, 애플, 소니 등)

        2. **이미지 2가지 옵션**
           - generate_image_from_competitor_analysis 도구 사용
           - 경쟁사 이미지 스타일 참고 (색감, 구도, 배경)
           - 옵션 A: 경쟁사 스타일 그대로
           - 옵션 B: 약간 차별화된 스타일 (더 밝게/어둡게)

        3. **상세페이지 HTML**
           - generate_detail_html 도구 사용
           - 경쟁사 구조 참고 (섹션 순서, 강조 포인트)
           - 쿠팡/네이버 업로드용 HTML (인라인 CSS)
           - FAQ 섹션 포함 (최소 3개)
           - 이미지 플레이스홀더 포함 ({{{{IMAGE_1}}}}, {{{{IMAGE_2}}}})

        **품질 검증:**
        - ⚠️ 상표권 위험 키워드 제거 (브랜드명, 상표 등)
        - ⚠️ 과장 광고 표현 제거 ("세계 최고", "절대" 등)
        - ✅ 황금 키워드 포함 확인
        - ✅ 타겟 고객 맞춤 톤앤매너

        **출력 형식:**
        JSON 형식으로 다음 구조를 반환하세요:
        {{{{
            "titles": [
                {{{{
                    "text": "제목 텍스트",
                    "length": 25,
                    "keywords_used": ["TWS", "노이즈캔슬링"],
                    "score": 95
                }}}},
                ... (3개)
            ],
            "images": [
                {{{{
                    "url": "이미지 URL",
                    "style": "밝은 톤, 45도 각도, 흰색 배경",
                    "prompt_used": "사용된 프롬프트"
                }}}},
                ... (2개)
            ],
            "detail_html": "<div>...</div>",
            "concept": {{{{
                "value_proposition": "{value_proposition}",
                "target_audience": "{target_audience}",
                "tone": "고급스러움 + 기술력"
            }}}},
            "trademark_safe": true,
            "risky_keywords": ["제거된", "키워드", "리스트"],
            "quality_score": 95
        }}}}
        """,
        expected_output="JSON 형식의 완성된 상품 페이지 콘텐츠 (제목 + 이미지 + HTML)",
        agent=create_content_creator_agent()
    )

    return task


def run_content_generation(
    product_name: str,
    golden_keywords: List[str],
    competitor_analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    콘텐츠 생성 Crew 실행

    Args:
        product_name: 상품명
        golden_keywords: 황금키워드 리스트
        competitor_analysis: 경쟁사 분석 결과

    Returns:
        생성된 콘텐츠 딕셔너리
    """

    # Agent 및 Task 생성
    agent = create_content_creator_agent()
    task = create_content_generation_task(
        product_name,
        golden_keywords,
        competitor_analysis
    )

    # Crew 생성 및 실행
    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True
    )

    # 실행
    result = crew.kickoff()

    return result


# ============================================
# 개별 도구 직접 호출 함수들 (HITL 재생성용)
# ============================================

def regenerate_titles_only(
    product_name: str,
    golden_keywords: List[str],
    competitor_pattern: Dict[str, Any],
    max_length: int = 50,
    remove_keywords: List[str] = None
) -> List[Dict[str, Any]]:
    """
    제목만 재생성 (HITL 피드백 반영)

    Args:
        product_name: 상품명
        golden_keywords: 황금키워드
        competitor_pattern: 경쟁사 제목 패턴
        max_length: 최대 길이
        remove_keywords: 제거할 키워드 리스트

    Returns:
        새로운 제목 3가지
    """
    # 제거할 키워드 필터링
    if remove_keywords:
        golden_keywords = [k for k in golden_keywords if k not in remove_keywords]

    return generate_product_titles(
        product_name=product_name,
        golden_keywords=golden_keywords,
        competitor_patterns=competitor_pattern,
        max_length=max_length
    )


def regenerate_images_only(
    product_name: str,
    competitor_style: Dict[str, Any],
    style_modifications: List[str] = None
) -> List[Dict[str, Any]]:
    """
    이미지만 재생성 (HITL 피드백 반영)

    Args:
        product_name: 상품명
        competitor_style: 경쟁사 이미지 스타일
        style_modifications: 스타일 수정 사항 (예: ["더 밝게", "정면 구도"])

    Returns:
        새로운 이미지 2가지
    """
    # 스타일 수정 반영
    modified_style = competitor_style.copy()

    if style_modifications:
        for mod in style_modifications:
            if "밝게" in mod:
                modified_style['color_tone'] = "매우 밝은 톤"
            if "어둡게" in mod:
                modified_style['color_tone'] = "어두운 톤"
            if "정면" in mod:
                modified_style['composition'] = "정면 클로즈업"

    # 이미지 2개 생성
    image1 = generate_image_from_competitor_analysis(
        product_name=product_name,
        competitor_style=modified_style
    )

    # 두 번째 이미지는 약간 변형
    style2 = modified_style.copy()
    style2['composition'] = "45도 각도"

    image2 = generate_image_from_competitor_analysis(
        product_name=product_name,
        competitor_style=style2
    )

    return [image1, image2]


def regenerate_html_only(
    product_name: str,
    features: List[str],
    value_proposition: str,
    target_audience: str,
    competitor_structure: Dict[str, Any]
) -> str:
    """
    HTML만 재생성 (HITL 피드백 반영)

    Args:
        product_name: 상품명
        features: 주요 특징
        value_proposition: 핵심 가치
        target_audience: 타겟 고객
        competitor_structure: 경쟁사 구조

    Returns:
        새로운 HTML
    """
    return generate_detail_html(
        product_name=product_name,
        features=features,
        value_proposition=value_proposition,
        target_audience=target_audience,
        competitor_structure=competitor_structure
    )


# ============================================
# 테스트/디버깅용 함수
# ============================================

def test_content_creation():
    """
    콘텐츠 생성 테스트 함수
    """
    print("=== Agent 3: 콘텐츠 생성 테스트 시작 ===")

    # Mock 데이터
    product_name = "무선 블루투스 이어폰"
    golden_keywords = ["TWS", "노이즈캔슬링", "30시간 재생"]

    competitor_analysis = {
        "title_pattern": {
            "length": 45,
            "pattern": "기능 + 제품명 + 특징",
            "keywords": ["TWS", "블루투스"],
            "has_numbers": True,
            "has_emoji": False
        },
        "image_analysis": {
            "color_tone": "밝은 톤",
            "composition": "45도 각도",
            "text_overlay": None,
            "style_keywords": ["고급스러움", "미니멀"],
            "background": "흰색",
            "lighting": "밝은 스튜디오 조명"
        },
        "detail_structure": {
            "sections": ["제품 소개", "주요 특징", "FAQ", "스펙"],
            "emphasis_points": ["30시간 재생", "노이즈캔슬링"],
            "has_comparison_table": False,
            "has_faq": True
        },
        "key_insights": [
            "제목에 숫자 포함으로 구체성 강조",
            "이미지는 밝은 톤 + 45도 각도",
            "FAQ 섹션으로 신뢰도 확보"
        ],
        "value_proposition": "30시간 재생으로 출퇴근 걱정 끝",
        "target_audience": "20-30대 출퇴근족"
    }

    print(f"상품명: {product_name}")
    print(f"황금키워드: {golden_keywords}")
    print(f"경쟁사 인사이트: {competitor_analysis['key_insights']}\\n")

    # 실행
    result = run_content_generation(
        product_name=product_name,
        golden_keywords=golden_keywords,
        competitor_analysis=competitor_analysis
    )

    print("\\n=== 생성 결과 ===")
    print(result)

    return result


if __name__ == "__main__":
    # 테스트 실행
    test_content_creation()
