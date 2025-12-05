"""
Apify 크롤링 Tool
쿠팡/네이버 상품 페이지를 크롤링하여 데이터를 수집
"""

from crewai_tools import tool
from typing import Dict, Any, List
import os
import requests


@tool("Apify Crawler")
def apify_crawl_product(product_url: str) -> Dict[str, Any]:
    """
    쿠팡/네이버 상품 페이지를 크롤링하여 상세 정보를 추출합니다.

    Args:
        product_url: 크롤링할 상품 URL (쿠팡 또는 네이버)

    Returns:
        {
            'title': str,
            'price': int,
            'rating': float,
            'reviews': int,
            'images': List[str],
            'detail_html': str,
            'features': List[str]
        }
    """

    # Apify API Key 확인
    api_key = os.getenv("APIFY_API_KEY")
    if not api_key:
        return {
            "error": "APIFY_API_KEY not found in environment variables",
            "mock_data": True,
            **_get_mock_data(product_url)
        }

    # 플랫폼 판별
    platform = _detect_platform(product_url)

    if platform == "coupang":
        return _crawl_coupang(product_url, api_key)
    elif platform == "naver":
        return _crawl_naver(product_url, api_key)
    else:
        return {"error": f"지원하지 않는 플랫폼입니다: {product_url}"}


def _detect_platform(url: str) -> str:
    """URL에서 플랫폼 판별"""
    if "coupang.com" in url:
        return "coupang"
    elif "naver.com" in url or "smartstore.naver.com" in url:
        return "naver"
    else:
        return "unknown"


def _crawl_coupang(url: str, api_key: str) -> Dict[str, Any]:
    """
    Apify의 Coupang Scraper를 사용하여 크롤링
    실제 구현 시 Apify Actor 호출
    """

    # TODO: 실제 Apify API 호출 구현
    # endpoint = f"https://api.apify.com/v2/acts/~coupang-scraper/runs"
    # response = requests.post(endpoint, json={"startUrls": [{"url": url}]}, headers={"Authorization": f"Bearer {api_key}"})

    # 현재는 Mock 데이터 반환
    return _get_mock_data(url)


def _crawl_naver(url: str, api_key: str) -> Dict[str, Any]:
    """
    Apify의 Naver Shopping Scraper를 사용하여 크롤링
    """
    # TODO: 실제 Apify API 호출 구현
    return _get_mock_data(url)


def _get_mock_data(url: str) -> Dict[str, Any]:
    """
    개발/테스트용 Mock 데이터
    실제 Apify API 연동 전까지 사용
    """
    return {
        "url": url,
        "title": "삼성 갤럭시 버즈2 프로 블루투스 이어폰 노이즈캔슬링 30시간 재생",
        "price": 189000,
        "rating": 4.6,
        "reviews": 2345,
        "images": [
            "https://via.placeholder.com/500x500.png?text=Product+Image+1",
            "https://via.placeholder.com/500x500.png?text=Product+Image+2",
            "https://via.placeholder.com/500x500.png?text=Product+Image+3"
        ],
        "detail_html": """
        <div class="product-detail">
            <h2>제품 소개</h2>
            <p>프리미엄 노이즈캔슬링으로 나만의 공간을 만드세요.</p>
            <h2>주요 특징</h2>
            <ul>
                <li>30시간 초장시간 재생</li>
                <li>지능형 노이즈캔슬링</li>
                <li>IPX7 방수 기능</li>
            </ul>
            <h2>FAQ</h2>
            <p><strong>Q: 배터리 시간은?</strong></p>
            <p>A: 이어버드 8시간 + 케이스 22시간 = 총 30시간</p>
        </div>
        """,
        "features": [
            "30시간 초장시간 재생",
            "지능형 노이즈캔슬링",
            "IPX7 방수",
            "블루투스 5.3",
            "터치 컨트롤"
        ],
        "mock": True  # Mock 데이터임을 표시
    }


# ============================================
# 추가 유틸리티 함수
# ============================================

@tool("Apify Batch Crawler")
def apify_crawl_multiple_products(urls: List[str]) -> List[Dict[str, Any]]:
    """
    여러 상품 URL을 동시에 크롤링합니다.

    Args:
        urls: 크롤링할 상품 URL 리스트

    Returns:
        각 URL의 크롤링 결과 리스트
    """
    results = []
    for url in urls:
        result = apify_crawl_product(url)
        results.append(result)

    return results
