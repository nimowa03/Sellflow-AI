"""
중앙 집중식 AI 모델 설정 파일
모든 AI 모델명을 한 곳에서 관리하여 쉽게 업데이트 가능

🔧 모델 업데이트 방법:
1. Google AI Studio (https://aistudio.google.com/) 또는 Anthropic Console에서 최신 모델명 확인
2. 아래 환경변수를 .env 파일에 추가하거나
3. 이 파일의 기본값을 직접 수정

예시:
    GEMINI_MODEL=gemini-2.0-flash-exp
    IMAGEN_MODEL=imagen-3.0-generate-001
    CLAUDE_MODEL=claude-3-5-sonnet-20241022
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# Google AI 모델 설정
# ============================================

# Gemini 텍스트/분석 모델
# 최신 모델: https://ai.google.dev/models/gemini
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-1.5-pro"  # 기본값 (안정 버전)
    # "gemini-2.0-flash-exp"  # 실험 버전 (2025년 초 출시)
)

# Gemini Vision 모델 (이미지 분석)
GEMINI_VISION_MODEL = os.getenv(
    "GEMINI_VISION_MODEL",
    "gemini-1.5-flash"  # Vision 작업용 빠른 모델
)

# Imagen 이미지 생성 모델
# 최신 모델: https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview
IMAGEN_MODEL = os.getenv(
    "IMAGEN_MODEL",
    "imagen-3.0-generate-001"  # Imagen 3 (2024년 출시)
)

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ============================================
# Anthropic Claude 모델 설정
# ============================================

# Claude 모델 (한국어 콘텐츠 생성 특화)
# 최신 모델: https://docs.anthropic.com/claude/docs/models-overview
CLAUDE_MODEL = os.getenv(
    "CLAUDE_MODEL",
    "claude-3-5-sonnet-20241022"  # Claude 3.5 Sonnet (2024년 10월)
)

# Claude API Key
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")


# ============================================
# 기타 설정
# ============================================

# LLM Temperature 설정
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.3"))
CLAUDE_TEMPERATURE = float(os.getenv("CLAUDE_TEMPERATURE", "0.7"))

# 이미지 생성 설정
IMAGEN_ASPECT_RATIO = os.getenv("IMAGEN_ASPECT_RATIO", "1:1")  # 1:1, 3:4, 16:9
IMAGEN_NUMBER_OF_IMAGES = int(os.getenv("IMAGEN_NUMBER_OF_IMAGES", "2"))


# ============================================
# 검증 함수
# ============================================

def validate_api_keys():
    """필수 API 키 존재 여부 확인"""
    missing_keys = []

    if not GEMINI_API_KEY:
        missing_keys.append("GEMINI_API_KEY")

    if not CLAUDE_API_KEY:
        missing_keys.append("CLAUDE_API_KEY")

    if missing_keys:
        print(f"⚠️  경고: 다음 API 키가 .env에 없습니다: {', '.join(missing_keys)}")
        print("   Mock 데이터 모드로 실행됩니다.")
        return False

    return True


def print_model_info():
    """현재 사용 중인 모델 정보 출력"""
    print("\n" + "="*50)
    print("🤖 현재 AI 모델 설정")
    print("="*50)
    print(f"📝 Gemini (분석):     {GEMINI_MODEL}")
    print(f"👁️  Gemini Vision:    {GEMINI_VISION_MODEL}")
    print(f"🎨 Imagen (이미지):   {IMAGEN_MODEL}")
    print(f"✍️  Claude (콘텐츠):   {CLAUDE_MODEL}")
    print("="*50 + "\n")
    print("💡 모델 변경 방법:")
    print("   1. .env 파일에 환경변수 추가")
    print("   2. backend/config.py 기본값 수정")
    print("="*50 + "\n")


# 앱 시작 시 모델 정보 출력 (디버깅용)
if __name__ == "__main__":
    validate_api_keys()
    print_model_info()
