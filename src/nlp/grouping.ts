import { FeedbackCategory, SentimentType, TopicType } from '../types/feedback.ts';

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren', 'arent', 'as', 'at', 'be', 'because', 'been', 'before',
  'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don', 'dont', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'please', 'really',
]);

// Canonical topic definitions with seed vectors, category, and suggested administrative interventions
export interface CanonicalTopic {
  id: string;
  name: string;
  category: FeedbackCategory;
  defaultType: TopicType;
  seedPhrases: string[];
  suggestedAction: string;
}

export const CANONICAL_TOPICS: CanonicalTopic[] = [
  {
    id: 'internet_connectivity',
    name: 'Internet Connectivity',
    category: 'Infrastructure',
    defaultType: 'issue',
    seedPhrases: [
      'wifi is slow and disconnects frequently',
      'internet connection is poor and unstable in campus',
      'network speed needs improvement very low bandwidth',
      'wifi does not work properly in labs and classrooms',
      'poor connectivity and frequent router dropouts',
      'cellular signal and wifi data throughput is terrible',
      'cannot access online research papers due to slow internet',
    ],
    suggestedAction:
      'Audit 5GHz WiFi coverage and replace bottleneck access points in Academic Blocks & Laboratories. Rebalance bandwidth throttling during peak lab sessions.',
  },
  {
    id: 'teaching_quality',
    name: 'Teaching Quality',
    category: 'Teaching',
    defaultType: 'praise',
    seedPhrases: [
      'teacher explains concepts clearly and effectively',
      'faculty teaching is excellent and easy to understand',
      'professor explains everything with great clarity and real world examples',
      'lectures are very engaging interactive and well prepared',
      'faculty encourages questions and clarifies doubts patiently',
      'professors have deep domain expertise and structured syllabus delivery',
    ],
    suggestedAction:
      'Recognize high-performing educators in faculty reviews; document their pedagogical methods as institutional best practices.',
  },
  {
    id: 'laboratory_equipment',
    name: 'Laboratory Resources',
    category: 'Laboratory',
    defaultType: 'issue',
    seedPhrases: [
      'lab computers are extremely slow and crash during programming',
      'outdated hardware systems and obsolete laboratory instruments',
      'software licenses not installed or expired on workstations',
      'insufficient kits and experimental apparatus for practical sessions',
      'faulty electronics test equipment and broken multimeter probes',
    ],
    suggestedAction:
      'Schedule RAM/SSD upgrades for student computer workstations; service oscilloscopes and replenish consumable lab kits.',
  },
  {
    id: 'classroom_comfort',
    name: 'Classroom Equipment',
    category: 'Infrastructure',
    defaultType: 'issue',
    seedPhrases: [
      'projector display is dim flickering or not functioning',
      'ac air conditioning not working properly hot and suffocating room',
      'broken benches uncomfortable chairs and squeaky desks',
      'poor audio microphone acoustics and speakers echo',
      'inadequate ventilation and bad lighting in lecture halls',
    ],
    suggestedAction:
      'Replace failing projector bulbs with high-lumen laser projectors; service HVAC units before summer semester begins.',
  },
  {
    id: 'faculty_support',
    name: 'Faculty Support & Mentorship',
    category: 'Faculty',
    defaultType: 'praise',
    seedPhrases: [
      'faculty is approachable and always available for student guidance',
      'mentors guide career planning project reviews and internship advice',
      'teachers are empathetic supportive and care about student mental health',
      'faculty provides timely constructive feedback on assignments',
    ],
    suggestedAction:
      'Formalize weekly faculty office hours and allocate mentorship recognition points for student counseling.',
  },
  {
    id: 'canteen_quality',
    name: 'Canteen & Food Hygiene',
    category: 'Canteen',
    defaultType: 'issue',
    seedPhrases: [
      'canteen food is unhygienic oily and lacks nutrition',
      'drinking water dispenser is dirty and cups run out',
      'food prices are too high for small portions',
      'lunch options are repetitive cold and taste stale',
      'long queues and poor cleaning of dining tables',
    ],
    suggestedAction:
      'Conduct monthly food safety inspection; renegotiate vendor menu pricing and establish clear sanitation checklists.',
  },
  {
    id: 'library_resources',
    name: 'Library & Digital Resources',
    category: 'Library',
    defaultType: 'praise',
    seedPhrases: [
      'library has comprehensive reference textbooks and quiet study zones',
      'digital journals ieee acm access is seamless and helpful',
      'librarian staff is cooperative and book renewal process is easy',
      'peaceful ambiance and ample seating for exam preparation',
    ],
    suggestedAction:
      'Expand physical copies of high-demand semester textbooks; renew Springer and IEEE institutional e-library subscriptions.',
  },
  {
    id: 'hostel_facilities',
    name: 'Hostel Living Conditions',
    category: 'Hostel',
    defaultType: 'issue',
    seedPhrases: [
      'hostel washrooms are dirty and plumbing leaks persist',
      'no hot water in winter and geysers frequently fail',
      'hostel wifi is barely usable in evenings',
      'room maintenance requests take weeks to get addressed',
      'poor laundry facilities and pest control issues',
    ],
    suggestedAction:
      'Establish a 48-hour SLA maintenance tracking ticketing system for hostel repairs and geyser replacements.',
  },
  {
    id: 'transportation_punctuality',
    name: 'Campus Transportation',
    category: 'Transportation',
    defaultType: 'issue',
    seedPhrases: [
      'college bus is overcrowded with no seating for junior students',
      'bus drivers arrive late leading to missed morning attendance',
      'bus routes do not cover expanding suburban neighborhoods',
      'buses are poorly maintained and lack air conditioning or basic suspension',
    ],
    suggestedAction:
      'Re-route bus schedules to alleviate 7:45 AM bottleneck; audit bus GPS tracking in the student portal.',
  },
  {
    id: 'campus_activities',
    name: 'Campus Activities & Events',
    category: 'Events',
    defaultType: 'praise',
    seedPhrases: [
      'technical symposium hackathons and cultural fests were vibrant',
      'sports tournaments and club activities provide great exposure',
      'guest lectures from industry leaders were deeply inspiring',
      'annual day and college festival was very well organized',
    ],
    suggestedAction:
      'Increase student council activity budget and provide certified credit incentives for organizing team leads.',
  },
  {
    id: 'exam_evaluation',
    name: 'Examination & Evaluation',
    category: 'Teaching',
    defaultType: 'issue',
    seedPhrases: [
      'internal assessment grading feels inconsistent across faculty',
      'exam timetable is clustered with no preparation gap days',
      'delayed publication of mid-term marks and test results',
      'evaluation scheme lacks clear rubrics or solution keys',
    ],
    suggestedAction:
      'Standardize marking rubrics across departmental course sections and publish question key within 3 days of exam.',
  },
];

