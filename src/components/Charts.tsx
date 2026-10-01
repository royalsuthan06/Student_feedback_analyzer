import React, { useState } from 'react';
import { Star, PieChart as PieIcon, BarChart2, Layers } from 'lucide-react';
import { FeedbackAnalytics } from '../types/feedback.ts';

interface ChartsProps {
  analytics: FeedbackAnalytics;
}

export const Charts: React.FC<ChartsProps> = ({ analytics }) => {
  const {
    sentiment_distribution,
    sentiment_percentages,
    rating_distribution,
    category_performance,
    total_responses,
  } = analytics;

  const [hoveredSentiment, setHoveredSentiment] = useState<string | null>(null);

  // Donut chart calculations
  const totalSentiment =
    sentiment_distribution.positive + sentiment_distribution.neutral + sentiment_distribution.negative || 1;

  const posAngle = (sentiment_distribution.positive / totalSentiment) * 360;
  const neuAngle = (sentiment_distribution.neutral / totalSentiment) * 360;
  const negAngle = (sentiment_distribution.negative / totalSentiment) * 360;

  // SVG Donut Path Helper
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const createDonutSlice = (startRatio: number, endRatio: number) => {
    if (endRatio - startRatio >= 0.999) {
      return 'M 0 -1 A 1 1 0 1 1 0 0.999 L 0 0.6 A 0.6 0.6 0 1 0 0 -0.6 Z';
    }
    const [startX, startY] = getCoordinatesForPercent(startRatio);
    const [endX, endY] = getCoordinatesForPercent(endRatio);
    const largeArcFlag = endRatio - startRatio > 0.5 ? 1 : 0;

    const innerRadius = 0.62;
    const [innerStartX, innerStartY] = [startX * innerRadius, startY * innerRadius];
    const [innerEndX, innerEndY] = [endX * innerRadius, endY * innerRadius];

    return `
      M ${startX} ${startY}
      A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  };

  const posRatio = sentiment_distribution.positive / totalSentiment;
  const neuRatio = sentiment_distribution.neutral / totalSentiment;
  const negRatio = sentiment_distribution.negative / totalSentiment;

  // Max rating count for scale
  const maxRatingCount = Math.max(
    1,
    ...Object.values(rating_distribution)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Sentiment Distribution Donut Chart */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PieIcon className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sentiment Distribution
            </h4>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center">
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
                {posRatio > 0 && (
                  <path
                    d={createDonutSlice(0, posRatio)}
                    fill="#10b981"
                    className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                    onMouseEnter={() => setHoveredSentiment(`Positive: ${sentiment_percentages.positive}%`)}
                    onMouseLeave={() => setHoveredSentiment(null)}
                  />
                )}
                {neuRatio > 0 && (
                  <path
                    d={createDonutSlice(posRatio, posRatio + neuRatio)}
                    fill="#f59e0b"
                    className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                    onMouseEnter={() => setHoveredSentiment(`Neutral: ${sentiment_percentages.neutral}%`)}
                    onMouseLeave={() => setHoveredSentiment(null)}
                  />
                )}
                {negRatio > 0 && (
                  <path
                    d={createDonutSlice(posRatio + neuRatio, 1)}
                    fill="#ef4444"
                    className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                    onMouseEnter={() => setHoveredSentiment(`Negative: ${sentiment_percentages.negative}%`)}
                    onMouseLeave={() => setHoveredSentiment(null)}
                  />
                )}
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-900">
                  {hoveredSentiment ? hoveredSentiment.split(':')[0] : 'VADER'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {hoveredSentiment ? hoveredSentiment.split(':')[1] : `${total_responses} responses`}
                </span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="mt-4 w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Positive</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {sentiment_percentages.positive}% ({sentiment_distribution.positive})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Neutral</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {sentiment_percentages.neutral}% ({sentiment_distribution.neutral})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600">Negative</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {sentiment_percentages.negative}% ({sentiment_distribution.negative})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rating Distribution (1★ to 5★) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Rating Distribution
            </h4>
          </div>

          <div className="mt-4 space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = rating_distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = total_responses > 0 ? Math.round((count / total_responses) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-0.5 w-10 text-slate-600 font-medium">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stars >= 4
                          ? 'bg-emerald-500'
                          : stars === 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-14 text-right text-slate-600">
                    <span className="font-semibold text-slate-900">{count}</span>
                    <span className="text-[11px] text-slate-400 ml-1">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 text-center">
          Calculated from 1–5 scale student responses
        </p>
      </div>

      {/* 3. Category-wise Performance (Average Rating) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BarChart2 className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Category Average Rating
            </h4>
          </div>

          <div className="mt-3 space-y-2">
            {category_performance.slice(0, 6).map((cat) => {
              const widthPct = (cat.average_rating / 5) * 100;
              return (
                <div key={cat.category} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-medium truncate max-w-[120px]">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900">{cat.average_rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400">/5 ({cat.count})</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.average_rating >= 4.0
                          ? 'bg-emerald-500'
                          : cat.average_rating >= 3.0
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Top evaluated categories
        </div>
      </div>

      {/* 4. Sentiment by Category Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sentiment by Category
            </h4>
          </div>

          <div className="mt-3 space-y-2.5">
            {category_performance.slice(0, 6).map((cat) => (
              <div key={cat.category} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-700 font-medium truncate max-w-[120px]">
                    {cat.category}
                  </span>
                  <div className="text-[11px] space-x-1.5 font-medium">
                    <span className="text-emerald-600">{cat.positive_percentage}%+</span>
                    <span className="text-rose-600">{cat.negative_percentage}%-</span>
                  </div>
                </div>
                {/* Stacked Sentiment Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${cat.positive_percentage}%` }}
                    title={`Positive: ${cat.positive_percentage}%`}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${cat.neutral_percentage}%` }}
                    title={`Neutral: ${cat.neutral_percentage}%`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${cat.negative_percentage}%` }}
                    title={`Negative: ${cat.negative_percentage}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Negative
          </span>
        </div>
      </div>
    </div>
  );
};
