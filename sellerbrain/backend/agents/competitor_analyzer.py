"""
Agent 2: 경쟁사 페이지 분석 에이전트
베스트셀러 상품 페이지를 분석하여 '왜 잘 팔리는가' 인사이트 도출
"""

from crewai import Agent, Task, Crew
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Dict, Any, List
import os

# Tools import
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.apify_tool import apify_crawl_product
from tools.vision_tool import analyze_product_image, compare_product_images


# LLM 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0.3,
    google_api_key=GEMINI_API_KEY
)


def create_competitor_analysis_agent() -> Agent:
    """
    경쟁사 페이지 분석 에이전트 생성

    Role: 마켓 스트래티지스트
    Goal: 베스트셀러 상품 페이지를 분석하여 성공 요인 추출
    """

    agent = Agent(
        role="마켓 스트래티지스트 (Market Strategist)",
        goal="베스트셀러 상품 페이지를 분석하여 '왜 잘 팔리는가' 인사이트를 제공합니다",
        backstory="""
        당신은 10년 경력의 전자상거래 마케팅 전문가입니다.
        수천 개의 베스트셀러 상품을 분석한 경험으로, 성공하는 상품 페이지의 패턴을 정확히 파악합니다.

        전문 분야:
        - 제목 패턴 분석 (키워드 배치, 길이, 구조)
        - 이미지 스타일 분석 (색감, 구도, 텍스트 오버레이)
        - 상세페이지 구조 분석 (섹션 순서, 강조 포인트)
        - 타겟 고객 및 가치 제안 추출

        당신의 인사이트는 데이터에 기반하며, 항상 실행 가능한 조언을 제공합니다.
        """,
        tools=[
            apify_crawl_product,          # 상품 페이지 크롤링
            analyze_product_image,         # 단일 이미지 분석
            compare_product_images         # 여러 이미지 비교
        ],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        memory=True  # 과거 분석 패턴 기억
    )

    return agent


def create_analysis_task(competitor_url: str, golden_keywords: List[str]) -> Task:
    """
    경쟁사 분석 Task 생성

    Args:
        competitor_url: 분석할 베스트셀러 상품 URL
        golden_keywords: 이전 Agent가 발굴한 황금키워드 (컨텍스트용)

    Returns:
        Task 객체
    """

    task = Task(
        description=f"""
        다음 베스트셀러 상품 페이지를 철저히 분석하여 인사이트를 도출하세요:

        **분석 대상 URL**: {competitor_url}
        **황금 키워드 컨텍스트**: {', '.join(golden_keywords)}

        **분석 항목**:

        1. **제목 패턴 분석**
           - 전체 제목 길이 (글자 수)
           - 제목 구조 패턴 파악 (예: "기능 + 제품명 + 특징")
           - 포함된 핵심 키워드 추출
           - 숫자/이모지 사용 여부

        2. **이미지 스타일 분석**
           - 메인 이미지 및 서브 이미지 모두 분석
           - 색감 톤 (밝은/어두운/파스텔/비비드)
           - 촬영 구도 (정면/45도/측면/클로즈업)
           - 텍스트 오버레이 유무 및 내용
           - 배경 스타일 (흰색/실제 환경/그라데이션)

        3. **상세페이지 구조 분석**
           - 섹션 순서 파악 (예: 제품 소개 → 주요 특징 → FAQ → 스펙)
           - 강조되는 핵심 포인트 (예: "30시간 재생", "노이즈캔슬링")
           - 비교표 포함 여부
           - FAQ 포함 여부

        4. **핵심 인사이트 도출**
           - 이 상품이 왜 잘 팔리는가? (최소 3가지)
           - 핵심 가치 제안 (Value Proposition) 1문장
           - 타겟 고객 정의 (연령, 직업, 라이프스타일)

        **도구 사용 지침**:
        - apify_crawl_product로 상품 정보 크롤링
        - analyze_product_image로 각 이미지 분석
        - 모든 분석 결과를 종합하여 구조화된 인사이트 제공

        **출력 형식**:
        JSON 형식으로 다음 구조를 반환하세요:
        {{
            "title_pattern": {{
                "length": int,
                "pattern": str,
                "keywords": [str],
                "has_numbers": bool,
                "has_emoji": bool
            }},
            "image_analysis": {{
                "color_tone": str,
                "composition": str,
                "text_overlay": str or null,
                "style_keywords": [str],
                "background": str,
                "lighting": str
            }},
            "detail_structure": {{
                "sections": [str],
                "emphasis_points": [str],
                "has_comparison_table": bool,
                "has_faq": bool
            }},
            "key_insights": [str],  # 최소 3개
            "value_proposition": str,
            "target_audience": str
        }}
        """,
        expected_output="JSON 형식의 상세 분석 결과",
        agent=create_competitor_analysis_agent()
    )

    return task


def run_competitor_analysis(competitor_url: str, golden_keywords: List[str]) -> Dict[str, Any]:
    """
    경쟁사 분석 Crew 실행

    Args:
        competitor_url: 분석할 URL
        golden_keywords: 황금키워드 리스트

    Returns:
        분석 결과 딕셔너리
    """

    # Agent 및 Task 생성
    agent = create_competitor_analysis_agent()
    task = create_analysis_task(competitor_url, golden_keywords)

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
# 테스트/디버깅용 함수
# ============================================

def test_competitor_analysis():
    """
    경쟁사 분석 테스트 함수
    """
    test_url = "https://www.coupang.com/vp/products/123456"
    test_keywords = ["블루투스 이어폰", "TWS", "노이즈캔슬링"]

    print("=== Agent 2: 경쟁사 분석 테스트 시작 ===")
    print(f"URL: {test_url}")
    print(f"Keywords: {test_keywords}\n")

    result = run_competitor_analysis(test_url, test_keywords)

    print("\n=== 분석 결과 ===")
    print(result)

    return result


if __name__ == "__main__":
    # 테스트 실행
    test_competitor_analysis()
