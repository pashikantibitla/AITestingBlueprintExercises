import { Router } from 'express';
import { getDatabase } from '../services/database.js';

const router = Router();

// Get JIRA settings
router.get('/jira', (req, res) => {
  const db = getDatabase();
  db.all('SELECT key, value FROM settings WHERE key LIKE "jira_%"', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Save JIRA settings
router.post('/jira', (req, res) => {
  const { baseUrl, username, apiToken } = req.body;
  const db = getDatabase();
  
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run('jira_base_url', baseUrl);
  stmt.run('jira_username', username);
  stmt.run('jira_api_token', apiToken);
  stmt.finalize();
  
  res.json({ success: true, message: 'JIRA settings saved' });
});

// Get LLM settings
router.get('/llm', (req, res) => {
  const db = getDatabase();
  db.all('SELECT key, value FROM settings WHERE key LIKE "llm_%" OR key LIKE "groq_%" OR key LIKE "ollama_%"', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Save LLM settings
router.post('/llm', (req, res) => {
  const { provider, groqApiKey, groqModel, ollamaUrl, ollamaModel, temperature } = req.body;
  const db = getDatabase();
  
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run('llm_provider', provider);
  stmt.run('groq_api_key', groqApiKey || '');
  stmt.run('groq_model', groqModel || 'llama3-70b-8192');
  stmt.run('ollama_base_url', ollamaUrl || 'http://localhost:11434');
  stmt.run('ollama_model', ollamaModel || 'llama3');
  stmt.run('llm_temperature', temperature?.toString() || '0.7');
  stmt.finalize();
  
  res.json({ success: true, message: 'LLM settings saved' });
});

export default router;
