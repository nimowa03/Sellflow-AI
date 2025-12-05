"""
Claude API Tool
상품 페이지 콘텐츠(제목, 상세설명 HTML)를 생성하는 도구
Claude는 한국어 콘텐츠 생성에 특화되어 있음
"""

from crewai_tools import tool
from typing import Dict, Any, List
import os
import sys
import json

# Config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import CLAUDE_MODEL, CLAUDE_API_KEY, CLAUDE_TEMPERATURE

# Anthropic Claude 초기화
try:
    import anthropic

    if CLAUDE_API_KEY:
        claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
except ImportError:
    print("⚠️  anthropic 패키지가 설치되지 않았습니다.")
    print("   pip install anthropic")
    claude_client = None


@tool("Claude Title Generator")
def generate_product_titles(
    product_name: str,
    golden_keywords: List[str],
    competitor_patterns: Dict[str, Any],
    max_length: int = 50
) -> List[Dict[str, Any]]:
    """
    Claude를 사용하여 상품 제목 3가지 옵션을 생성합니다.

    Args:
        product_name: 상품명 (예: "무선 블루투스 이어폰")
        golden_keywords: 황금키워드 리스트 (예: ["TWS", "노이즈캔슬링", "30시간"])
        competitor_patterns: 경쟁사 제목 패턴 분석 결과
            {
                'length': 45,
                'pattern': '기능 + 제품명 + 특징',
                'keywords': ['TWS', '블루투스'],
                'has_numbers': True,
                'has_emoji': False
            }
        max_length: 최대 길자 수 (기본 50자)

    Returns:
        [
            {
                'text': '노이즈캔슬링 TWS 블루투스 이어폰 30시간 재생',
                'length': 25,
                'keywords_used': ['TWS', '노이즈캔슬링', '30시간'],
                'score': 95
            },
            ...
        ]
    """

    if not CLAUDE_API_KEY or not claude_client:
        return _get_mock_titles(product_name, golden_keywords)

    try:
        # 프롬프트 생성
        prompt = f"""
당신은 전자상거래 마케팅 전문가입니다. 다음 정보를 바탕으로 매력적인 상품 제목 3가지를 생성해주세요.

**상품 정보:**
- 제품명: {product_name}
- 황금 키워드: {', '.join(golden_keywords)}

**경쟁사 제목 패턴 분석:**
- 평균 길이: {competitor_patterns.get('length', 40)}자
- 패턴: {competitor_patterns.get('pattern', '기능 + 제품명 + 특징')}
- 주요 키워드: {', '.join(competitor_patterns.get('keywords', []))}
- 숫자 사용: {'예' if competitor_patterns.get('has_numbers') else '아니오'}
- 이모지 사용: {'예' if competitor_patterns.get('has_emoji') else '아니오'}

**제약 조건:**
1. 최대 {max_length}자 이내
2. 황금 키워드를 최대한 많이 포함 (최소 2개)
3. 숫자로 구체성 강조 (예: "30시간 재생")
4. 브랜드명 제외 (삼성, 애플, 소니 등)
5. 쿠팡/네이버 검색 최적화

**출력 형식:**
JSON 배열로 3가지 제목 반환:
[
    {{
        "text": "제목 텍스트",
        "length": 글자수,
        "keywords_used": ["사용된", "키워드", "리스트"],
        "score": 예상품질점수(0-100)
    }},
    ...
]

반드시 JSON 형식으로만 응답하세요. 추가 설명 없이 JSON만 반환하세요.
"""

        # Claude API 호출
        message = claude_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            temperature=CLAUDE_TEMPERATURE,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # 응답 파싱
        response_text = message.content[0].text

        # JSON 추출 (```json ... ``` 형식 처리)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]

        titles = json.loads(response_text.strip())

        print(f"✍️  Claude 제목 생성 완료: {CLAUDE_MODEL}")
        print(f"   생성된 제목 수: {len(titles)}개")

        return titles

    except Exception as e:
        print(f"Claude 제목 생성 오류: {e}")
        return _get_mock_titles(product_name, golden_keywords)


