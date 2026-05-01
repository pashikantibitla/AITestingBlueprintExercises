from crewai import Agent, Task, Crew, Process
from crewai import LLM
import os
from dotenv import load_dotenv
load_dotenv()

# step- 0 set up LLM 
grog_llm = LLM(model = "groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=1000,
    timeout=60,
    verbose=True,
 )

#define agent
qa_agent = Agent(
    role="QA Engineer",
    goal="Analyze the feature and identify potential scenarios",
    backstory="You are a QA Engineer with 5 years of experience in test planning",
    llm=grog_llm,
    verbose=True,
    allow_delegation=True
)

#define test plan
qa_task = Task(
    description="create five test scenaris for login page with all possibilities for given email and password",
    expected_output="All five scenarios should have brief description",
    agent=qa_agent
)

#define crew
qa_crew = Crew(
    agents=[qa_agent],
    tasks=[qa_task],
    process=Process.sequential,
    verbose=True
)

#execute crew
result = qa_crew.kickoff()

# Display output
print("\n" + "="*50)
print("CREW RESULT:")
print("="*50)
print(result)

# Save to result.md
with open("result.md", "w", encoding="utf-8") as f:
    f.write("# CrewAI QA Test Scenarios - Login Page\n\n")
    f.write(str(result))
    
print("\n" + "-"*50)
print("Result saved to: result.md")
print("-"*50)
