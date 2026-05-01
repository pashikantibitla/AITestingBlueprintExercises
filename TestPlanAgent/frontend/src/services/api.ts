const API_BASE = 'http://localhost:3001/api';

// Settings APIs
export const settingsApi = {
  getJira: () => fetch(`${API_BASE}/settings/jira`).then(r => r.json()),
  saveJira: (data: any) => fetch(`${API_BASE}/settings/jira`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getLLM: () => fetch(`${API_BASE}/settings/llm`).then(r => r.json()),
  saveLLM: (data: any) => fetch(`${API_BASE}/settings/llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};

// JIRA APIs
export const jiraApi = {
  testConnection: () => fetch(`${API_BASE}/jira/test`).then(r => r.json()),
  fetchTicket: (ticketId: string) => fetch(`${API_BASE}/jira/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId })
  }).then(r => r.json()),
  getRecent: () => fetch(`${API_BASE}/jira/recent`).then(r => r.json()),
};

// LLM APIs
export const llmApi = {
  testGroq: (apiKey: string, model: string) => fetch(`${API_BASE}/llm/test/groq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, model })
  }).then(r => r.json()),
  
  testOllama: (baseUrl: string) => fetch(`${API_BASE}/llm/test/ollama`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl })
  }).then(r => r.json()),
  
  getOllamaModels: () => fetch(`${API_BASE}/llm/models/ollama`).then(r => r.json()),
  getGroqModels: () => fetch(`${API_BASE}/llm/models/groq`).then(r => r.json()),
};

// Template APIs
export const templateApi = {
  getAll: () => fetch(`${API_BASE}/templates`).then(r => r.json()),
  getById: (id: number) => fetch(`${API_BASE}/templates/${id}`).then(r => r.json()),
  getDefault: () => fetch(`${API_BASE}/templates/default/content`).then(r => r.json()),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('template', file);
    return fetch(`${API_BASE}/templates/upload`, {
      method: 'POST',
      body: formData
    }).then(r => r.json());
  },
  delete: (id: number) => fetch(`${API_BASE}/templates/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

// Test Plan APIs
export const testPlanApi = {
  generate: (data: any) => fetch(`${API_BASE}/testplan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getHistory: () => fetch(`${API_BASE}/testplan/history`).then(r => r.json()),
  getHistoryById: (id: number) => fetch(`${API_BASE}/testplan/history/${id}`).then(r => r.json()),
};

// Bug Triage APIs
export const bugTriageApi = {
  getAll: () => fetch(`${API_BASE}/bug-triage`).then(r => r.json()),
  getById: (id: number) => fetch(`${API_BASE}/bug-triage/${id}`).then(r => r.json()),
  create: (data: any) => fetch(`${API_BASE}/bug-triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id: number) => fetch(`${API_BASE}/bug-triage/${id}`, { method: 'DELETE' }).then(r => r.json()),
  seed: () => fetch(`${API_BASE}/bug-triage/seed`, { method: 'POST' }).then(r => r.json()),
};

export default {
  settings: settingsApi,
  jira: jiraApi,
  llm: llmApi,
  templates: templateApi,
  testPlan: testPlanApi,
  bugTriage: bugTriageApi,
};
