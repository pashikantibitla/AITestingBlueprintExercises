import sqlite3 from 'sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const DB_PATH = join(DATA_DIR, 'app.db');

// Ensure data directory exists
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch (err) {
  // Directory might already exist
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('✅ Connected to SQLite database');
      }
    });
  }
  return db;
}

export function initializeDatabase() {
  const database = getDatabase();
  
  // Settings table
  database.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Recent tickets table
  database.run(`
    CREATE TABLE IF NOT EXISTS recent_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      ticket_data TEXT NOT NULL,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Templates table
  database.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      file_path TEXT,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Test plan history
  database.run(`
    CREATE TABLE IF NOT EXISTS test_plan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      ticket_summary TEXT,
      template_id INTEGER,
      generated_content TEXT,
      provider TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    )
  `);

  // Bug triage reports
  database.run(`
    CREATE TABLE IF NOT EXISTS bug_triage_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bug_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_date TEXT,
      severity TEXT,
      priority TEXT,
      category TEXT,
      assigned_team TEXT,
      assigned_dev TEXT,
      qa_effort TEXT,
      dev_effort TEXT,
      business_impact TEXT,
      acceptance_criteria TEXT,
      recommended_action TEXT,
      root_cause TEXT,
      raw_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default template
  const defaultTemplate = `
# Test Plan Template

## 1. Overview
- **Feature/Component**: [To be filled]
- **JIRA Ticket**: [To be filled]
- **Priority**: [To be filled]
- **Tester**: [To be filled]
- **Date**: [To be filled]

## 2. Scope
### In Scope:
- [To be filled based on ticket]

### Out of Scope:
- [To be filled based on ticket]

## 3. Test Scenarios
### Scenario 1: [To be generated]
**Preconditions:** [To be generated]
**Steps:**
1. [To be generated]
2. [To be generated]
**Expected Result:** [To be generated]

## 4. Test Data Requirements
[To be generated based on ticket]

## 5. Risk Assessment
[To be generated based on priority and complexity]

## 6. Sign-off Criteria
- All acceptance criteria met
- No critical or high defects open
- Test coverage >= 80%
`;

  database.get('SELECT COUNT(*) as count FROM templates', (err, row) => {
    if (!err && row.count === 0) {
      database.run(
        'INSERT INTO templates (name, content, is_default) VALUES (?, ?, ?)',
        ['Default Template', defaultTemplate, 1]
      );
    }
  });

  console.log('✅ Database initialized');
}

export function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
    db = null;
  }
}
