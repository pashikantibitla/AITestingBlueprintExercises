import { Router } from 'express';
import axios from 'axios';
import { getDatabase } from '../services/database.js';

const router = Router();

// Get JIRA settings from DB
async function getJiraSettings() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all('SELECT key, value FROM settings WHERE key LIKE "jira_%"', (err, rows) => {
      if (err) return reject(err);
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });
      resolve(settings);
    });
  });
}

// Test JIRA connection
router.get('/test', async (req, res) => {
  try {
    const settings = await getJiraSettings();
    
    if (!settings.jira_base_url || !settings.jira_username || !settings.jira_api_token) {
      return res.status(400).json({ 
        connected: false, 
        error: 'JIRA settings not configured' 
      });
    }

    const response = await axios.get(
      `${settings.jira_base_url}/rest/api/2/myself`,
      {
        auth: {
          username: settings.jira_username,
          password: settings.jira_api_token
        },
        timeout: 10000
      }
    );

    res.json({ 
      connected: true, 
      user: response.data.displayName,
      email: response.data.emailAddress
    });
  } catch (error) {
    console.error('JIRA connection test failed:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: error.response?.data?.errorMessage || error.message 
    });
  }
});

// Fetch ticket by ID
router.post('/fetch', async (req, res) => {
  try {
    const { ticketId } = req.body;
    const settings = await getJiraSettings();
    
    if (!settings.jira_base_url || !settings.jira_username || !settings.jira_api_token) {
      return res.status(400).json({ error: 'JIRA settings not configured' });
    }

    // Validate ticket ID format
    const ticketRegex = /^[A-Z]+-\d+$/;
    if (!ticketRegex.test(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format. Expected: PROJECT-123' });
    }

    const response = await axios.get(
      `${settings.jira_base_url}/rest/api/2/issue/${ticketId}`,
      {
        auth: {
          username: settings.jira_username,
          password: settings.jira_api_token
        },
        params: {
          fields: 'summary,description,status,priority,assignee,labels,attachment,issuetype,created,updated,reporter'
        },
        timeout: 10000
      }
    );

    const ticket = response.data;
    const ticketData = {
      key: ticket.key,
      summary: ticket.fields.summary,
      description: ticket.fields.description,
      status: ticket.fields.status?.name,
      priority: ticket.fields.priority?.name,
      assignee: ticket.fields.assignee?.displayName || 'Unassigned',
      reporter: ticket.fields.reporter?.displayName,
      labels: ticket.fields.labels,
      issueType: ticket.fields.issuetype?.name,
      created: ticket.fields.created,
      updated: ticket.fields.updated,
      attachments: ticket.fields.attachment?.map(att => ({
        filename: att.filename,
        size: att.size,
        url: att.content
      })) || []
    };

    // Save to recent tickets
    const db = getDatabase();
    db.run(
      'INSERT INTO recent_tickets (ticket_id, ticket_data) VALUES (?, ?)',
      [ticketId, JSON.stringify(ticketData)]
    );

    // Clean old entries (keep last 10)
    db.run(`
      DELETE FROM recent_tickets 
      WHERE id NOT IN (
        SELECT id FROM recent_tickets 
        ORDER BY fetched_at DESC 
        LIMIT 10
      )
    `);

    res.json(ticketData);
  } catch (error) {
    console.error('Failed to fetch ticket:', error.message);
    res.status(500).json({ 
      error: error.response?.data?.errorMessage || 'Failed to fetch ticket' 
    });
  }
});

// Get recent tickets
router.get('/recent', (req, res) => {
  const db = getDatabase();
  db.all(
    'SELECT ticket_id, ticket_data, fetched_at FROM recent_tickets ORDER BY fetched_at DESC LIMIT 5',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const tickets = rows.map(row => ({
        ticketId: row.ticket_id,
        ...JSON.parse(row.ticket_data),
        fetchedAt: row.fetched_at
      }));
      res.json(tickets);
    }
  );
});

export default router;
