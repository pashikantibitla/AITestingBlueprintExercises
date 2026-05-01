import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import History from './pages/History';
import BugTriage from './pages/BugTriage';
import { Settings as SettingsIcon, LayoutDashboard, History as HistoryIcon, Bug } from 'lucide-react';

export type Page = 'dashboard' | 'settings' | 'history' | 'bug-triage';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems = [
    { id: 'dashboard' as Page, label: 'Generate Test Plan', icon: LayoutDashboard },
    { id: 'bug-triage' as Page, label: 'Bug Triage', icon: Bug },
    { id: 'history' as Page, label: 'History', icon: HistoryIcon },
    { id: 'settings' as Page, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        navItems={navItems}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'bug-triage' && <BugTriage />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'history' && <History />}
        </div>
      </main>
    </div>
  );
}

export default App;
