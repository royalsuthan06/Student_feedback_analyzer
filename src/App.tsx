/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { SummaryMetrics } from './components/SummaryMetrics.tsx';
import { ActionableCards } from './components/ActionableCards.tsx';
import { Charts } from './components/Charts.tsx';
import { SemanticClusters } from './components/SemanticClusters.tsx';
import { FeedbackForm } from './components/FeedbackForm.tsx';
import { FeedbackTable } from './components/FeedbackTable.tsx';
import { FeedbackAnalytics, FeedbackItem, FeedbackSubmission } from './types/feedback.ts';
import { feedbackStorage } from './db/storage.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'records'>('dashboard');
  const [analytics, setAnalytics] = useState<FeedbackAnalytics>(() => feedbackStorage.getAnalytics());
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => feedbackStorage.getFilteredFeedback());
  const [selectedTopicForTable, setSelectedTopicForTable] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Sync data from backend or local storage
  const syncData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        const itemsRes = await fetch('/api/feedback');
        if (itemsRes.ok) {
          const items = await itemsRes.json();
          setFeedbackItems(items);
          return;
        }
      }
    } catch {
      // Fallback seamlessly to local storage
    }
    setAnalytics(feedbackStorage.getAnalytics());
    setFeedbackItems(feedbackStorage.getFilteredFeedback());
  }, []);

  useEffect(() => {
    syncData();
  }, [syncData]);

  // Handle student feedback submission
  const handleSubmitFeedback = async (submission: FeedbackSubmission): Promise<boolean> => {
    setIsLoading(true);
    try {
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.analytics) setAnalytics(data.analytics);
          await syncData();
          showToast(`Feedback submitted successfully!`, 'success');
          return true;
        }
      } catch {
        // Fallback
      }

      feedbackStorage.addFeedback(submission);
      setAnalytics(feedbackStorage.getAnalytics());
      setFeedbackItems(feedbackStorage.getFilteredFeedback());
      showToast(`Feedback submitted successfully!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err?.message || 'Submission failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample dataset
  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) {
          await syncData();
          showToast('Sample student feedback data loaded successfully!', 'success');
          return;
        }
      } catch {
        // Fallback
      }

      feedbackStorage.seedDataset();
      setAnalytics(feedbackStorage.getAnalytics());
      setFeedbackItems(feedbackStorage.getFilteredFeedback());
      showToast('Sample student feedback data loaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to load sample data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear data
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to clear all feedback records? You can re-load sample data anytime.')) {
      return;
    }
    setIsLoading(true);
    try {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          await syncData();
          showToast('All feedback records have been cleared.', 'info');
          return;
        }
      } catch {
        // Fallback
      }

      feedbackStorage.resetToEmpty();
      setAnalytics(feedbackStorage.getAnalytics());
      setFeedbackItems(feedbackStorage.getFilteredFeedback());
      showToast('All feedback records have been cleared.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to clear data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = feedbackStorage.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_feedback_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Feedback exported as CSV.', 'success');
  };

  const handleSelectTopicForAudit = (topicName: string) => {
    setSelectedTopicForTable(topicName);
    setActiveTab('records');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalResponses={analytics.total_responses}
        onSeedData={handleSeedData}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top KPI Metrics */}
            <SummaryMetrics analytics={analytics} />

            {/* Priority Issues & Key Strengths Cards */}
            <ActionableCards
              topIssues={analytics.top_recurring_issues}
              topPraises={analytics.top_recurring_praises}
              onSelectTopic={handleSelectTopicForAudit}
            />

            {/* Visual Analytics Charts */}
            <Charts analytics={analytics} />

            {/* Topic Breakdown & Clustered Responses */}
            <SemanticClusters
              topics={analytics.all_topics}
              onSelectTopicForAudit={handleSelectTopicForAudit}
            />
          </div>
        )}

        {activeTab === 'submit' && (
          <FeedbackForm
            onSubmit={handleSubmitFeedback}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'records' && (
          <FeedbackTable
            items={feedbackItems}
            preselectedTopic={selectedTopicForTable}
            onClearTopicFilter={() => setSelectedTopicForTable(undefined)}
          />
        )}
      </main>

      {/* Clean User-Friendly Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">FeedbackLens AI</span>
            <span>·</span>
            <span>Student Feedback & Actionable Insights</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Designed for Students, Faculty & Academic Administration
          </div>
        </div>
      </footer>
    </div>
  );
}
