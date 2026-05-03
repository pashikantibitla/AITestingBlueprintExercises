import { useState, useEffect } from 'react';
import { 
  Clock, ExternalLink, 
  AlertCircle, Loader2, Search, Download
} from 'lucide-react';
import { testPlanApi } from '../services/api';

interface TestPlanHistory {
  id: number;
  ticket_id: string;
  ticket_summary: string;
  provider: string;
  created_at: string;
  generated_content?: string;
}

function History() {
  const [history, setHistory] = useState<TestPlanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<TestPlanHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await testPlanApi.getHistory();
      setHistory(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const viewPlanDetails = async (plan: TestPlanHistory) => {
    try {
      const details = await testPlanApi.getHistoryById(plan.id);
      setSelectedPlan(details);
    } catch (error) {
      console.error('Failed to load plan details:', error);
    }
  };

  const downloadPlan = (plan: TestPlanHistory) => {
    if (!plan.generated_content) return;
    
    const blob = new Blob([plan.generated_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-plan-${plan.ticket_id}-${plan.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter(plan =>
    plan.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.ticket_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Plan History</h1>
        <button
          onClick={loadHistory}
          className="btn-secondary flex items-center gap-2"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by ticket ID or summary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* History List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No test plans generated yet</p>
              <p className="text-sm">Generate your first test plan from the Dashboard</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredHistory.map((plan) => (
                <div
                  key={plan.id}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                          {plan.ticket_id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          plan.provider === 'groq' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {plan.provider}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">
                        {plan.ticket_summary || 'No summary'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(plan.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewPlanDetails(plan)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadPlan(plan)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Test Plan: {selectedPlan.ticket_id}
                </h2>
                <p className="text-sm text-gray-500">
                  Generated on {formatDate(selectedPlan.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="markdown-preview whitespace-pre-wrap">
                {selectedPlan.generated_content}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedPlan(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => downloadPlan(selectedPlan)}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
