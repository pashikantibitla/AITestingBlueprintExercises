import requests
import json
import time

def generate():
    url = "http://localhost:5000/api/generate"
    payload = {
        "input": "Gmail login functionality. Verify login with valid/invalid credentials, 2FA, password recovery, and session timeouts."
    }
    
    print("⏳ Waiting for server to be ready...")
    for _ in range(5):
        try:
            requests.get("http://localhost:5000/api/health")
            break
        except:
            time.sleep(1)
            
    print("🚀 Sending generation request...")
    try:
        response = requests.post(url, json=payload, timeout=300)
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("\n✅ GENERATION SUCCESS:\n")
                print(data['response'])
            else:
                print(f"❌ Error: {data.get('error')}")
        else:
            print(f"❌ Server returned {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    generate()
