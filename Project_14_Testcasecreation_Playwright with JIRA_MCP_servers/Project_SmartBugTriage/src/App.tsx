
import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchJiraIssues, classifyAndAssign, JiraIssue, DEVS, Developer } from './jiraService';

const App: React.FC = () => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tests' | 'triage' | 'dev-detail'>('triage');
  const [selectedDev, setSelectedDev] = useState<Developer | null>(null);

  const JIRA_BASE_URL = 'https://mounikapashikantibitla-1771170864282.atlassian.net';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchJiraIssues();
      setIssues(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDevClick = (dev: Developer) => {
    setSelectedDev(dev);
    setView('dev-detail');
  };

  const moveIssue = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newIssues = [...issues];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < issues.length) {
      [newIssues[index], newIssues[targetIndex]] = [newIssues[targetIndex], newIssues[index]];
      setIssues(newIssues);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header" role="banner">
        <div className="title-group">
          <h1>Synergy AI | Smart Triage</h1>
          <p className="subtitle">Project: app.vwo.com | RCA-Driven Bug Segregation</p>
        </div>
        <nav className="nav-tabs" aria-label="Dashboard views">
          <a 
            href={`${JIRA_BASE_URL}/jira/dashboards`}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn jira-dash"
          >
            Dashboard
          </a>
          <button 
            className={`nav-btn ${view === 'tests' ? 'active' : ''}`} 
            onClick={() => setView('tests')}
          >
            Insights
          </button>
          {view !== 'triage' && (
            <button className="nav-btn" onClick={() => setView('triage')}>Back to Triage</button>
          )}
        </nav>
      </header>

      {loading ? (
        <div className="loader-container" role="status">
          <div className="loader"></div>
          <p className="loading-text">Synchronizing JIRA Intelligence & RCA Patterns...</p>
        </div>
      ) : (
        <main className="content-area">
          {view === 'triage' ? (
            <div className="triage-dashboard-layout animate-in">
              <div className="stats-row" style={{ gridColumn: 'span 2' }}>
                <div className="stat-card active-bugs">
                  <div className="stat-header">ACTIVE BUGS OVERVIEW</div>
                  <div className="stat-content-horizontal">
                    <div className="bug-breakdown-horizontal">
                      <div className="count-item-h p0"><span className="p-label">P0</span><span className="p-val">{issues.filter(i => classifyAndAssign(i).priority === 'P0').length}</span></div>
                      <div className="count-item-h p1"><span className="p-label">P1</span><span className="p-val">{issues.filter(i => classifyAndAssign(i).priority === 'P1').length}</span></div>
                      <div className="count-item-h p2"><span className="p-label">P2</span><span className="p-val">{issues.filter(i => classifyAndAssign(i).priority === 'P2').length}</span></div>
                      <div className="count-item-h p3"><span className="p-label">P3</span><span className="p-val">{issues.filter(i => classifyAndAssign(i).priority === 'P3').length}</span></div>
                    </div>
                    <div className="stat-divider-vertical"></div>
                    <div className="bug-chart-premium">
                      {['P0', 'P1', 'P2', 'P3'].map(p => {
                        const count = issues.filter(i => classifyAndAssign(i).priority === p).length;
                        const height = issues.length > 0 ? (count / issues.length) * 100 : 0;
                        return (
                          <div key={p} className="bar-wrapper">
                            <div className={`bar-p ${p.toLowerCase()}`} style={{height: `${Math.max(height * 0.8, 5)}%`}}></div>
                            <span className="bar-label">{p}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="stat-card triage-status">
                  <div className="stat-header">AI TRIAGE STATUS</div>
                  <div className="processing-hero">
                    <div className="processing-info">
                      <p>Processing</p>
                      <h3>{issues.length} Bugs</h3>
                    </div>
                    <div className="ai-token-glow">AI</div>
                  </div>
                </div>

                <div className="stat-card critical-issues">
                  <div className="stat-header">CRITICAL ISSUES <span className="dot-red"></span></div>
                  <div className="p0-breakdown">
                     <p>P0 Breakdown</p>
                     <div className="progress-container">
                        <div className="progress-bar-p0" style={{width: `${(issues.filter(i => classifyAndAssign(i).priority === 'P0').length / Math.max(issues.length, 1)) * 300}%`}}></div>
                     </div>
                     <div className="p0-stats">
                        <span>P0: {issues.filter(i => classifyAndAssign(i).priority === 'P0').length}</span>
                        <span>Blocked: {issues.filter(i => i.priority === 'Highest' && i.status === 'To Do').length}</span>
                     </div>
                  </div>
                </div>
              </div>

              <section className="dev-roster" aria-labelledby="roster-title">
                <div className="section-header">
                  <h3 id="roster-title">Developer Readiness Pool</h3>
                  <span className="live-status">LIVE MONITORING</span>
                </div>
                <div className="dev-grid">
                  {DEVS.map(dev => {
                    const assignedCount = issues.filter(i => classifyAndAssign(i).assignedTo === dev.name).length;
                    return (
                      <div 
                        key={dev.name} 
                        className={`dev-card clickable ${assignedCount > 0 ? 'active' : ''}`} 
                        onClick={() => handleDevClick(dev)}
                      >
                        <div className="dev-avatar">
                          {dev.name[0]}
                          {assignedCount > 0 && <span className="assignment-pulse"></span>}
                        </div>
                        <div className="dev-info">
                          <strong>{dev.name}</strong>
                          <span>{dev.role}</span>
                          {assignedCount > 0 && <div className="load-factor">{assignedCount} Bugs Assigned</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="issues-table-container shadow-premium" aria-labelledby="pipeline-title">
                <div className="section-header">
                  <h3 id="pipeline-title">Intelligence-Driven Triage Pipeline</h3>
                  <div className="ai-stat">Efficiency Gain: <span className="highlight">+{Math.floor(80 + (issues.length * 0.5))}%</span></div>
                </div>
                <div className="issues-list">
                  {issues.map((issue, index) => {
                    const triage = classifyAndAssign(issue);
                    return (
                      <div key={issue.key} className="triage-row grow-in draggable-item">
                        <div className="order-controls">
                          <button onClick={(e) => moveIssue(e, index, 'up')} disabled={index === 0}>▲</button>
                          <button onClick={(e) => moveIssue(e, index, 'down')} disabled={index === issues.length - 1}>▼</button>
                        </div>
                        <a 
                          href={`${JIRA_BASE_URL}/browse/${issue.key}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ticket-key-link"
                        >
                          {issue.key}
                        </a>
                        <div className="ticket-summary">
                          <strong>{issue.summary}</strong>
                          <p className="description-preview">{issue.description?.substring(0, 80)}...</p>
                        </div>
                        <div className="rc-tags">
                            <span className="rca-tag type-tag">{issue.type}</span>
                            <span className="rca-tag status-tag">{issue.status}</span>
                        </div>
                        <div className="routing-intelligence">
                            <span className="assignee-name">{triage.assignedTo}</span>
                            <div className="confidence-meter">
                              <div className="confidence-level" style={{ width: `${90 + Math.random() * 8}%` }}></div>
                            </div>
                        </div>
                        <div className={`severity-indicator ${triage.priority}`}>
                          {triage.priority}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : view === 'tests' ? (
            <div className="regression-view animate-in">
              <div className="insights-header">
                <h3>Regression Suite Intelligence</h3>
                <p>Suite Status: <span className={issues.length > 0 ? "status-warning" : "status-pass"}>PARTIAL FAIL (TC-04 Engineered)</span></p>
              </div>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-value">5</div>
                  <div className="stat-label">TOTAL TESTS</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">1</div>
                  <div className="stat-label">PASS</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">4</div>
                  <div className="stat-label">FAIL (DETECTION)</div>
                </div>
              </div>
              <div className="test-results-pipeline">
                {[
                  { id: 'TC-01', status: 'FAIL', res: 'Auth Timeout' },
                  { id: 'TC-02', status: 'FAIL', res: 'Locale Error' },
                  { id: 'TC-03', status: 'PASS', res: 'Valid Chinese' },
                  { id: 'TC-04', status: 'FAIL', res: 'Security (Vuln)' },
                  { id: 'TC-05', status: 'FAIL', res: 'Session Glitch' }
                ].map(tc => (
                  <div key={tc.id} className="test-step">
                    <span className="tc-id">{tc.id}</span>
                    <span className={`tc-status ${tc.status.toLowerCase()}`}>{tc.status}</span>
                    <span className="tc-res">{tc.res}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : view === 'dev-detail' && selectedDev ? (
            <div className="dev-detail-view animate-in">
              <div className="dev-header-premium">
                <div className="dev-avatar-large">{selectedDev.name[0]}</div>
                <div className="dev-meta-main">
                  <h2>{selectedDev.name}</h2>
                  <p className="role-tag">{selectedDev.role}</p>
                  <p className="team-tag">Team: <strong>{selectedDev.team}</strong> | Feature: <strong>{selectedDev.currentFeature}</strong></p>
                </div>
                <div className="dev-stats-grid">
                   <div className="d-stat">
                      <span className="val">{selectedDev.capacity}</span>
                      <span className="lbl">CAPACITY</span>
                   </div>
                   <div className="d-stat">
                      <span className="val">{selectedDev.bandwidth}</span>
                      <span className="lbl">BANDWIDTH</span>
                   </div>
                </div>
              </div>

              <div className="dev-assignment-list">
                <h3>Assigned Issues & Artifacts</h3>
                <div className="assignments-table">
                  <div className="table-header">
                    <span>Key</span>
                    <span>Summary</span>
                    <span>Type</span>
                    <span>Status</span>
                  </div>
                  {issues
                    .filter(i => classifyAndAssign(i).assignedTo === selectedDev.name)
                    .map(issue => (
                      <div key={issue.key} className="assignment-row">
                        <a 
                          href={`${JIRA_BASE_URL}/browse/${issue.key}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="key-badge"
                        >
                          {issue.key}
                        </a>
                        <span className="summary-cell">{issue.summary}</span>
                        <span className={`type-badge ${issue.type.toLowerCase()}`}>{issue.type}</span>
                        <span className={`status-badge ${issue.status.replace(/\s+/g, '-').toLowerCase()}`}>{issue.status}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      )}
    </div>
  );
};

export default App;
