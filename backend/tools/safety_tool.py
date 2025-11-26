from crewai import Tool
from utils.vector_db import safety_db

def check_keyword_safety(keyword: str):
    """
    Checks if a keyword is safe to use by comparing it against a database of banned trademarks and keywords.
    Returns a JSON string with safety status and reason.
    """
    result = safety_db.check_safety(keyword)
    if result["is_safe"]:
        return f"✅ Safe: '{keyword}' seems safe to use. (Similarity: {result.get('score', 0):.2f})"
    else:
        return f"❌ Unsafe: '{keyword}' is too similar to banned keyword '{result['matched_keyword']}'. Reason: {result['reason']} (Similarity: {result['score']:.2f})"

safety_tool = Tool(
    name="Keyword Safety Check",
    func=check_keyword_safety,
    description="Useful for checking if a keyword or brand name is safe to use. Input should be a single keyword or short phrase."
)
