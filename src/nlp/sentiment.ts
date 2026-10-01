import { SentimentType } from '../types/feedback.ts';

/**
 * VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment analyzer
 * Tailored for academic and student feedback contexts.
 * Pure TypeScript implementation, fully deterministic, offline-capable, and explainable.
 */

// Domain-tuned sentiment lexicon with valence ratings (-4.0 to +4.0)
const LEXICON: Record<string, number> = {
  // Positive valence words
  excellent: 3.8,
  exceptional: 3.9,
  outstanding: 3.8,
  great: 3.2,
  good: 2.3,
  superb: 3.5,
  wonderful: 3.4,
  clear: 2.6,
  clearly: 2.5,
  clarity: 2.7,
  helpful: 2.8,
  supportive: 2.9,
  inspiring: 3.2,
  encouraging: 2.7,
  knowledgeable: 2.9,
  dedicated: 2.8,
  friendly: 2.5,
  patient: 2.4,
  punctual: 2.2,
  engaging: 2.8,
  interactive: 2.4,
  thorough: 2.3,
  well: 2.0,
  best: 3.5,
  improved: 2.1,
  improvement: 1.8,
  fast: 2.2,
  smooth: 2.1,
  clean: 2.4,
  hygienic: 2.6,
  spacious: 2.1,
  comfortable: 2.5,
  modern: 2.3,
  equipped: 2.2,
  updated: 2.0,
  reliable: 2.7,
  accessible: 2.2,
  appreciate: 2.6,
  appreciated: 2.6,
  satisfied: 2.4,
  satisfactory: 1.9,
  effective: 2.5,
  productive: 2.4,
  interesting: 2.2,
  informative: 2.3,
  organized: 2.4,
  structured: 2.1,
  loved: 3.2,
  love: 3.0,
  enjoyed: 2.8,
  enjoyable: 2.7,
  perfect: 3.6,
  useful: 2.4,
  beneficial: 2.5,
  awesome: 3.4,
  brilliant: 3.5,
  valuable: 2.7,

  // Negative valence words
  slow: -2.7,
  poor: -2.8,
  poorly: -2.8,
  bad: -2.6,
  terrible: -3.6,
  horrible: -3.7,
  worst: -3.9,
  broken: -3.0,
  faulty: -2.7,
  laggy: -2.6,
  lag: -2.4,
  unstable: -2.8,
  unreliable: -2.9,
  disconnection: -2.6,
  disconnect: -2.5,
  disconnected: -2.5,
  freeze: -2.4,
  freezing: -2.5,
  crashes: -2.8,
  crash: -2.7,
  outdated: -2.5,
  old: -1.5,
  dirty: -2.8,
  unhygienic: -3.2,
  noisy: -2.3,
  noise: -2.1,
  stifling: -2.6,
  hot: -1.6,
  suffocating: -3.2,
  crowded: -2.3,
  congested: -2.4,
  uncomfortable: -2.5,
  strict: -1.7,
  harsh: -2.7,
  rude: -3.2,
  unhelpful: -2.9,
  unsupportive: -2.8,
  arrogant: -3.3,
  absent: -2.4,
  late: -2.1,
  delay: -2.2,
  delayed: -2.3,
  rushed: -2.1,
  confusing: -2.6,
  confused: -2.4,
  boring: -2.6,
  monotonous: -2.4,
  unprepared: -2.8,
  irresponsible: -3.0,
  unfair: -3.0,
  biased: -3.1,
  partial: -2.2,
  difficult: -1.8,
  hard: -1.3,
  insufficient: -2.6,
  lacking: -2.4,
  shortage: -2.5,
  limited: -1.8,
  overpriced: -2.4,
  expensive: -2.0,
  tasteless: -2.6,
  stale: -2.9,
  inedible: -3.6,
  smelly: -2.8,
  leakage: -2.5,
  malfunctioning: -2.9,
  damaged: -2.7,
  neglected: -2.8,
  frustrating: -3.0,
  frustrated: -2.9,
  annoying: -2.7,
  useless: -3.3,
  pathetic: -3.5,
  disappointing: -2.8,
  disappointed: -2.8,
  waste: -3.1,
  complaint: -2.2,
  problem: -2.0,
  issue: -1.8,
  issues: -1.9,
  trouble: -2.3,
  struggle: -2.2,
  struggling: -2.2,
  fail: -2.8,
  failed: -2.7,
};

