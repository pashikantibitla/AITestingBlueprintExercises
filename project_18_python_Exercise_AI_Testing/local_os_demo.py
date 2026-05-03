import os

current_dir = os.getcwd()
print(current_dir)

test_files = os.listdir("python_Exercise_AI_Testing/")
print(test_files)

# export OPENAI_API_KEY="abc"

api_key = os.environ.get("OPENAI_API_KEY", "not-set")
print(api_key)

groq_key = os.getenv("GROQ_API_KEY")
print(groq_key)
os.getenv("GROQ_API_KEY")

project_root = os.getcwd()
config_path = os.path.join(project_root, "config", "settings.json")
print(config_path)