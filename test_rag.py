import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from utils.vector_db import safety_db

def test_safety():
    test_keywords = ["코멧", "풋브러쉬", "나이키 신발", "안전한 매트", "마약 베개"]
    
    print("=== Safety Check Test ===")
    for kw in test_keywords:
        result = safety_db.check_safety(kw)
        status = "✅ Safe" if result["is_safe"] else "❌ Unsafe"
        matched = result.get('matched_keyword', '-')
        print(f"Keyword: {kw:<10} | Status: {status} | Score: {result.get('score', 0):.4f} | Matched: {matched:<10} | Reason: {result.get('reason', '-')}")

if __name__ == "__main__":
    test_safety()
