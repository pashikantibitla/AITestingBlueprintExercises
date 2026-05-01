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
researcher_agent = Agent(
    role="QA research analyst",
    goal="Research for common bugs in web application, explain in detail about bug with following details description, "\
        "RCA, bug fix",
    backstory="You are a QA reasearcher with 10 years of experience who has analysed 1000 of bugs in web application, "\
    "you specialize in identifying common bugs , their patters and their RCA"\
        "and trends in UI, API bug and security vulnerabilities",
    llm=grog_llm,
    verbose=True,
    allow_delegation=True
)

writer_agent = Agent(role = "QA Documentation Writer",
    goal="create a detailed, clear, actionable bug report for the given bug with all the details",
    backstory="""You are a QA specialist Documentation Writer with 10 years of experience, you turn complex bug details into detailed
    clear and actionable bug reports, your reports are used by developers to fix bugs quickly and efficiently. QA to understand RCA""",
    llm=grog_llm,
    verbose=True,
    allow_delegation=True
)

#takss
research_task = Task(
    description="""Research for common bugs in web application, explain in detail about bug with following details description, """
    "RCA, bug fix",
    expected_output="""create a detailed report of 10 common bugs in web application with name, frequency pf ccurencedescription, RCA, bug fix""",
    agent=researcher_agent,
    verbose=True,
)

writer_task = Task(
    description="Create a detailed, clear, actionable bug report for the given bug with all the details",
    expected_output="A detailed bug report with description, RCA, bug fix",
    agent=writer_agent,
    verbose=True,
)

#create crew
all_crew = Crew(agents = [researcher_agent, writer_agent],
tasks= [research_task, writer_task],
process = Process.sequential,
verbose = "true")


#execute crew
result = all_crew.kickoff()

# Display output
print("\n" + "="*50)
print("CREW RESULT:")
print("="*50)
print(result)

# Save to result.md
with open("result.md", "w", encoding="utf-8") as f:
    f.write("# CrewAI Research Agent - AI and Machine Learning Trends\n\n")
    f.write(str(result))
    
print("\n" + "-"*50)
print("Result saved to: result.md")
print("-"*50)