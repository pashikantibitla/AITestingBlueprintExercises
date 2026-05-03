import { TestTube } from 'lucide-react';
import type { Page } from '../App';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  navItems: NavItem[];
}

function Sidebar({ currentPage, onPageChange, navItems }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <TestTube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Test Plan Agent</h1>
            <p className="text-xs text-gray-500">AI-Powered Testing</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 text-center">
          v1.0.0 • Local Mode
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
