import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  FeedbackItem,
  SentimentType,
} from '../types/feedback.ts';

interface FeedbackTableProps {
  items: FeedbackItem[];
  preselectedTopic?: string;
  onClearTopicFilter?: () => void;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  items,
  preselectedTopic,
  onClearTopicFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>(preselectedTopic || 'all');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  const allCategories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items]
  );
  const allTopics = useMemo(
    () => Array.from(new Set(items.map((i) => i.topic))).sort(),
    [items]
  );
  const allDepartments = useMemo(
    () => Array.from(new Set(items.map((i) => i.department))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedDept !== 'all' && item.department !== selectedDept) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedSentiment !== 'all' && item.sentiment !== selectedSentiment) return false;
      if (selectedRating !== 'all' && item.rating !== Number(selectedRating)) return false;
      if (selectedTopic !== 'all' && item.topic !== selectedTopic) return false;

      if (searchTerm.trim().length > 0) {
        const q = searchTerm.toLowerCase();
        const matchesText = item.feedback_text.toLowerCase().includes(q);
        const matchesTopic = item.topic.toLowerCase().includes(q);
        const matchesDept = item.department.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesStudentId = item.student_id ? item.student_id.toLowerCase().includes(q) : false;
        if (!matchesText && !matchesTopic && !matchesDept && !matchesId && !matchesStudentId) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedDept, selectedCategory, selectedSentiment, selectedRating, selectedTopic, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedCategory('all');
    setSelectedSentiment('all');
    setSelectedRating('all');
    setSelectedTopic('all');
    setPage(1);
    if (onClearTopicFilter) onClearTopicFilter();
  };

  const getSentimentBadge = (sentiment: SentimentType) => {
    if (sentiment === 'positive') {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Positive
        </span>
      );
    }
    if (sentiment === 'negative') {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          Negative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        Neutral
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Student Feedback Records
          </h2>
          <p className="text-xs text-slate-500">
            Search, filter, and review individual student submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredItems.length}</strong> of {items.length} records
          </span>
          <button
            onClick={handleResetFilters}
            type="button"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 text-xs">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search feedback text or keywords..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sentiment */}
        <select
          value={selectedSentiment}
          onChange={(e) => {
            setSelectedSentiment(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        {/* Rating */}
        <select
          value={selectedRating}
          onChange={(e) => {
            setSelectedRating(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 ★ (Excellent)</option>
          <option value="4">4 ★ (Good)</option>
          <option value="3">3 ★ (Average)</option>
          <option value="2">2 ★ (Poor)</option>
          <option value="1">1 ★ (Very Poor)</option>
        </select>

        {/* Topic */}
        <select
          value={selectedTopic}
          onChange={(e) => {
            setSelectedTopic(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Topics</option>
          {allTopics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3">Student / Dept</th>
              <th className="py-2.5 px-3">Rating</th>
              <th className="py-2.5 px-3">Sentiment</th>
              <th className="py-2.5 px-3">Topic</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-4 min-w-[280px]">Student Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No feedback records match the selected filter criteria.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{item.department}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.year} {item.student_id ? `· ${item.student_id}` : '· Anonymous'}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <span>{item.rating}</span>
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {getSentimentBadge(item.sentiment)}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{item.topic}</div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-slate-800 leading-relaxed text-xs">
                      "{item.feedback_text}"
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <span className="text-slate-500">
          Page <strong>{page}</strong> of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            type="button"
            className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            type="button"
            className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
