import React, { useState } from 'react';
import {
  FolderTree,
  Search,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { TopicSummary } from '../types/feedback.ts';

interface SemanticClustersProps {
  topics: TopicSummary[];
  onSelectTopicForAudit?: (topicName: string) => void;
}

export const SemanticClusters: React.FC<SemanticClustersProps> = ({
  topics,
  onSelectTopicForAudit,
}) => {
  const [selectedTopicName, setSelectedTopicName] = useState<string>(
    topics[0]?.topic || 'Internet Connectivity'
  );
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredTopics = topics.filter((t) =>
    t.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeTopic = topics.find((t) => t.topic === selectedTopicName) || topics[0];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Feedback Topics & Grouped Responses
            </h3>
            <p className="text-xs text-slate-500">
              Student comments automatically organized into common topics so you can see trends at a glance.
            </p>
          </div>
        </div>

        {/* Search topic */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Two Column Layout: Topics on left, Raw Clustered Comments on right */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Topic List */}
        <div className="lg:col-span-4 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredTopics.map((topic) => {
            const isSelected = topic.topic === selectedTopicName;
            return (
              <button
                key={topic.topic}
                onClick={() => setSelectedTopicName(topic.topic)}
                type="button"
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {topic.topic}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {topic.mentions} comments
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>{topic.category}</span>
                  <div className="space-x-1.5">
                    {topic.negative_percentage >= 50 && (
                      <span className="text-rose-600 font-semibold">
                        {topic.negative_percentage}% Neg
                      </span>
                    )}
                    {topic.positive_percentage >= 50 && (
                      <span className="text-emerald-700 font-semibold">
                        {topic.positive_percentage}% Pos
                      </span>
                    )}
                    <span>Avg {topic.average_rating.toFixed(1)}★</span>
                  </div>
                </div>

                {/* Sentiment bar */}
                <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${topic.positive_percentage}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{
                      width: `${100 - topic.positive_percentage - topic.negative_percentage}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${topic.negative_percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Comments View */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          {activeTopic ? (
            <div>
              {/* Cluster Headline */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{activeTopic.topic}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {activeTopic.category}
                    </span>
                    {activeTopic.priority === 'HIGH' && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-600" />
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTopic.mentions} student responses grouped under this topic.
                  </p>
                </div>

                {onSelectTopicForAudit && (
                  <button
                    onClick={() => onSelectTopicForAudit(activeTopic.topic)}
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs"
                  >
                    <span>View All in Records</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 my-3 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-medium">TOTAL MENTIONS</div>
                  <div className="text-sm font-bold text-slate-900">{activeTopic.mentions}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-medium">AVG RATING</div>
                  <div className="text-sm font-bold text-slate-900">{activeTopic.average_rating.toFixed(1)} / 5</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-medium">NEGATIVE %</div>
                  <div className="text-sm font-bold text-rose-600">{activeTopic.negative_percentage}%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-medium">POSITIVE %</div>
                  <div className="text-sm font-bold text-emerald-600">{activeTopic.positive_percentage}%</div>
                </div>
              </div>

              {/* Suggested Action Box */}
              {activeTopic.suggested_action && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 text-xs">
                  <div className="text-slate-800 font-bold mb-0.5">
                    Recommended Action:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {activeTopic.suggested_action}
                  </p>
                </div>
              )}

              {/* Comments */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Student Comments:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {activeTopic.sample_feedbacks.length} sample quotes
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {activeTopic.sample_feedbacks.map((sample) => (
                    <div
                      key={sample.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-slate-800 italic leading-snug">
                          "{sample.text}"
                        </p>
                        <span
                          className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${
                            sample.sentiment === 'positive'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sample.sentiment === 'negative'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {sample.sentiment.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100">
                        <span>{sample.department}</span>
                        <span>Rating: {sample.rating} / 5★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a topic on the left to inspect its responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
