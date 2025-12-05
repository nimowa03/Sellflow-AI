"""
Gemini Vision Tool
이미지를 분석하여 스타일, 색감, 구도 등을 추출
"""

from crewai_tools import tool
from typing import Dict, Any, List
import os
import google.generativeai as genai
from PIL import Image
import requests
from io import BytesIO


# Gemini API 초기화
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


@tool("Gemini Vision Analyzer")
def analyze_product_image(image_url: str) -> Dict[str, Any]:
    """
    상품 이미지를 분석하여 스타일, 색감, 구도, 텍스트 오버레이 등을 추출합니다.

    Args:
        image_url: 분석할 이미지 URL

    Returns:
        {
            'color_tone': str,        # 색감 (예: '밝은 톤', '파스텔 톤')
            'composition': str,       # 구도 (예: '45도 각도', '정면 클로즈업')
            'text_overlay': str,      # 텍스트 오버레이 (예: '30% OFF')
            'style_keywords': List[str],  # 스타일 키워드
            'background': str,        # 배경 (예: '흰색', '그라데이션')
            'lighting': str          # 조명 (예: '밝은 자연광', '스튜디오 조명')
        }
    """

    if not GEMINI_API_KEY:
        return _get_mock_vision_data(image_url)

    try:
        # 이미지 다운로드
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))

        # Gemini Vision 모델 호출
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = """
        이 상품 이미지를 분석하여 다음 정보를 JSON 형식으로 추출해주세요:

        1. color_tone: 이미지의 전반적인 색감 (예: '밝은 톤', '파스텔 톤', '비비드')
        2. composition: 촬영 구도 (예: '45도 각도', '정면 클로즈업', '측면 뷰')
        3. text_overlay: 이미지에 포함된 텍스트 (예: '30% OFF', '신상품', 없으면 null)
        4. style_keywords: 스타일을 설명하는 키워드 3-5개 (배열)
        5. background: 배경 설명 (예: '흰색', '그라데이션', '실제 환경')
        6. lighting: 조명 스타일 (예: '밝은 자연광', '스튜디오 조명', '부드러운 간접조명')

        반드시 JSON 형식으로만 응답하세요.
        """

        response = model.generate_content([prompt, image])
        result_text = response.text

        # JSON 파싱
        import json
        # Gemini는 때때로 ```json ... ``` 형식으로 반환하므로 정리
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]

        analysis = json.loads(result_text.strip())

        return {
            **analysis,
            "source": "gemini-vision",
            "image_url": image_url
        }

    except Exception as e:
        print(f"Gemini Vision 오류: {e}")
        return _get_mock_vision_data(image_url)


@tool("Gemini Vision Batch Analyzer")
def analyze_multiple_images(image_urls: List[str]) -> List[Dict[str, Any]]:
    """
    여러 이미지를 동시에 분석합니다.

    Args:
        image_urls: 분석할 이미지 URL 리스트

    Returns:
        각 이미지의 분석 결과 리스트
    """
    results = []
    for url in image_urls:
        analysis = analyze_product_image(url)
        results.append(analysis)

    return results


@tool("Gemini Vision Comparison")
def compare_product_images(image_urls: List[str]) -> Dict[str, Any]:
    """
    여러 경쟁사 이미지를 비교 분석하여 공통 패턴을 찾습니다.

    Args:
        image_urls: 비교할 이미지 URL 리스트 (2-5개)

    Returns:
        {
            'common_patterns': List[str],   # 공통 패턴
            'color_trend': str,              # 색감 트렌드
            'composition_trend': str,        # 구도 트렌드
            'text_usage': str,               # 텍스트 사용 패턴
            'recommendation': str            # 추천 스타일
        }
    """

    # 각 이미지 개별 분석
    analyses = analyze_multiple_images(image_urls)

    # 공통 패턴 추출 (간단한 통계 분석)
    color_tones = [a.get('color_tone', '') for a in analyses]
    compositions = [a.get('composition', '') for a in analyses]
    backgrounds = [a.get('background', '') for a in analyses]

    # 가장 많이 나타나는 패턴 찾기
    from collections import Counter

    common_color = Counter(color_tones).most_common(1)[0][0] if color_tones else "밝은 톤"
    common_composition = Counter(compositions).most_common(1)[0][0] if compositions else "45도 각도"
    common_background = Counter(backgrounds).most_common(1)[0][0] if backgrounds else "흰색"

    return {
        "common_patterns": [
            f"색감: {common_color}",
            f"구도: {common_composition}",
            f"배경: {common_background}"
        ],
        "color_trend": common_color,
        "composition_trend": common_composition,
        "text_usage": "간결한 강조 문구 (30% 이상 사용)",
        "recommendation": f"{common_color} + {common_composition} + {common_background} 조합 추천",
        "source": "gemini-vision-comparison"
    }


def _get_mock_vision_data(image_url: str) -> Dict[str, Any]:
    """
    개발/테스트용 Mock 데이터
    """
    return {
        "color_tone": "밝은 톤",
        "composition": "45도 각도",
        "text_overlay": "30% OFF",
        "style_keywords": ["고급스러움", "미니멀", "깔끔한"],
        "background": "흰색",
        "lighting": "밝은 스튜디오 조명",
        "source": "mock",
        "image_url": image_url
    }
