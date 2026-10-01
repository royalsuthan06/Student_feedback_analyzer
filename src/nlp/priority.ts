import { PriorityLevel } from '../types/feedback.ts';

export interface PriorityCalculation {
  priority: PriorityLevel;
  score: number;
  reason: string;
}

/**
 * Calculates rule-based decision support priority for an identified issue
 * based on frequency and negative sentiment concentration.
 *
 * Formula:
 * Raw Score = Mentions * (Negative Sentiment % / 100)
 *
 * Classification Rules:
 * - HIGH:
 *     Raw Score >= 8.0, OR
 *     (Negative % >= 75% AND Mentions >= 5), OR
 *     (Negative % >= 90% AND Mentions >= 3)
 * - MEDIUM:
 *     Raw Score >= 3.0, OR
 *     (Negative % >= 50% AND Mentions >= 4)
 * - LOW:
 *     All other issues with lower frequency or low negative concentration
 */
export function calculatePriority(
  mentions: number,
  negativePercentage: number,
  averageRating?: number
): PriorityCalculation {
  const normalizedNegRatio = Math.max(0, Math.min(1, negativePercentage / 100));
  const rawScore = Math.round(mentions * normalizedNegRatio * 10) / 10;

  let priority: PriorityLevel = 'LOW';
  let reason = '';

  if (
    rawScore >= 8.0 ||
    (negativePercentage >= 75 && mentions >= 5) ||
    (negativePercentage >= 90 && mentions >= 3) ||
    (averageRating !== undefined && averageRating <= 2.0 && mentions >= 4)
  ) {
    priority = 'HIGH';
    reason = `Critical negative density (${negativePercentage}% negative across ${mentions} student mentions). Immediate administrative intervention recommended.`;
  } else if (
    rawScore >= 3.0 ||
    (negativePercentage >= 50 && mentions >= 4) ||
    (averageRating !== undefined && averageRating <= 3.0 && mentions >= 4)
  ) {
    priority = 'MEDIUM';
    reason = `Moderate recurring friction (${negativePercentage}% negative, ${mentions} mentions). Schedule for departmental review.`;
  } else {
    priority = 'LOW';
    reason = `Minor isolated feedback (${mentions} mentions, ${negativePercentage}% negative). Monitor during regular evaluations.`;
  }

  return {
    priority,
    score: rawScore,
    reason,
  };
}
