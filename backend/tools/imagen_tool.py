"""
Imagen 3 Tool
상품 이미지를 생성하는 도구 (Google Vertex AI Imagen 3 사용)
"""

from crewai_tools import tool
from typing import Dict, Any, List
import os
import sys

# Config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import IMAGEN_MODEL, GEMINI_API_KEY, IMAGEN_ASPECT_RATIO, IMAGEN_NUMBER_OF_IMAGES

# Vertex AI 초기화
try:
    import google.generativeai as genai
    from vertexai.preview.vision_models import ImageGenerationModel
    import vertexai

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        # Vertex AI 초기화 (프로젝트 설정 필요)
        # vertexai.init(project="your-project-id", location="us-central1")
except ImportError:
    print("⚠️  google-generativeai 또는 vertexai 패키지가 설치되지 않았습니다.")
    print("   pip install google-generativeai google-cloud-aiplatform")


@tool("Imagen 3 Image Generator")
def generate_product_image(
    prompt: str,
    style_guide: str = "고급스러운 상품 촬영 스타일, 밝은 배경, 45도 각도",
    negative_prompt: str = "저품질, 흐릿한, 워터마크"
) -> Dict[str, Any]:
    """
    Imagen 3를 사용하여 상품 이미지를 생성합니다.

    Args:
        prompt: 이미지 생성 프롬프트 (예: "무선 이어폰, 흰색 배경, 제품 중심")
        style_guide: 스타일 가이드 (예: "고급스러운, 밝은 톤, 45도 각도")
        negative_prompt: 제외할 요소 (예: "저품질, 흐릿한")

    Returns:
        {
            'image_url': str,          # 생성된 이미지 URL
            'prompt_used': str,        # 사용된 프롬프트
            'model': str,              # 사용된 모델명
            'style': str,              # 스타일 설명
            'aspect_ratio': str        # 비율 (1:1, 3:4, 16:9)
        }
    """

    if not GEMINI_API_KEY:
        return _get_mock_image_data(prompt, style_guide)

    try:
        # 전체 프롬프트 조합
        full_prompt = f"{prompt}, {style_guide}"

        # TODO: 실제 Vertex AI Imagen 3 호출
        # Vertex AI는 프로젝트 설정이 필요하므로, 현재는 Mock 데이터 반환
        # 실제 구현 시:
        # model = ImageGenerationModel.from_pretrained(IMAGEN_MODEL)
        # response = model.generate_images(
        #     prompt=full_prompt,
        #     negative_prompt=negative_prompt,
        #     number_of_images=1,
        #     aspect_ratio=IMAGEN_ASPECT_RATIO
        # )
        # image_url = response.images[0].url

        print(f"📸 Imagen 3 호출: {IMAGEN_MODEL}")
        print(f"   프롬프트: {full_prompt}")

        # Mock 데이터 반환 (실제 API 연동 전까지)
        return _get_mock_image_data(prompt, style_guide)

    except Exception as e:
        print(f"Imagen 3 오류: {e}")
        return _get_mock_image_data(prompt, style_guide)


@tool("Imagen 3 Batch Generator")
def generate_multiple_product_images(
    prompts: List[str],
    style_guide: str = "고급스러운 상품 촬영 스타일"
) -> List[Dict[str, Any]]:
    """
    여러 이미지를 동시에 생성합니다.

    Args:
        prompts: 이미지 프롬프트 리스트
        style_guide: 공통 스타일 가이드

    Returns:
        각 이미지의 생성 결과 리스트
    """
    results = []
    for prompt in prompts:
        result = generate_product_image(prompt, style_guide)
        results.append(result)

    return results


