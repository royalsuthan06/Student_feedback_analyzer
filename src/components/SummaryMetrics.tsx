import React from 'react';
import { Star, MessageSquare, ThumbsUp, MinusCircle, AlertTriangle } from 'lucide-react';
import { FeedbackAnalytics } from '../types/feedback.ts';

interface SummaryMetricsProps {
  analytics: FeedbackAnalytics;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ analytics }) => {
  const {
    total_responses,
    average_rating,
    sentiment_percentages,
    sentiment_distribution,
  } = analytics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. Total Responses */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Total Responses</span>
          <MessageSquare className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {total_responses}
          </span>
          <span className="text-xs text-slate-500">submissions</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">
          Preserved in local SQLite database
        </p>
      </div>

      {/* 2. Average Rating */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Average Rating</span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {average_rating.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-slate-500">/ 5.0</span>
        </div>
        <div className="flex items-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= Math.round(average_rating)
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-slate-200 fill-slate-200'
              }`}
            />
          ))}
          <span className="text-[11px] text-slate-500 ml-1">Scale 1–5</span>
        </div>
      </div>

      {/* 3. Positive Sentiment */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-emerald-600 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Positive</span>
          <ThumbsUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600">
            {sentiment_percentages.positive}%
          </span>
          <span className="text-xs text-slate-500">({sentiment_distribution.positive})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${sentiment_percentages.positive}%` }}
          />
        </div>
      </div>

      {/* 4. Neutral Sentiment */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-amber-600 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Neutral</span>
          <MinusCircle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600">
            {sentiment_percentages.neutral}%
          </span>
          <span className="text-xs text-slate-500">({sentiment_distribution.neutral})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${sentiment_percentages.neutral}%` }}
          />
        </div>
      </div>

      {/* 5. Negative Sentiment */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-rose-600 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Negative</span>
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">
            {sentiment_percentages.negative}%
          </span>
          <span className="text-xs text-slate-500">({sentiment_distribution.negative})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${sentiment_percentages.negative}%` }}
          />
        </div>
      </div>
    </div>
  );
};
