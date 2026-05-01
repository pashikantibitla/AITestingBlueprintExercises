import { Router } from 'express';
import axios from 'axios';
import Groq from 'groq-sdk';
import { getDatabase } from '../services/database.js';

const router = Router();

// Get LLM settings
async function getLLMSettings() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all('SELECT key, value FROM settings WHERE key LIKE "llm_%" OR key LIKE "groq_%" OR key LIKE "ollama_%"', (err, rows) => {
      if (err) return reject(err);
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });
      resolve(settings);
    });
  });
}

// Test Groq connection
router.post('/test/groq', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ connected: false, error: 'API key required' });
    }

    const groq = new Groq({ apiKey });
    
    // Make a simple test request
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      model: model || 'llama3-70b-8192',
      max_tokens: 10
    });

    res.json({ 
      connected: true, 
      model: response.model,
      message: 'Groq connection successful'
    });
  } catch (error) {
    console.error('Groq test failed:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: error.message 
    });
  }
});

// Test Ollama connection
router.post('/test/ollama', async (req, res) => {
  try {
    const { baseUrl } = req.body;
    const url = baseUrl || 'http://localhost:11434';
    
    const response = await axios.get(`${url}/api/tags`, { timeout: 5000 });
    
    res.json({ 
      connected: true, 
      models: response.data.models?.map(m => m.name) || [],
      message: 'Ollama connection successful'
    });
  } catch (error) {
    console.error('Ollama test failed:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: 'Cannot connect to Ollama. Is it running?' 
    });
  }
});

// Get available Ollama models
router.get('/models/ollama', async (req, res) => {
  try {
    const settings = await getLLMSettings();
    const baseUrl = settings.ollama_base_url || 'http://localhost:11434';
    
    const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
    
    res.json(response.data.models?.map(m => m.name) || []);
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error.message);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get available Groq models
router.get('/models/groq', async (req, res) => {
  res.json([
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma-7b-it', name: 'Gemma 7B' }
  ]);
});

export default router;
