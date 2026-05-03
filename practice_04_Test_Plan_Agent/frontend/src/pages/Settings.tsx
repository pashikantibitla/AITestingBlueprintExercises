import { useState, useEffect } from 'react';
import { 
  Check, X, Server, Cloud, FileText, 
  TestTube, Loader2, AlertCircle 
} from 'lucide-react';
import { settingsApi, llmApi } from '../services/api';

function Settings() {
  const [activeTab, setActiveTab] = useState<'jira' | 'llm' | 'templates'>('jira');
  
  // JIRA Settings
  const [jiraSettings, setJiraSettings] = useState({
    baseUrl: '',
    username: '',
    apiToken: ''
  });
  const [jiraStatus, setJiraStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  
  // LLM Settings
  const [llmSettings, setLlmSettings] = useState({
    provider: 'groq',
    groqApiKey: '',
    groqModel: 'llama3-70b-8192',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
    temperature: 0.7
  });
  const [groqStatus, setGroqStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const groqModels = [
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma-7b-it', name: 'Gemma 7B' }
  ];

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const jira = await settingsApi.getJira();
      setJiraSettings({
        baseUrl: jira.jira_base_url || '',
        username: jira.jira_username || '',
        apiToken: jira.jira_api_token || ''
      });

      const llm = await settingsApi.getLLM();
      setLlmSettings({
        provider: llm.llm_provider || 'groq',
        groqApiKey: llm.groq_api_key || '',
        groqModel: llm.groq_model || 'llama3-70b-8192',
        ollamaUrl: llm.ollama_base_url || 'http://localhost:11434',
        ollamaModel: llm.ollama_model || 'llama3',
        temperature: parseFloat(llm.llm_temperature) || 0.7
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const testJiraConnection = async () => {
    setJiraStatus('testing');
    try {
      await settingsApi.saveJira(jiraSettings);
      const result = await fetch('http://localhost:3001/api/jira/test').then(r => r.json());
      setJiraStatus(result.connected ? 'connected' : 'error');
    } catch (error) {
      setJiraStatus('error');
    }
  };

  const testGroqConnection = async () => {
    setGroqStatus('testing');
    try {
      const result = await llmApi.testGroq(llmSettings.groqApiKey, llmSettings.groqModel);
      setGroqStatus(result.connected ? 'connected' : 'error');
    } catch (error) {
      setGroqStatus('error');
    }
  };

  const testOllamaConnection = async () => {
    setOllamaStatus('testing');
    try {
      const result = await llmApi.testOllama(llmSettings.ollamaUrl);
      setOllamaStatus(result.connected ? 'connected' : 'error');
      if (result.connected && result.models) {
        setOllamaModels(result.models);
      }
    } catch (error) {
      setOllamaStatus('error');
    }
  };

  const saveLLMSettings = async () => {
    await settingsApi.saveLLM(llmSettings);
    alert('LLM settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'jira', label: 'JIRA', icon: Server },
          { id: 'llm', label: 'LLM Provider', icon: Cloud },
          { id: 'templates', label: 'Templates', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* JIRA Settings */}
      {activeTab === 'jira' && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">JIRA Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">JIRA Base URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://your-domain.atlassian.net"
                value={jiraSettings.baseUrl}
                onChange={(e) => setJiraSettings({...jiraSettings, baseUrl: e.target.value})}
              />
            </div>

            <div>
              <label className="label">Username / Email</label>
              <input
                type="email"
                className="input"
                placeholder="your-email@example.com"
                value={jiraSettings.username}
                onChange={(e) => setJiraSettings({...jiraSettings, username: e.target.value})}
              />
            </div>

            <div>
              <label className="label">API Token</label>
              <input
                type="password"
                className="input"
                placeholder="Your JIRA API token"
                value={jiraSettings.apiToken}
                onChange={(e) => setJiraSettings({...jiraSettings, apiToken: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate at: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Atlassian Account Settings</a>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={testJiraConnection}
                disabled={jiraStatus === 'testing'}
                className="btn-primary flex items-center gap-2"
              >
                {jiraStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                <TestTube className="w-4 h-4" />
                Test Connection
              </button>

              {jiraStatus === 'connected' && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-5 h-5" /> Connected
                </span>
              )}
              {jiraStatus === 'error' && (
                <span className="flex items-center gap-1 text-red-600">
                  <X className="w-5 h-5" /> Connection failed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LLM Settings */}
      {activeTab === 'llm' && (
        <div className="space-y-6">
          <div className="card p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">LLM Provider</h2>
            
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="groq"
                  checked={llmSettings.provider === 'groq'}
                  onChange={(e) => setLlmSettings({...llmSettings, provider: e.target.value})}
                  className="w-4 h-4 text-blue-600"
                />
                <Cloud className="w-4 h-4" />
                Groq (Cloud)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="ollama"
                  checked={llmSettings.provider === 'ollama'}
                  onChange={(e) => setLlmSettings({...llmSettings, provider: e.target.value})}
                  className="w-4 h-4 text-blue-600"
                />
                <Server className="w-4 h-4" />
                Ollama (Local)
              </label>
            </div>

            {llmSettings.provider === 'groq' ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Groq API Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="gsk_..."
                    value={llmSettings.groqApiKey}
                    onChange={(e) => setLlmSettings({...llmSettings, groqApiKey: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Model</label>
                  <select
                    className="input"
                    value={llmSettings.groqModel}
                    onChange={(e) => setLlmSettings({...llmSettings, groqModel: e.target.value})}
                  >
                    {groqModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={testGroqConnection}
                    disabled={groqStatus === 'testing'}
                    className="btn-primary flex items-center gap-2"
                  >
                    {groqStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Test Connection
                  </button>
                  {groqStatus === 'connected' && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-5 h-5" /> Connected
                    </span>
                  )}
                  {groqStatus === 'error' && (
                    <span className="flex items-center gap-1 text-red-600">
                      <X className="w-5 h-5" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Ollama Base URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="http://localhost:11434"
                    value={llmSettings.ollamaUrl}
                    onChange={(e) => setLlmSettings({...llmSettings, ollamaUrl: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Model</label>
                  <select
                    className="input"
                    value={llmSettings.ollamaModel}
                    onChange={(e) => setLlmSettings({...llmSettings, ollamaModel: e.target.value})}
                  >
                    {ollamaModels.length > 0 ? (
                      ollamaModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))
                    ) : (
                      <option value="llama3">llama3 (default)</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={testOllamaConnection}
                    disabled={ollamaStatus === 'testing'}
                    className="btn-primary flex items-center gap-2"
                  >
                    {ollamaStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Test Connection
                  </button>
                  {ollamaStatus === 'connected' && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-5 h-5" /> Connected
                    </span>
                  )}
                  {ollamaStatus === 'error' && (
                    <span className="flex items-center gap-1 text-red-600">
                      <X className="w-5 h-5" /> Failed
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="label">Temperature: {llmSettings.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={llmSettings.temperature}
                onChange={(e) => setLlmSettings({...llmSettings, temperature: parseFloat(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>

            <button
              onClick={saveLLMSettings}
              className="btn-primary mt-6"
            >
              Save LLM Settings
            </button>
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Management</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload a PDF template</p>
            <p className="text-sm text-gray-400 mb-4">Drag and drop or click to browse</p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="template-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  alert(`Template "${file.name}" uploaded successfully!`);
                }
              }}
            />
            <label
              htmlFor="template-upload"
              className="btn-secondary cursor-pointer inline-block"
            >
              Choose File
            </label>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Default template is currently active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
