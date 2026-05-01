import { Router } from 'express';
import { getDatabase } from '../services/database.js';

const router = Router();

// Get all bug triage reports
router.get('/', (req, res) => {
  const db = getDatabase();
  db.all(
    `SELECT * FROM bug_triage_reports ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Parse raw_json for each row
      const parsedRows = rows.map(row => ({
        ...row,
        acceptance_criteria: row.acceptance_criteria ? JSON.parse(row.acceptance_criteria) : []
      }));
      res.json(parsedRows);
    }
  );
});

// Get specific bug triage report
router.get('/:id', (req, res) => {
  const db = getDatabase();
  db.get('SELECT * FROM bug_triage_reports WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Bug triage report not found' });
    }
    res.json({
      ...row,
      acceptance_criteria: row.acceptance_criteria ? JSON.parse(row.acceptance_criteria) : []
    });
  });
});

// Create new bug triage report
router.post('/', (req, res) => {
  try {
    const {
      bug_id,
      title,
      description,
      created_date,
      severity,
      priority,
      category,
      assigned_team,
      assigned_dev,
      qa_effort,
      dev_effort,
      business_impact,
      acceptance_criteria,
      recommended_action,
      root_cause,
      raw_json
    } = req.body;

    const db = getDatabase();
    db.run(
      `INSERT INTO bug_triage_reports 
       (bug_id, title, description, created_date, severity, priority, category, assigned_team, assigned_dev, qa_effort, dev_effort, business_impact, acceptance_criteria, recommended_action, root_cause, raw_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bug_id,
        title,
        description,
        created_date,
        severity,
        priority,
        category,
        assigned_team,
        assigned_dev,
        qa_effort,
        dev_effort,
        business_impact,
        JSON.stringify(acceptance_criteria || []),
        recommended_action,
        root_cause,
        raw_json ? JSON.stringify(raw_json) : null
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          success: true, 
          id: this.lastID,
          message: 'Bug triage report created successfully' 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bug triage report
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  db.run('DELETE FROM bug_triage_reports WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Bug triage report deleted' });
  });
});

// Seed sample data
router.post('/seed', (req, res) => {
  const db = getDatabase();
  
  const sampleBugs = [
    {
      bug_id: 'BT-001',
      title: 'Users unable to complete checkout after adding promo code',
      description: 'Users are unable to complete the checkout process after applying a valid promo code, as the "Place Order" button becomes unresponsive. This issue occurs on multiple browsers and persists even after clearing the cache.',
      created_date: '2024-09-16',
      severity: 'High',
      priority: 'P1',
      category: 'UI',
      assigned_team: 'Frontend',
      assigned_dev: 'Emily Patel',
      qa_effort: '4 hours',
      dev_effort: '8 hours',
      business_impact: 'This bug directly affects revenue as users are unable to complete their purchases, leading to potential loss of sales and customer dissatisfaction.',
      acceptance_criteria: [
        'The "Place Order" button is responsive after applying a valid promo code.',
        'The checkout process completes successfully without errors.',
        'The issue is resolved across all supported browsers (Chrome, Firefox, Safari, Edge).',
        'No error messages are displayed unnecessarily.'
      ],
      recommended_action: 'Immediate fix',
      root_cause: 'The issue might be related to a JavaScript error triggered by the promo code application, possibly due to a recent update in the frontend codebase.'
    },
    {
      bug_id: 'BT-002',
      title: 'API response time exceeds 10 seconds for product search',
      description: 'The product search API endpoint is taking over 10 seconds to respond to generic search terms, causing timeouts on the mobile app and potentially degrading the user experience.',
      created_date: '2024-09-17',
      severity: 'Medium',
      priority: 'P2',
      category: 'Performance',
      assigned_team: 'Backend',
      assigned_dev: 'Jordan Smith',
      qa_effort: '6 hours',
      dev_effort: '12 hours',
      business_impact: 'Slow API response times can lead to a poor user experience, potentially driving customers away and affecting the company\'s reputation for reliability and speed.',
      acceptance_criteria: [
        'The API response time for product search queries is under 2 seconds.',
        'The improvement is consistent across different search terms and query parameters.',
        'The fix does not introduce any new errors or affect existing functionality.',
        'Performance is optimized without compromising on the quality of search results.'
      ],
      recommended_action: 'Next sprint',
      root_cause: 'The slow response time could be due to inefficient database queries or inadequate indexing, possibly exacerbated by a large volume of products or unoptimized search algorithms.'
    },
    {
      bug_id: 'BT-003',
      title: 'Sensitive user data visible in browser console logs',
      description: 'Sensitive user data, including full credit card numbers and API keys, is being printed in the browser\'s developer console when navigating to the user profile page, indicating a serious security vulnerability.',
      created_date: '2024-09-18',
      severity: 'Critical',
      priority: 'P0',
      category: 'Security',
      assigned_team: 'Security',
      assigned_dev: 'Priya Sharma',
      qa_effort: '2 hours',
      dev_effort: '4 hours',
      business_impact: 'Exposing sensitive user data poses a significant risk to user privacy and trust, potentially leading to legal and reputational consequences.',
      acceptance_criteria: [
        'No sensitive user data (credit card numbers, API keys, etc.) is logged in the browser console.',
        'The fix is verified across all user profile pages and scenarios.',
        'A review of the codebase is conducted to ensure no similar issues exist.',
        'Automated tests are added to prevent regression.'
      ],
      recommended_action: 'Immediate fix',
      root_cause: 'The issue is likely due to leftover debug logging statements that were not removed before deployment to production.'
    }
  ];

  let completed = 0;
  let errors = [];

  sampleBugs.forEach((bug) => {
    db.run(
      `INSERT INTO bug_triage_reports 
       (bug_id, title, description, created_date, severity, priority, category, assigned_team, assigned_dev, qa_effort, dev_effort, business_impact, acceptance_criteria, recommended_action, root_cause, raw_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bug.bug_id,
        bug.title,
        bug.description,
        bug.created_date,
        bug.severity,
        bug.priority,
        bug.category,
        bug.assigned_team,
        bug.assigned_dev,
        bug.qa_effort,
        bug.dev_effort,
        bug.business_impact,
        JSON.stringify(bug.acceptance_criteria),
        bug.recommended_action,
        bug.root_cause,
        JSON.stringify(bug)
      ],
      function(err) {
        completed++;
        if (err) errors.push(err.message);
        if (completed === sampleBugs.length) {
          if (errors.length > 0) {
            res.status(500).json({ error: errors.join(', ') });
          } else {
            res.json({ success: true, message: 'Sample data seeded successfully', count: sampleBugs.length });
          }
        }
      }
    );
  });
});

export default router;
