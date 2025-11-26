import os
import json
import yaml
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

# 3. Load Config Helper
def load_config(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def create_sourcing_crew(query: str, callback_function=None):
    """
    Creates and runs the Product Sourcing Crew (Multi-Agent)
    """
    
    # Load Configurations
    config_dir = os.path.join(os.path.dirname(__file__), 'config')
    agents_config = load_config(os.path.join(config_dir, 'agents.yaml'))
    tasks_config = load_config(os.path.join(config_dir, 'tasks.yaml'))

    # 4. Define Agents
    # Manager is not used in the sequential flow explicitly but defined in config
    
    # Import Safety Tool
    from tools.safety_tool import safety_tool

    sourcing_agent = Agent(
        role=agents_config['sourcing_agent']['role'],
        goal=agents_config['sourcing_agent']['goal'],
        backstory=agents_config['sourcing_agent']['backstory'],
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[search_tool]
    )

    competitor_analyst = Agent(
        role=agents_config['competitor_analyst']['role'],
        goal=agents_config['competitor_analyst']['goal'],
        backstory=agents_config['competitor_analyst']['backstory'],
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[search_tool]
    )

    keyword_verifier = Agent(
        role=agents_config['keyword_verifier']['role'],
        goal=agents_config['keyword_verifier']['goal'],
        backstory=agents_config['keyword_verifier']['backstory'],
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[search_tool, safety_tool] # Add safety_tool here
    )

    content_creator = Agent(
        role=agents_config['content_creator']['role'],
        goal=agents_config['content_creator']['goal'],
        backstory=agents_config['content_creator']['backstory'],
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[search_tool]
    )

    # 5. Define Tasks
    task_sourcing = Task(
        description=tasks_config['sourcing_task']['description'].format(query=query),
        expected_output=tasks_config['sourcing_task']['expected_output'],
        agent=sourcing_agent
    )

    task_competitor = Task(
        description=tasks_config['competitor_analysis_task']['description'],
        expected_output=tasks_config['competitor_analysis_task']['expected_output'],
        agent=competitor_analyst,
        context=[task_sourcing]
    )

    task_verification = Task(
        description=tasks_config['keyword_verification_task']['description'],
        expected_output=tasks_config['keyword_verification_task']['expected_output'],
        agent=keyword_verifier,
        context=[task_competitor]
    )

    task_content = Task(
        description=tasks_config['content_creation_task']['description'],
        expected_output=tasks_config['content_creation_task']['expected_output'],
        agent=content_creator,
        context=[task_verification]
    )

    # Callback wrapper to handle CrewAI's step object
    def step_callback_wrapper(step_output):
        if callback_function:
            try:
                if hasattr(step_output, 'thought'):
                    callback_function(f"Thinking: {step_output.thought[:100]}...")
                elif hasattr(step_output, 'result'):
                     callback_function(f"Action: {str(step_output.result)[:100]}...")
                else:
                    callback_function(f"Step: {str(step_output)[:100]}...")
            except:
                callback_function("Agent is working...")

    # 6. Create Crew
    crew = Crew(
        agents=[sourcing_agent, competitor_analyst, keyword_verifier, content_creator],
        tasks=[task_sourcing, task_competitor, task_verification, task_content],
        verbose=True,
        process=Process.sequential,
        step_callback=step_callback_wrapper if callback_function else None
    )

    # 7. Kickoff
    result = crew.kickoff()
    
    return result