@tool("Claude Detail HTML Generator")
def generate_detail_html(
    product_name: str,
    features: List[str],
    value_proposition: str,
    target_audience: str,
    competitor_structure: Dict[str, Any]
) -> str:
    """
    Claude를 사용하여 상세페이지 HTML을 생성합니다.

    Args:
        product_name: 상품명
        features: 주요 특징 리스트 (예: ["30시간 재생", "노이즈캔슬링"])
        value_proposition: 핵심 가치 제안 (예: "출퇴근 걱정 끝")
        target_audience: 타겟 고객 (예: "20-30대 출퇴근족")
        competitor_structure: 경쟁사 상세페이지 구조
            {
                'sections': ['제품 소개', '주요 특징', 'FAQ', '스펙'],
                'emphasis_points': ['30시간 재생', '노이즈캔슬링'],
                'has_comparison_table': True,
                'has_faq': True
            }

    Returns:
        쿠팡/네이버 업로드용 HTML 문자열
    """

    if not CLAUDE_API_KEY or not claude_client:
        return _get_mock_html(product_name, features)

    try:
        sections = competitor_structure.get('sections', ['제품 소개', '주요 특징', 'FAQ'])
        emphasis = competitor_structure.get('emphasis_points', [])

        prompt = f"""
당신은 전자상거래 상세페이지 제작 전문가입니다. 다음 정보로 매력적인 상세페이지 HTML을 생성해주세요.

**상품 정보:**
- 제품명: {product_name}
- 핵심 가치: {value_proposition}
- 타겟 고객: {target_audience}
- 주요 특징: {', '.join(features)}

**경쟁사 구조 분석:**
- 섹션 순서: {' → '.join(sections)}
- 강조 포인트: {', '.join(emphasis)}
- 비교표 포함: {'예' if competitor_structure.get('has_comparison_table') else '아니오'}
- FAQ 포함: {'예' if competitor_structure.get('has_faq') else '아니오'}

**요구사항:**
1. 쿠팡/네이버 상세페이지용 HTML (인라인 CSS 사용)
2. 섹션 구성: {' → '.join(sections)}
3. 각 특징을 시각적으로 강조 (아이콘, 색상 활용)
4. 반응형 디자인 (모바일 최적화)
5. 이미지 플레이스홀더 포함 ({{IMAGE_1}}, {{IMAGE_2}} 형식)
6. FAQ 섹션 포함 (최소 3개 질문)

**디자인 가이드:**
- 색상: 깔끔한 화이트/그레이 톤
- 폰트: 고딕체, 16px 기본
- 레이아웃: 중앙 정렬, 최대 너비 1000px
- 강조: 핵심 포인트는 큰 폰트 + 볼드

HTML만 반환하세요. 추가 설명 없이 <div>...</div> 형식으로만 응답하세요.
"""

        # Claude API 호출
        message = claude_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=4096,
            temperature=CLAUDE_TEMPERATURE,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        html = message.content[0].text.strip()

        # HTML 코드 블록 제거 (```html ... ``` 형식 처리)
        if "```html" in html:
            html = html.split("```html")[1].split("```")[0].strip()
        elif "```" in html:
            html = html.split("```")[1].split("```")[0].strip()

        print(f"✍️  Claude HTML 생성 완료: {CLAUDE_MODEL}")
        print(f"   HTML 길이: {len(html)} 문자")

        return html

    except Exception as e:
        print(f"Claude HTML 생성 오류: {e}")
        return _get_mock_html(product_name, features)


@tool("Claude Feedback Parser")
def parse_user_feedback(feedback_text: str) -> Dict[str, Any]:
    """
    사용자의 자연어 피드백을 파싱하여 구조화된 액션으로 변환합니다.

    Args:
        feedback_text: 자연어 피드백 (예: "제목을 25자로 줄이고 이미지를 더 밝게 해줘")

    Returns:
        {
            'action': 'regenerate_title',  # 또는 regenerate_image, modify_title
            'target': 'title',
            'parameters': {'max_length': 25, 'style_changes': ['더 밝게']}
        }
    """

    if not CLAUDE_API_KEY or not claude_client:
        return _get_mock_feedback_parse(feedback_text)

    try:
        prompt = f"""
다음 사용자 피드백을 분석하여 구조화된 액션으로 변환해주세요.

**피드백:**
"{feedback_text}"

**가능한 액션:**
- regenerate_title: 제목 재생성
- regenerate_image: 이미지 재생성
- regenerate_html: HTML 재생성
- modify_title: 제목 수정
- remove_keyword: 특정 키워드 제거
- approve: 승인
- reject: 거부

**출력 형식:**
JSON 형식으로 반환:
{{
    "action": "액션명",
    "target": "title/image/html",
    "parameters": {{
        "max_length": 25,
        "remove_keywords": ["삼성", "애플"],
        "style_changes": ["더 밝게", "45도 각도"]
    }}
}}

반드시 JSON 형식으로만 응답하세요.
"""

        message = claude_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=512,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text

        # JSON 추출
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]

        parsed = json.loads(response_text.strip())

        print(f"✍️  Claude 피드백 파싱 완료")
        print(f"   액션: {parsed.get('action')}")

        return parsed

    except Exception as e:
        print(f"Claude 피드백 파싱 오류: {e}")
        return _get_mock_feedback_parse(feedback_text)


