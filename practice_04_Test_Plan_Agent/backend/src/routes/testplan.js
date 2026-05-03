import { Router } from 'express';
import Groq from 'groq-sdk';
import axios from 'axios';
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

// Generate test plan
router.post('/generate', async (req, res) => {
  try {
    const { ticketId, ticketData, templateContent, provider } = req.body;
    const settings = await getLLMSettings();
    
    const selectedProvider = provider || settings.llm_provider || 'groq';
    
    // Construct the prompt
    const systemPrompt = `You are an expert QA Engineer with years of experience in software testing. 
Your task is to generate a comprehensive test plan based on the JIRA ticket provided.

Follow the structure of the template provided, but adapt it to fit the specific ticket details.
Be thorough, professional, and think about edge cases, negative scenarios, and integration points.

Generate specific, actionable test cases with:
- Clear preconditions
- Step-by-step instructions
- Expected results
- Priority levels (High/Medium/Low)`;

    const userPrompt = `## JIRA Ticket Information

**Ticket ID:** ${ticketData.key}
**Summary:** ${ticketData.summary}
**Description:** ${ticketData.description || 'No description provided'}
**Priority:** ${ticketData.priority || 'Not specified'}
**Issue Type:** ${ticketData.issueType || 'Not specified'}
**Labels:** ${ticketData.labels?.join(', ') || 'None'}
**Status:** ${ticketData.status || 'Unknown'}
**Reporter:** ${ticketData.reporter || 'Unknown'}

## Template Structure

${templateContent}

## Instructions

1. Fill in all sections of the template using the JIRA ticket information
2. Create at least 5-8 specific test scenarios based on the ticket
3. Include both positive and negative test cases
4. Add edge cases and boundary value analysis where applicable
5. Ensure test data requirements are specific and realistic
6. Include integration test scenarios if the feature interacts with other systems

Generate the complete test plan now:`;

    let generatedContent;
    
    if (selectedProvider === 'groq') {
      // Use Groq
      const apiKey = settings.groq_api_key;
      if (!apiKey) {
        return res.status(400).json({ error: 'Groq API key not configured' });
      }

      const groq = new Groq({ apiKey });
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: settings.groq_model || 'llama3-70b-8192',
        temperature: parseFloat(settings.llm_temperature) || 0.7,
        max_tokens: 4096
      });

      generatedContent = response.choices[0]?.message?.content;
    } else {
      // Use Ollama
      const baseUrl = settings.ollama_base_url || 'http://localhost:11434';
      const model = settings.ollama_model || 'llama3';

      const response = await axios.post(
        `${baseUrl}/api/generate`,
        {
          model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: parseFloat(settings.llm_temperature) || 0.7
          }
        },
        { timeout: 120000 }
      );

      generatedContent = response.data.response;
    }

    if (!generatedContent) {
      return res.status(500).json({ error: 'No content generated' });
    }

    // Save to history
    const db = getDatabase();
    db.get('SELECT id FROM templates WHERE content = ?', [templateContent], (err, templateRow) => {
      const templateId = templateRow?.id || null;
      
      db.run(
        'INSERT INTO test_plan_history (ticket_id, ticket_summary, template_id, generated_content, provider) VALUES (?, ?, ?, ?, ?)',
        [ticketId, ticketData.summary, templateId, generatedContent, selectedProvider]
      );
    });

    res.json({ 
      success: true, 
      content: generatedContent,
      provider: selectedProvider 
    });

  } catch (error) {
    console.error('Test plan generation failed:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to generate test plan' 
    });
  }
});

// Get test plan history
router.get('/history', (req, res) => {
  const db = getDatabase();
  db.all(
    `SELECT h.id, h.ticket_id, h.ticket_summary, h.generated_content, h.provider, h.created_at, t.name as template_name 
     FROM test_plan_history h 
     LEFT JOIN templates t ON h.template_id = t.id 
     ORDER BY h.created_at DESC 
     LIMIT 20`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get specific test plan from history
router.get('/history/:id', (req, res) => {
  const db = getDatabase();
  db.get('SELECT * FROM test_plan_history WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Test plan not found' });
    }
    res.json(row);
  });
});

export default router;
