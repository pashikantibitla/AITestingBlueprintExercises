
import requests
import sys

def check_ollama():
    print("[INFO] Initiating Link with Ollama...")
    try:
        # 1. Check if Ollama is running
        resp = requests.get("http://localhost:11434/api/tags")
        if resp.status_code == 200:
            print("[OK] Ollama is ALIVE.")
            models = resp.json().get('models', [])
            model_names = [m.get('name') for m in models]
            print(f"   Available Models: {model_names}")
            
            # 2. Check for codellama
            if any("codellama" in name for name in model_names):
                print("[OK] STRICT MATCH: 'codellama' found.")
                return True
            else:
                print("[ERROR] CRITICAL: 'codellama' not found. Please run: `ollama pull codellama`")
                return False
        else:
            print(f"[ERROR] Ollama returned status {resp.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] CRITICAL: Could not connect to Ollama. Is it running on port 11434?")
        return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

if __name__ == "__main__":
    if check_ollama():
        sys.exit(0)
    else:
        sys.exit(1)
