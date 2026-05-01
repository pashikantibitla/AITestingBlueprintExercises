import { useState } from 'react';
import { Job } from './types/job';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sampleJobs } from './data/initialData';
import { KanbanBoard } from './components/KanbanBoard';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, Kanban, Plus, Trash2, Download, Upload, Briefcase } from 'lucide-react';

type ViewMode = 'kanban' | 'dashboard';

function App() {
  const [jobs, setJobs] = useLocalStorage<Job[]>('job-assistant-jobs', sampleJobs);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const handleExportData = () => {
    const dataStr = JSON.stringify(jobs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedJobs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedJobs)) {
          if (confirm(`Import ${importedJobs.length} jobs? This will replace your current data.`)) {
            setJobs(importedJobs);
          }
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setJobs([]);
    }
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => 
    ['applied', 'screening', 'interview', 'offer'].includes(j.status)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Job Assistant</h1>
              </div>
              
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 ml-4">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'dashboard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600 mr-4">
                <span>Total: <strong className="text-gray-900">{totalJobs}</strong></span>
                <span>Active: <strong className="text-gray-900">{activeJobs}</strong></span>
              </div>

              {/* Data Actions */}
              <div className="flex items-center gap-2">
                <label className="btn-secondary cursor-pointer hidden sm:flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleExportData}
                  className="btn-secondary hidden sm:flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleClearData}
                  className="btn-secondary hidden sm:flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex sm:hidden items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'dashboard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'kanban' ? (
          <div className="h-[calc(100vh-140px)]">
            <KanbanBoard jobs={jobs} setJobs={setJobs} />
          </div>
        ) : (
          <Dashboard jobs={jobs} />
        )}
      </main>

      {/* Quick Add Button - Only show in Kanban view */}
      {viewMode === 'kanban' && (
        <button
          onClick={() => {
            const kanbanBoard = document.querySelector('[data-kanban]');
            if (kanbanBoard) {
              const event = new CustomEvent('openAddModal', { detail: 'wishlist' });
              kanbanBoard.dispatchEvent(event);
            }
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default App;
