/**
 * Credential Manager - Decrypts and provides JIRA credentials at runtime.
 * Credentials are stored encrypted in config/.jira-credentials.enc
 * and decrypted using a machine-specific key.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

interface JiraCredentials {
  baseUrl: string;
  username: string;
  password: string;
  authType: string;
}

interface CredentialStore {
  jira: JiraCredentials;
  encrypted_at: string;
  version: string;
}

function getMachineSecret(): string {
  return [
    process.env.COMPUTERNAME || 'default',
    process.env.USERNAME || 'user',
    'SmartBugTriage-2026',
    'synergy-ai-jira-vault'
  ].join('::');
}

function decrypt(encryptedBase64: string, passphrase: string): string {
  const data = Buffer.from(encryptedBase64, 'base64');

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

export function getJiraCredentials(): JiraCredentials | null {
  try {
    const credPath = path.join(__dirname, '..', 'config', '.jira-credentials.enc');
    
    if (!fs.existsSync(credPath)) {
      console.error('❌ Encrypted credentials file not found. Run: node scripts/encrypt-credentials.js');
      return null;
    }

    const encryptedData = fs.readFileSync(credPath, 'utf8');
    const decrypted = decrypt(encryptedData, getMachineSecret());
    const store: CredentialStore = JSON.parse(decrypted);

    return store.jira;
  } catch (error) {
    console.error('❌ Failed to decrypt credentials:', error);
    return null;
  }
}

export function getJiraBaseUrl(): string {
  const creds = getJiraCredentials();
  return creds?.baseUrl || 'https://mounikapashikantibitla-1771170864282.atlassian.net';
}
