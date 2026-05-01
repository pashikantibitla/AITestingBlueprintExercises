#!/usr/bin/env python3
"""
Decrypt sensitive files that were encrypted by encrypt_sensitive_files.py.
Run with: python decrypt_sensitive_files.py
"""
import os
from pathlib import Path
from cryptography.fernet import Fernet

KEY_FILE = "encryption.key"
if not os.path.exists(KEY_FILE):
    print(f"[ERROR] Key file not found: {KEY_FILE}")
    exit(1)

with open(KEY_FILE, "rb") as f:
    key = f.read()

fernet = Fernet(key)

# Find all .enc files and decrypt them
enc_files = list(Path(".").rglob("*.enc"))
if not enc_files:
    print("[INFO] No .enc files found.")
    exit(0)

decrypted_count = 0
for enc_path in enc_files:
    # Original file path (remove .enc suffix)
    orig_path = Path(str(enc_path)[:-4])  # strip .enc

    with open(enc_path, "rb") as f:
        encrypted_data = f.read()

    try:
        decrypted = fernet.decrypt(encrypted_data)
    except Exception as e:
        print(f"[ERROR] Failed to decrypt {enc_path}: {e}")
        continue

    with open(orig_path, "wb") as f:
        f.write(decrypted)

    print(f"[DECRYPTED] {enc_path} -> {orig_path}")
    decrypted_count += 1

print(f"\nDone. Decrypted: {decrypted_count}")