// Booster words that intensify valence
const BOOSTER_WORDS: Record<string, number> = {
  very: 0.293,
  extremely: 0.395,
  really: 0.287,
  completely: 0.33,
  totally: 0.31,
  absolutely: 0.38,
  highly: 0.28,
  deeply: 0.25,
  terribly: 0.32,
  insanely: 0.35,
  hugely: 0.28,
  exceptionally: 0.36,
  incredibly: 0.34,
  barely: -0.25,
  hardly: -0.28,
  slightly: -0.2,
  somewhat: -0.15,
  little: -0.12,
  bit: -0.1,
};

// Negation words that invert valence
const NEGATION_WORDS = new Set([
  'not',
  "isn't",
  'isnt',
  "aren't",
  'arent',
  "wasn't",
  'wasnt',
  "weren't",
  'werent',
  "don't",
  'dont',
  "doesn't",
  'doesnt',
  "didn't",
  'didnt',
  "can't",
  'cant',
  'cannot',
  "couldn't",
  'couldnt',
  "won't",
  'wont',
  "wouldn't",
  'wouldnt',
  'never',
  'neither',
  'nor',
  'no',
  'none',
  'without',
  'hardly',
]);

export interface SentimentAnalysisResult {
  sentiment: SentimentType;
  score: number; // -1.0 to 1.0 (compound)
  rawValenceSum: number;
  tokensAnalyzed: number;
  explanation: string;
}

/**
 * Analyzes open-text student feedback using VADER rules.
 */
export function analyzeSentiment(text: string): SentimentAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'neutral',
      score: 0.0,
      rawValenceSum: 0,
      tokensAnalyzed: 0,
      explanation: 'Empty or blank text defaults to Neutral sentiment.',
    };
  }

  // Tokenize preserving exclamation marks and words
  const cleanText = text.toLowerCase();
  const rawTokens = cleanText
    .replace(/[^\w\s!'-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const valenceScores: number[] = [];
  const matchedTokens: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i].replace(/[!]/g, '');
    let valence = LEXICON[token];

    if (valence !== undefined) {
      // Check for booster words up to 2 positions back
      for (let b = 1; b <= 2; b++) {
        if (i - b >= 0) {
          const prevToken = rawTokens[i - b].replace(/[!]/g, '');
          const booster = BOOSTER_WORDS[prevToken];
          if (booster !== undefined) {
            const boostVal = valence > 0 ? booster : -booster;
            valence += boostVal;
          }
        }
      }

      // Check for negations up to 3 positions back
      let isNegated = false;
      for (let n = 1; n <= 3; n++) {
        if (i - n >= 0) {
          const prevToken = rawTokens[i - n].replace(/[!]/g, '');
          if (NEGATION_WORDS.has(prevToken)) {
            isNegated = true;
            break;
          }
        }
      }

      if (isNegated) {
        // VADER standard negation factor -0.74
        valence = valence * -0.74;
      }

      valenceScores.push(valence);
      matchedTokens.push(`${token}(${valence > 0 ? '+' : ''}${valence.toFixed(2)})`);
    }
  }

  // Exclamation booster
  const exclamations = (text.match(/!/g) || []).length;
  const exclamationBoost = Math.min(exclamations * 0.15, 0.6);

  const rawSum = valenceScores.reduce((acc, v) => acc + v, 0);
  const adjustedSum = rawSum > 0 ? rawSum + exclamationBoost : rawSum < 0 ? rawSum - exclamationBoost : 0;

  // Standard VADER compound formula: sum / sqrt(sum^2 + alpha) where alpha = 15
  const alpha = 15;
  const compound = adjustedSum === 0 ? 0 : adjustedSum / Math.sqrt(adjustedSum * adjustedSum + alpha);

  // Round to 3 decimal places
  const roundedScore = Math.round(compound * 1000) / 1000;

  let sentiment: SentimentType = 'neutral';
  if (roundedScore >= 0.05) {
    sentiment = 'positive';
  } else if (roundedScore <= -0.05) {
    sentiment = 'negative';
  }

  const explanation =
    matchedTokens.length > 0
      ? `Valence words matched: ${matchedTokens.join(', ')}. Compound score: ${roundedScore.toFixed(3)}.`
      : `No strong emotional polarity words detected. Assigned neutral score (0.00).`;

  return {
    sentiment,
    score: roundedScore,
    rawValenceSum: adjustedSum,
    tokensAnalyzed: rawTokens.length,
    explanation,
  };
}