@tool("Style-Aware Image Generator")
def generate_image_from_competitor_analysis(
    product_name: str,
    competitor_style: Dict[str, Any]
) -> Dict[str, Any]:
    """
    경쟁사 이미지 분석 결과를 기반으로 유사한 스타일의 이미지를 생성합니다.

    Args:
        product_name: 상품명 (예: "무선 이어폰")
        competitor_style: 경쟁사 이미지 분석 결과 (vision_tool의 출력)
            {
                'color_tone': '밝은 톤',
                'composition': '45도 각도',
                'background': '흰색',
                'lighting': '밝은 스튜디오 조명'
            }

    Returns:
        생성된 이미지 정보
    """

    # 경쟁사 스타일 기반 프롬프트 생성
    color_tone = competitor_style.get('color_tone', '밝은 톤')
    composition = competitor_style.get('composition', '45도 각도')
    background = competitor_style.get('background', '흰색')
    lighting = competitor_style.get('lighting', '밝은 조명')

    prompt = f"{product_name}, {background} 배경, {composition}, {color_tone}"
    style_guide = f"{lighting}, 상품 촬영, 고품질, 프로페셔널"

    print(f"🎨 경쟁사 스타일 기반 이미지 생성")
    print(f"   스타일: {color_tone} + {composition} + {background}")

    return generate_product_image(prompt, style_guide)


def _get_mock_image_data(prompt: str, style_guide: str) -> Dict[str, Any]:
    """
    개발/테스트용 Mock 데이터
    실제 Imagen API 연동 전까지 사용
    """
    return {
        "image_url": "https://via.placeholder.com/1024x1024.png?text=Generated+Product+Image",
        "prompt_used": f"{prompt}, {style_guide}",
        "model": IMAGEN_MODEL,
        "style": style_guide,
        "aspect_ratio": IMAGEN_ASPECT_RATIO,
        "source": "mock",
        "note": "실제 Imagen 3 API 연동 시 실제 이미지 URL로 대체됩니다."
    }


# ============================================
# 실제 Vertex AI Imagen 3 연동 예시 코드
# ============================================

def _generate_imagen_real(prompt: str, style_guide: str) -> str:
    """
    실제 Vertex AI Imagen 3 호출 예시
    사용 전 Vertex AI 프로젝트 설정 필요:

    1. Google Cloud Console에서 프로젝트 생성
    2. Vertex AI API 활성화
    3. 인증 설정 (gcloud auth application-default login)
    4. vertexai.init(project="your-project-id", location="us-central1")
    """

    # from vertexai.preview.vision_models import ImageGenerationModel

    # model = ImageGenerationModel.from_pretrained(IMAGEN_MODEL)

    # full_prompt = f"{prompt}, {style_guide}"

    # response = model.generate_images(
    #     prompt=full_prompt,
    #     negative_prompt="low quality, blurry, watermark",
    #     number_of_images=IMAGEN_NUMBER_OF_IMAGES,
    #     aspect_ratio=IMAGEN_ASPECT_RATIO,
    #     safety_filter_level="block_some",
    #     person_generation="allow_adult"
    # )

    # # 첫 번째 이미지 반환
    # image = response.images[0]
    #
    # # 이미지 저장
    # image_path = f"/tmp/generated_{datetime.now().timestamp()}.png"
    # image.save(image_path)
    #
    # # Cloud Storage에 업로드 후 URL 반환
    # # ... (GCS 업로드 로직)
    #
    # return image_url

    pass


# ============================================
# 테스트/디버깅용 함수
# ============================================

def test_imagen_generation():
    """Imagen 이미지 생성 테스트"""
    print("=== Imagen 3 이미지 생성 테스트 시작 ===")

    # 테스트 1: 기본 생성
    result1 = generate_product_image(
        prompt="무선 블루투스 이어폰, 검은색, 제품 중심",
        style_guide="고급스러운, 밝은 배경, 45도 각도"
    )
    print(f"\n[테스트 1] 기본 생성: {result1}")

    # 테스트 2: 경쟁사 스타일 기반 생성
    competitor_style = {
        "color_tone": "밝은 톤",
        "composition": "45도 각도",
        "background": "흰색",
        "lighting": "밝은 스튜디오 조명"
    }
    result2 = generate_image_from_competitor_analysis(
        product_name="TWS 이어폰",
        competitor_style=competitor_style
    )
    print(f"\n[테스트 2] 스타일 기반 생성: {result2}")

    # 테스트 3: 배치 생성
    prompts = [
        "무선 이어폰, 흰색 배경",
        "무선 이어폰, 사용 중인 모습",
        "무선 이어폰, 충전 케이스"
    ]
    result3 = generate_multiple_product_images(prompts)
    print(f"\n[테스트 3] 배치 생성: {len(result3)}개 이미지")

    return result1, result2, result3


if __name__ == "__main__":
    # 테스트 실행
    test_imagen_generation()