# ============================================
# Mock 데이터 함수들
# ============================================

def _get_mock_titles(product_name: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """Mock 제목 데이터"""
    return [
        {
            "text": f"{keywords[0] if keywords else ''} {product_name} 30시간 재생",
            "length": len(f"{keywords[0] if keywords else ''} {product_name} 30시간 재생"),
            "keywords_used": keywords[:2],
            "score": 95
        },
        {
            "text": f"초장시간 {product_name} {keywords[1] if len(keywords) > 1 else ''}",
            "length": len(f"초장시간 {product_name} {keywords[1] if len(keywords) > 1 else ''}"),
            "keywords_used": keywords[:1],
            "score": 88
        },
        {
            "text": f"{product_name} 프리미엄 {keywords[0] if keywords else ''}",
            "length": len(f"{product_name} 프리미엄 {keywords[0] if keywords else ''}"),
            "keywords_used": keywords[:1],
            "score": 82
        }
    ]


def _get_mock_html(product_name: str, features: List[str]) -> str:
    """Mock HTML 데이터"""
    features_html = "".join([f"<li>{feature}</li>" for feature in features])

    return f"""
<div style="max-width: 1000px; margin: 0 auto; font-family: 'Malgun Gothic', sans-serif;">
    <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h1 style="font-size: 32px; margin-bottom: 10px;">{product_name}</h1>
        <p style="font-size: 18px;">프리미엄 품질, 합리적 가격</p>
    </div>

    <div style="padding: 40px 20px;">
        <h2 style="font-size: 24px; margin-bottom: 20px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">제품 소개</h2>
        <p style="font-size: 16px; line-height: 1.8; color: #333;">
            {{IMAGE_1}}
            <br><br>
            최고의 품질과 성능을 자랑하는 {product_name}입니다.
        </p>
    </div>

    <div style="padding: 40px 20px; background: #f8f9fa;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">주요 특징</h2>
        <ul style="font-size: 16px; line-height: 2;">
            {features_html}
        </ul>
    </div>

    <div style="padding: 40px 20px;">
        <h2 style="font-size: 24px; margin-bottom: 20px;">자주 묻는 질문</h2>
        <div style="margin-bottom: 20px;">
            <p style="font-weight: bold; font-size: 16px;">Q: 배터리 시간은 얼마나 되나요?</p>
            <p style="font-size: 16px; color: #666;">A: 최대 30시간 연속 재생이 가능합니다.</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p style="font-weight: bold; font-size: 16px;">Q: 방수 기능이 있나요?</p>
            <p style="font-size: 16px; color: #666;">A: IPX7 등급 방수를 지원합니다.</p>
        </div>
    </div>
</div>
"""


def _get_mock_feedback_parse(feedback: str) -> Dict[str, Any]:
    """Mock 피드백 파싱 데이터"""
    return {
        "action": "regenerate_title",
        "target": "title",
        "parameters": {
            "max_length": 25,
            "remove_keywords": [],
            "style_changes": []
        }
    }


# ============================================
# 테스트/디버깅용 함수
# ============================================

def test_claude_tools():
    """Claude Tool 테스트"""
    print("=== Claude API Tool 테스트 시작 ===")

    # 테스트 1: 제목 생성
    titles = generate_product_titles(
        product_name="무선 블루투스 이어폰",
        golden_keywords=["TWS", "노이즈캔슬링", "30시간"],
        competitor_patterns={
            "length": 45,
            "pattern": "기능 + 제품명 + 특징",
            "keywords": ["TWS", "블루투스"],
            "has_numbers": True,
            "has_emoji": False
        }
    )
    print(f"\n[테스트 1] 제목 생성: {len(titles)}개")
    for i, title in enumerate(titles, 1):
        print(f"  {i}. {title['text']} ({title['length']}자)")

    # 테스트 2: HTML 생성
    html = generate_detail_html(
        product_name="TWS 블루투스 이어폰",
        features=["30시간 재생", "노이즈캔슬링", "IPX7 방수"],
        value_proposition="출퇴근 걱정 끝",
        target_audience="20-30대 출퇴근족",
        competitor_structure={
            "sections": ["제품 소개", "주요 특징", "FAQ"],
            "emphasis_points": ["30시간 재생"],
            "has_faq": True
        }
    )
    print(f"\n[테스트 2] HTML 생성: {len(html)} 문자")

    # 테스트 3: 피드백 파싱
    feedback = parse_user_feedback("제목을 25자로 줄이고 이미지를 더 밝게 해줘")
    print(f"\n[테스트 3] 피드백 파싱: {feedback}")

    return titles, html, feedback


if __name__ == "__main__":
    # 테스트 실행
    test_claude_tools()
