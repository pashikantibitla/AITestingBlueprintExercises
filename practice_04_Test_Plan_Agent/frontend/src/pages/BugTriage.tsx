import { useState, useEffect } from 'react';
import { 
  Bug, Filter, ChevronDown, Calendar, Users, User, Tag, 
  AlertTriangle, TrendingUp, CheckSquare, Loader2,
  ShieldAlert, Zap, Server, Layout
} from 'lucide-react';
import { bugTriageApi } from '../services/api';

interface BugReport {
  id: number;
  bug_id: string;
  title: string;
  description: string;
  created_date: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  assigned_team: string;
  assigned_dev: string;
  qa_effort: string;
  dev_effort: string;
  business_impact: string;
  acceptance_criteria: string[];
  recommended_action: string;
  root_cause: string;
}

const severityConfig = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Zap },
  Low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckSquare },
};

const priorityConfig = {
  P0: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  P1: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  P2: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  P3: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const categoryConfig: Record<string, { bg: string; text: string }> = {
  UI: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Backend: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Database: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  Security: { bg: 'bg-red-50', text: 'text-red-700' },
  Performance: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  Integration: { bg: 'bg-pink-50', text: 'text-pink-700' },
};

function BugTriage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadBugs();
  }, []);

  const loadBugs = async () => {
    try {
      setLoading(true);
      const data = await bugTriageApi.getAll();
      if (Array.isArray(data) && data.length === 0) {
        // No data yet, don't show error
        setBugs([]);
      } else if (Array.isArray(data)) {
        setBugs(data);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bug triage reports');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      setSeeding(true);
      await bugTriageApi.seed();
      await loadBugs();
    } catch (err: any) {
      setError(err.message || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const filteredBugs = bugs.filter(bug => {
    if (activeFilter === 'all') return true;
    return bug.severity === activeFilter || bug.priority === activeFilter;
  });

  const stats = {
    total: bugs.length,
    critical: bugs.filter(b => b.severity === 'Critical').length,
    high: bugs.filter(b => b.severity === 'High').length,
    medium: bugs.filter(b => b.severity === 'Medium').length,
    p0p1: bugs.filter(b => b.priority === 'P0' || b.priority === 'P1').length,
    totalEffort: bugs.reduce((acc, b) => {
      const devHours = parseInt(b.dev_effort?.replace(/\D/g, '') || '0');
      const qaHours = parseInt(b.qa_effort?.replace(/\D/g, '') || '0');
      return acc + devHours + qaHours;
    }, 0),
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'Critical', label: 'Critical' },
    { key: 'High', label: 'High' },
    { key: 'Medium', label: 'Medium' },
    { key: 'P0', label: 'P0' },
    { key: 'P1', label: 'P1' },
    { key: 'P2', label: 'P2' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Triage Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">CrewAI-powered intelligent bug analysis</p>
        </div>
        <div className="flex gap-2">
          {bugs.length === 0 && (
            <button 
              onClick={seedData}
              disabled={seeding}
              className="btn btn-secondary flex items-center gap-2"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
              Load Sample Data
            </button>
          )}
          <button className="btn btn-primary flex items-center gap-2">
            <Bug className="w-4 h-4" />
            New Triage
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bugs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Critical</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">P0 / P1</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.p0p1}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Effort</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEffort}h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bug Cards */}
      <div className="space-y-4">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-16 card">
            <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No bugs found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {bugs.length === 0 ? 'Load sample data or create a new triage report.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          filteredBugs.map(bug => {
            const sev = severityConfig[bug.severity] || severityConfig.Low;
            const pri = priorityConfig[bug.priority] || priorityConfig.P3;
            const cat = categoryConfig[bug.category] || { bg: 'bg-gray-50', text: 'text-gray-700' };
            const SevIcon = sev.icon;
            const isExpanded = expandedId === bug.id;

            return (
              <div key={bug.id} className="card hover:shadow-md transition-all">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {bug.bug_id}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sev.bg} ${sev.text} border ${sev.border}`}>
                          <SevIcon className="w-3 h-3" />
                          {bug.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pri.bg} ${pri.text} border ${pri.border}`}>
                          {bug.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{bug.title}</h3>
                    </div>
                    <button 
                      onClick={() => toggleExpand(bug.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {bug.created_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{bug.assigned_team}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{bug.assigned_dev}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.bg} ${cat.text}`}>
                        {bug.category}
                      </span>
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-gray-200 space-y-5">
                      {/* Effort & Action */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-3 border border-gray-100">
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">QA Effort</p>
                            <p className="text-base font-bold text-gray-900">{bug.qa_effort}</p>
                          </div>
                          <div className="w-px h-6 bg-gray-300"></div>
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dev Effort</p>
                            <p className="text-base font-bold text-gray-900">{bug.dev_effort}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          bug.recommended_action === 'Immediate fix' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {bug.recommended_action}
                        </span>
                      </div>

                      {/* Description & RCA */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="pl-3 border-l-3 border-blue-400">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Layout className="w-3.5 h-3.5" /> Bug Description
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{bug.description}</p>
                        </div>
                        <div className="pl-3 border-l-3 border-purple-400">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5" /> Root Cause Analysis
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{bug.root_cause}</p>
                        </div>
                      </div>

                      {/* Business Impact */}
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" /> Business Impact
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{bug.business_impact}</p>
                      </div>

                      {/* Acceptance Criteria */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4" /> Acceptance Criteria / Fix Criteria
                        </h4>
                        <ul className="space-y-1.5">
                          {bug.acceptance_criteria?.map((criteria, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-600 font-bold mt-0.5">✓</span>
                              <span>{criteria}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-gray-500">No criteria defined</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BugTriage;
