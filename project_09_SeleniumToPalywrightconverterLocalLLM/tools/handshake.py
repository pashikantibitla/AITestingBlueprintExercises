
import os
import sys

def handshake():
    print("Checking environment...")
    
    # Check if directories exist
    required_dirs = ['tools', 'ui', 'converted_output', '.tmp']
    for d in required_dirs:
        if not os.path.exists(d):
            try:
                os.makedirs(d)
                print(f"Created missing directory: {d}")
            except Exception as e:
                print(f"Error creating {d}: {e}")
                return False
        else:
            print(f"Verified directory: {d}")
            
    # Test write permission for output
    test_file = os.path.join("converted_output", "handshake_test.txt")
    try:
        with open(test_file, "w") as f:
            f.write("System Link Verified")
        print(f"Write permission verified: {test_file}")
        os.remove(test_file)
    except Exception as e:
        print(f"Write permission failed: {e}")
        return False

    print("System Link: ESTABLISHED")
    return True

if __name__ == "__main__":
    if handshake():
        sys.exit(0)
    else:
        sys.exit(1)
