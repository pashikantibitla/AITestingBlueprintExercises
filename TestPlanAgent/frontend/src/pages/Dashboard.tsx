import { useState, useEffect } from 'react';
import { 
  Search, Loader2, FileText, AlertCircle, CheckCircle, 
  RefreshCw, Download, Copy, Sparkles, History, Tag, User
} from 'lucide-react';
import { jiraApi, templateApi, testPlanApi } from '../services/api';

interface TicketData {
  key: string;
  summary: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  reporter?: string;
  labels?: string[];
  issueType?: string;
  created?: string;
  updated?: string;
}

function Dashboard() {
  const [ticketId, setTicketId] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  
  const steps = ['Fetching Ticket', 'Loading Template', 'Generating Plan', 'Complete'];

  useEffect(() => {
    loadRecentTickets();
    loadDefaultTemplate();
  }, []);

  const loadRecentTickets = async () => {
    try {
      const recent = await jiraApi.getRecent();
      setRecentTickets(recent);
    } catch (error) {
      console.error('Failed to load recent tickets:', error);
    }
  };

  const loadDefaultTemplate = async () => {
    try {
      const template = await templateApi.getDefault();
      setTemplateContent(template.content);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const fetchTicket = async () => {
    if (!ticketId.trim()) return;
    
    // Validate format
    const regex = /^[A-Z]+-\d+$/;
    if (!regex.test(ticketId.trim())) {
      setFetchError('Invalid format. Expected: PROJECT-123');
      return;
    }

    setIsFetching(true);
    setFetchError('');
    setTicketData(null);
    setGeneratedContent('');

    try {
      const data = await jiraApi.fetchTicket(ticketId.trim());
      if (data.error) {
        setFetchError(data.error);
      } else {
        setTicketData(data);
        loadRecentTickets(); // Refresh recent list
      }
    } catch (error: any) {
      setFetchError(error.message || 'Failed to fetch ticket');
    } finally {
      setIsFetching(false);
    }
  };

  const generateTestPlan = async () => {
    if (!ticketData) return;
    
    setIsGenerating(true);
    setGenerationError('');
    setGenerationStep(0);
    setGeneratedContent('');

    try {
      // Step 1: Fetching ticket (already done)
      setGenerationStep(0);
      await new Promise(r => setTimeout(r, 500));
      
      // Step 2: Loading template
      setGenerationStep(1);
      await new Promise(r => setTimeout(r, 500));
      
      // Step 3: Generating
      setGenerationStep(2);
      
      const result = await testPlanApi.generate({
        ticketId: ticketData.key,
        ticketData,
        templateContent,
        provider: 'groq'
      });
      
      if (result.error) {
        setGenerationError(result.error);
      } else {
        setGeneratedContent(result.content);
        setGenerationStep(3);
      }
    } catch (error: any) {
      setGenerationError(error.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Copied to clipboard!');
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-plan-${ticketData?.key || 'generated'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Generate Test Plan</h1>
      </div>

      {/* Step 1: Ticket Input */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
          Enter JIRA Ticket ID
        </h2>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              className="input pl-10"
              placeholder="e.g., ENG-123"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && fetchTicket()}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={fetchTicket}
            disabled={isFetching || !ticketId.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {isFetching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
            ) : (
              <><Search className="w-4 h-4" /> Fetch Ticket</>
            )}
          </button>
        </div>

        {fetchError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {fetchError}
          </div>
        )}

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <History className="w-4 h-4" /> Recent tickets:
            </p>
            <div className="flex flex-wrap gap-2">
              {recentTickets.map((ticket) => (
                <button
                  key={ticket.ticketId}
                  onClick={() => {
                    setTicketId(ticket.ticketId);
                    setTicketData(ticket);
                    setFetchError('');
                    setGeneratedContent('');
                  }}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                >
                  {ticket.ticketId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Ticket Display */}
      {ticketData && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
            Ticket Details
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  {ticketData.key}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">{ticketData.summary}</h3>
              </div>
              <div className="flex gap-2">
                {ticketData.priority && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    {ticketData.priority}
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {ticketData.status}
                </span>
              </div>
            </div>

            {ticketData.description && (
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                {ticketData.description.length > 300 
                  ? ticketData.description.substring(0, 300) + '...' 
                  : ticketData.description}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t border-gray-200">
              {ticketData.reporter && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> Reporter: {ticketData.reporter}
                </span>
              )}
              {ticketData.assignee && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> Assignee: {ticketData.assignee}
                </span>
              )}
              {ticketData.labels && ticketData.labels.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" /> {ticketData.labels.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={generateTestPlan}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Test Plan</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Generation Progress</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  index < generationStep ? 'bg-green-500 text-white' :
                  index === generationStep ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {index < generationStep ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  index <= generationStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {generationError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {generationError}
        </div>
      )}

      {/* Generated Output */}
      {generatedContent && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Generated Test Plan
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={generateTestPlan}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Preview</span>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <div className="markdown-preview whitespace-pre-wrap">
                {generatedContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
