import React, { useState } from 'react';
import {
  AlertOctagon,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { TopicSummary } from '../types/feedback.ts';

interface ActionableCardsProps {
  topIssues: TopicSummary[];
  topPraises: TopicSummary[];
  onSelectTopic?: (topicName: string) => void;
}

export const ActionableCards: React.FC<ActionableCardsProps> = ({
  topIssues,
  topPraises,
  onSelectTopic,
}) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(topIssues[0]?.topic || null);
  const [expandedPraise, setExpandedPraise] = useState<string | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            LOW PRIORITY
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 🔴 Left Column: Priority Issues Needing Attention */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Priority Issues Needing Attention
                </h3>
                <p className="text-xs text-slate-500">
                  Recurring issues identified from student feedback
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Action Items
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {topIssues.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No high-priority issues detected in current responses.
              </div>
            ) : (
              topIssues.map((issue, idx) => {
                const isExpanded = expandedIssue === issue.topic;
                return (
                  <div
                    key={issue.topic}
                    className={`border rounded-lg transition-all ${
                      isExpanded
                        ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className="p-3.5 flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedIssue(isExpanded ? null : issue.topic)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{issue.topic}</h4>
                            {getPriorityBadge(issue.priority)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">
                              {issue.mentions} mentions
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-600 font-semibold">
                              {issue.negative_percentage}% negative
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{issue.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>Avg {issue.average_rating.toFixed(1)}★</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-rose-100/70 text-xs">
                        {issue.suggested_action && (
                          <div className="bg-white border border-rose-200 rounded-md p-2.5 mb-3 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-[11px] uppercase tracking-wider mb-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Recommended Action:</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {issue.suggested_action}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Student comments on this topic:
                          </span>
                          <div className="mt-1.5 space-y-1.5">
                            {issue.sample_feedbacks.map((sample) => (
                              <div
                                key={sample.id}
                                className="p-2 rounded bg-white border border-slate-200/80 text-slate-700"
                              >
                                <p className="italic text-xs">"{sample.text}"</p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                  <span>{sample.department}</span>
                                  <span>Rating: {sample.rating}/5</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {onSelectTopic && (
                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={() => onSelectTopic(issue.topic)}
                              type="button"
                              className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900"
                            >
                              <span>View all {issue.mentions} comments</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 🟢 Right Column: Key Strengths & Praises */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Key Strengths & Praises
                </h3>
                <p className="text-xs text-slate-500">
                  Areas receiving the highest student satisfaction
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Top Strengths
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {topPraises.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No praise patterns identified yet.
              </div>
            ) : (
              topPraises.map((praise, idx) => {
                const isExpanded = expandedPraise === praise.topic;
                return (
                  <div
                    key={praise.topic}
                    className={`border rounded-lg transition-all ${
                      isExpanded
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className="p-3.5 flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedPraise(isExpanded ? null : praise.topic)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{praise.topic}</h4>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              POSITIVE
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">
                              {praise.mentions} mentions
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-semibold">
                              {praise.positive_percentage}% positive
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{praise.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>Avg {praise.average_rating.toFixed(1)}★</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-emerald-100/70 text-xs">
                        {praise.suggested_action && (
                          <div className="bg-white border border-emerald-200 rounded-md p-2.5 mb-3 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px] uppercase tracking-wider mb-1">
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Key Highlight:</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {praise.suggested_action}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Sample student feedback:
                          </span>
                          <div className="mt-1.5 space-y-1.5">
                            {praise.sample_feedbacks.map((sample) => (
                              <div
                                key={sample.id}
                                className="p-2 rounded bg-white border border-slate-200/80 text-slate-700"
                              >
                                <p className="italic text-xs">"{sample.text}"</p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                  <span>{sample.department}</span>
                                  <span>Rating: {sample.rating}/5</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {onSelectTopic && (
                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={() => onSelectTopic(praise.topic)}
                              type="button"
                              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                            >
                              <span>View all {praise.mentions} comments</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
