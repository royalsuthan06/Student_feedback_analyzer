import React from 'react';
import {
  BarChart3,
  PenLine,
  Database,
  RefreshCw,
  Download,
  TableProperties,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'submit' | 'records';
  setActiveTab: (tab: 'dashboard' | 'submit' | 'records') => void;
  totalResponses: number;
  onSeedData: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalResponses,
  onSeedData,
  onResetData,
  onExportCSV,
  isLoading,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              FL
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                FeedbackLens <span className="text-indigo-600 font-semibold">AI</span>
              </h1>
              <p className="text-xs text-slate-500">
                Student Feedback & Actionable Insights Dashboard
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Live Database status counter */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>
                <strong className="text-slate-900">{totalResponses}</strong> Total Responses
              </span>
            </div>

            {/* Seed Benchmark Data */}
            <button
              onClick={onSeedData}
              disabled={isLoading}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Load Sample Data</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetData}
              disabled={isLoading}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 font-medium transition-colors disabled:opacity-50"
            >
              <span>Clear Data</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Clean Tab Navigation */}
        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'submit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PenLine className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'records'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Feedback Records</span>
            </button>
          </nav>

          <div className="hidden sm:block text-xs text-slate-400">
            Automated Sentiment & Topic Analysis
          </div>
        </div>
      </div>
    </header>
  );
};