/**
 * Tokenize and normalize text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .map(stemWord);
}

/**
 * Lightweight rule-based suffix stemmer to unify plurals and verbs
 * (e.g. connections -> connect, teachers -> teach, slow -> slow)
 */
function stemWord(word: string): string {
  if (word.endsWith('ies') && word.length > 5) return word.slice(0, -3) + 'y';
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

/**
 * Build TF (Term Frequency) map for a document
 */
function computeTF(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  const total = tokens.length || 1;
  const tf = new Map<string, number>();
  for (const [token, count] of counts.entries()) {
    tf.set(token, count / total);
  }
  return tf;
}

/**
 * Vector representation and Cosine Similarity
 */
export class TFIDFGroupEngine {
  private corpusDocs: string[][] = [];
  private idfMap: Map<string, number> = new Map();
  private topicCentroids: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeCentroids();
  }

  private initializeCentroids() {
    this.corpusDocs = [];
    // Collect all seed phrases across all canonical topics
    for (const topic of CANONICAL_TOPICS) {
      for (const phrase of topic.seedPhrases) {
        const tokens = tokenize(phrase);
        this.corpusDocs.push(tokens);
      }
    }

    // Compute IDF across the seed corpus
    const N = this.corpusDocs.length;
    const docFreq = new Map<string, number>();
    for (const doc of this.corpusDocs) {
      const uniqueTokens = new Set(doc);
      for (const t of uniqueTokens) {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    }

    this.idfMap = new Map();
    for (const [token, df] of docFreq.entries()) {
      // standard smooth IDF
      const idf = Math.log((1 + N) / (1 + df)) + 1;
      this.idfMap.set(token, idf);
    }

    // Build centroid TF-IDF vector for each canonical topic
    for (const topic of CANONICAL_TOPICS) {
      const combinedTokens = topic.seedPhrases.flatMap(tokenize);
      const tfidfVector = this.vectorizeTokens(combinedTokens);
      this.topicCentroids.set(topic.name, tfidfVector);
    }
  }

  /**
   * Converts tokens into normalized TF-IDF vector
   */
  public vectorizeTokens(tokens: string[]): Map<string, number> {
    const tf = computeTF(tokens);
    const vector = new Map<string, number>();
    let normSq = 0;

    for (const [token, tfVal] of tf.entries()) {
      const idf = this.idfMap.get(token) || Math.log(this.corpusDocs.length + 1) + 1;
      const weight = tfVal * idf;
      vector.set(token, weight);
      normSq += weight * weight;
    }

    // Normalize to unit length
    const norm = Math.sqrt(normSq) || 1;
    for (const [token, weight] of vector.entries()) {
      vector.set(token, weight / norm);
    }

    return vector;
  }

  /**
   * Compute Cosine Similarity between two normalized sparse vectors
   */
  public cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dot = 0;
    // Iterate over the smaller vector
    const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];
    for (const [term, valA] of smaller.entries()) {
      const valB = larger.get(term);
      if (valB !== undefined) {
        dot += valA * valB;
      }
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Group and assign topic to a student feedback comment
   */
  public assignTopic(
    text: string,
    categoryHint?: FeedbackCategory,
    sentimentHint?: SentimentType
  ): {
    topic: string;
    topicType: TopicType;
    category: FeedbackCategory;
    similarityScore: number;
    explanation: string;
  } {
    const tokens = tokenize(text);

    if (tokens.length === 0) {
      const fallbackTopic = categoryHint ? `${categoryHint} General` : 'General Experience';
      return {
        topic: fallbackTopic,
        topicType: sentimentHint === 'negative' ? 'issue' : sentimentHint === 'positive' ? 'praise' : 'neutral',
        category: categoryHint || 'Other',
        similarityScore: 0.1,
        explanation: 'Brief input matched directly to category fallback.',
      };
    }

    const inputVector = this.vectorizeTokens(tokens);

    let bestTopic = CANONICAL_TOPICS[0].name;
    let bestScore = -1;
    let bestCanonical = CANONICAL_TOPICS[0];

    for (const canonical of CANONICAL_TOPICS) {
      const centroid = this.topicCentroids.get(canonical.name);
      if (!centroid) continue;

      let score = this.cosineSimilarity(inputVector, centroid);

      // Prioritize matching category if provided by student
      if (categoryHint && canonical.category.toLowerCase() === categoryHint.toLowerCase()) {
        score += 0.08; // category alignment bonus
      }

      if (score > bestScore) {
        bestScore = score;
        bestTopic = canonical.name;
        bestCanonical = canonical;
      }
    }

    // Check specific direct keyword hits for high precision
    const lowerText = text.toLowerCase();
    if (lowerText.includes('wifi') || lowerText.includes('internet') || lowerText.includes('network speed')) {
      bestTopic = 'Internet Connectivity';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Internet Connectivity') || bestCanonical;
      bestScore = Math.max(bestScore, 0.85);
    } else if (
      lowerText.includes('teacher') ||
      lowerText.includes('faculty teaching') ||
      lowerText.includes('professor explains') ||
      lowerText.includes('teaching is')
    ) {
      bestTopic = 'Teaching Quality';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Teaching Quality') || bestCanonical;
      bestScore = Math.max(bestScore, 0.88);
    } else if (lowerText.includes('lab') || lowerText.includes('computer') || lowerText.includes('workstation')) {
      bestTopic = 'Laboratory Resources';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Laboratory Resources') || bestCanonical;
      bestScore = Math.max(bestScore, 0.78);
    } else if (lowerText.includes('projector') || lowerText.includes('air conditioner') || lowerText.includes('ac in class') || lowerText.includes('classroom')) {
      bestTopic = 'Classroom Equipment';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Classroom Equipment') || bestCanonical;
      bestScore = Math.max(bestScore, 0.75);
    } else if (lowerText.includes('canteen') || lowerText.includes('food') || lowerText.includes('cafeteria')) {
      bestTopic = 'Canteen & Food Hygiene';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Canteen & Food Hygiene') || bestCanonical;
      bestScore = Math.max(bestScore, 0.82);
    } else if (lowerText.includes('library') || lowerText.includes('books') || lowerText.includes('reading room')) {
      bestTopic = 'Library & Digital Resources';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Library & Digital Resources') || bestCanonical;
      bestScore = Math.max(bestScore, 0.8);
    } else if (lowerText.includes('bus') || lowerText.includes('transport')) {
      bestTopic = 'Campus Transportation';
      bestCanonical = CANONICAL_TOPICS.find((t) => t.name === 'Campus Transportation') || bestCanonical;
      bestScore = Math.max(bestScore, 0.8);
    }

    // Determine topic type based on sentiment or default
    let topicType: TopicType = bestCanonical.defaultType;
    if (sentimentHint === 'negative') {
      topicType = 'issue';
    } else if (sentimentHint === 'positive') {
      topicType = 'praise';
    }

    const roundedScore = Math.round(bestScore * 100) / 100;
    const explanation = `Matched to "${bestTopic}" via TF-IDF cosine similarity (${(roundedScore * 100).toFixed(0)}% confidence).`;

    return {
      topic: bestTopic,
      topicType,
      category: bestCanonical.category,
      similarityScore: roundedScore,
      explanation,
    };
  }
}

export const groupEngine = new TFIDFGroupEngine();
