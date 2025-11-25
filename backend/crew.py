import os
import json
import requests
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from crewai import Tool

# 1. LLM 설정 (Gemini 1.5 Pro)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7
)

# 2. Custom Search Tool Definition
def search_func(query: str):
    """
    Searches the internet using Serper.dev API.
    """
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": query})
    headers = {
        'X-API-KEY': os.getenv("SERPER_API_KEY"),
        'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response.raise_for_status()
        return response.text
    except Exception as e:
        return f"Error searching for {query}: {str(e)}"

search_tool = Tool(
    name="Serper Search",
    func=search_func,
    description="Useful for searching the internet for current events, trends, and market data. Input should be a search query string."
)

def create_sourcing_crew(query: str):
    """
    Creates and runs the Product Sourcing Crew
    """
    
    # 3. 에이전트 정의 (Agents)
    sourcing_agent = Agent(
        role='수석 상품 연구원 (Senior Product Researcher)',
        goal='이커머스 시장에서 잠재력 높은 "황금 키워드" 발굴',
        backstory="""당신은 이커머스 데이터 분석 전문가입니다. 
        네이버와 쿠팡에서 경쟁 강도는 낮지만 검색량은 높은 틈새 키워드를 찾아내는 데 탁월한 능력을 가지고 있습니다.
        주어진 키워드와 관련된 최신 트렌드를 검색하고 분석하여 수익성 높은 틈새 시장을 제안합니다.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[search_tool]
    )

    # 4. 태스크 정의 (Tasks)
    task_search = Task(
        description=f"""
        다음 검색어에 대한 시장을 심층 분석하세요: '{query}'.
        
        1. '{query}'와 관련된 최신 트렌드와 연관 검색어를 조사하세요.
        2. 검색량은 높지만 경쟁 상품 수가 적은 '황금 키워드' 5개를 식별하세요.
        3. 각 키워드에 대해 다음을 분석하세요:
           - 예상 검색량 (높음/중간/낮음)
           - 경쟁 강도 (높음/중간/낮음)
           - 추천 이유 (트렌드성, 시즌성 등)
        4. 상표권 침해 위험이 없는지 간단히 확인하세요.
        """,
        expected_output="""
        다음 항목을 포함한 JSON 형식의 보고서:
        {
            "query": "입력된 검색어",
            "golden_keywords": [
                {
                    "keyword": "키워드1",
                    "search_volume": "예상 검색량",
                    "competition": "경쟁 강도",
                    "reason": "선정 이유",
                    "risk": "상표권 위험 여부"
                },
                ...
            ],
            "market_analysis": "전반적인 시장 분석 요약"
        }
        """,
        agent=sourcing_agent
    )

    # 5. Create Crew
    crew = Crew(
        agents=[sourcing_agent],
        tasks=[task_search],
        verbose=True,
        process=Process.sequential
    )

    # 6. Kickoff
    result = crew.kickoff()
    
    return result
