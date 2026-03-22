
import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchJiraIssues, classifyAndAssign, JiraIssue, DEVS } from './jiraService';

const App: React.FC = () => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tests' | 'triage'>('triage');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchJiraIssues();
      setIssues(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header" role="banner">
        <div className="title-group">
          <h1>Synergy AI | Smart Triage</h1>
          <p className="subtitle">Project: app.vwo.com | RCA-Driven Bug Segregation</p>
        </div>
        <nav className="nav-tabs" aria-label="Dashboard views">
          <button 
            className={view === 'triage' ? 'active' : ''} 
            onClick={() => setView('triage')}
            aria-current={view === 'triage' ? 'page' : undefined}
          >
            Smart Triage
          </button>
          <button 
            className={view === 'tests' ? 'active' : ''} 
            onClick={() => setView('tests')}
            aria-current={view === 'tests' ? 'page' : undefined}
          >
            Regression Suite
          </button>
        </nav>
      </header>

      {loading ? (
        <div className="loader-container" role="status">
          <div className="loader"></div>
          <p>Analyzing RCA Patterns & JIRA Data...</p>
        </div>
      ) : (
        <main className="content-area">
          {view === 'triage' ? (
            <div className="triage-dashboard">
              <section className="dev-roster" aria-labelledby="roster-title">
                <h3 id="roster-title">Developer Readiness Pool</h3>
                <div className="dev-grid">
                  {DEVS.map(dev => (
                    <div key={dev.name} className="dev-card" aria-label={`Developer ${dev.name}, Role ${dev.role}`}>
                      <div className="dev-avatar" aria-hidden="true">{dev.name[0]}</div>
                      <div className="dev-info">
                        <strong>{dev.name}</strong>
                        <span>{dev.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="issues-table-container" aria-labelledby="pipeline-title">
                <h3 id="pipeline-title">Intelligence-Driven Triage Pipeline</h3>
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th scope="col">Ticket Info</th>
                      <th scope="col">RCA (Detection & Cause)</th>
                      <th scope="col">AI Segregation</th>
                      <th scope="col">Assigned Resource</th>
                      <th scope="col">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => {
                      const triage = classifyAndAssign(issue);
                      return (
                        <tr key={issue.key}>
                          <td className="ticket-cell">
                            <span className="ticket-key">{issue.key}</span>
                            <div className="ticket-summary">
                              <strong>{issue.summary}</strong>
                              <p>{issue.description?.substring(0, 60)}...</p>
                            </div>
                          </td>
                          <td className="rca-cell">
                            <div className="rca-info">
                              <span className="rca-tag detection">Detected: {issue.rca?.detection}</span>
                              <span className="rca-tag cause">Cause: {issue.rca?.whatWentWrong}</span>
                              <span className="rca-tag prevention">Prevent with: {issue.rca?.prevention}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge classification-badge" aria-label={`Classification: ${triage.classification}`}>
                              {triage.classification}
                            </span>
                          </td>
                          <td className="assignment-cell">
                            <div className="assignee">
                              <span className="assignee-name">{triage.assignedTo}</span>
                              <span className="assignee-role">{triage.role}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge priority-badge ${triage.priority}`} aria-label={`Severity Level ${triage.priority}`}>
                              {triage.priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </div>
          ) : (
            <div className="regression-view">
              <div className="placeholder-content">
                <h3>Regression Suite Baseline</h3>
                <p>Pipeline Status: <span className="status-pass">HEALTHY</span></p>
                <div className="stat-grid" style={{ marginTop: '20px' }}>
                  <div className="stat-card"><div className="stat-value">5</div><div className="stat-label">TOTAL</div></div>
                  <div className="stat-card"><div className="stat-value">1</div><div className="stat-label">PASSED</div></div>
                  <div className="stat-card"><div className="stat-value" style={{color: '#ef4444'}}>4</div><div className="stat-label">FAILED</div></div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default App;
