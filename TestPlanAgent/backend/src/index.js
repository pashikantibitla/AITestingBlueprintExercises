import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './services/database.js';
import settingsRoutes from './routes/settings.js';
import jiraRoutes from './routes/jira.js';
import llmRoutes from './routes/llm.js';
import templateRoutes from './routes/templates.js';
import testPlanRoutes from './routes/testplan.js';
import bugTriageRoutes from './routes/bugtriage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/jira', jiraRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/testplan', testPlanRoutes);
app.use('/api/bug-triage', bugTriageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Plan Agent Backend running on http://localhost:${PORT}`);
});
