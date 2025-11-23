import os
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI

# Mock LLM for development (to avoid API Key errors if not set)
# In production, use: llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GOOGLE_API_KEY"))
class MockLLM:
    def predict(self, text):
        return f"Mock LLM Response for: {text[:20]}..."
    def call(self, messages, **kwargs):
        return "Mock LLM Response"

def create_sourcing_crew(query: str, callback_function=None):
    """
    Creates and runs the Product Sourcing Crew
    """
    
    # 0. LLM 설정 (Gemini 1.5 Pro - 고성능 모델)
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.7
    )

    # 1. 에이전트 정의 (Agents)
    sourcing_agent = Agent(
        role='수석 상품 연구원 (Senior Product Researcher)',
        goal='이커머스 시장에서 잠재력 높은 "황금 키워드" 발굴',
        backstory="""당신은 이커머스 데이터 분석 전문가입니다. 
        네이버와 쿠팡에서 경쟁 강도는 낮지만 검색량은 높은 틈새 키워드를 찾아내는 데 탁월한 능력을 가지고 있습니다.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 2. 태스크 정의 (Tasks)
    task_search = Task(
        description=f"""
        다음 검색어에 대한 시장을 분석하세요: '{query}'.
        1. 검색량은 높고 경쟁은 낮은 연관 키워드 5개를 식별하세요.
        2. 각 키워드에 대한 '황금 점수'를 계산하세요.
        3. 상표권 침해 위험이 없는지 확인하세요.
        """,
        expected_output="황금 점수와 선정 이유가 포함된 5개의 황금 키워드 목록.",
        agent=sourcing_agent
    )

    # 3. Create Crew
    crew = Crew(
        agents=[sourcing_agent],
        tasks=[task_search],
        verbose=True,
        process=Process.sequential
    )

    # 4. Kickoff
    # Note: CrewAI's kickoff is synchronous. 
    # We might need to capture output or use a custom callback for real-time logs.
    result = crew.kickoff()
    
    return result
