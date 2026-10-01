import {
  Department,
  FeedbackAnalytics,
  FeedbackCategory,
  FeedbackItem,
  FeedbackSubmission,
  SentimentType,
  TopicSummary,
  TopicType,
  YearOfStudy,
} from '../types/feedback.ts';
import { analyzeSentiment } from '../nlp/sentiment.ts';
import { CANONICAL_TOPICS, groupEngine } from '../nlp/grouping.ts';
import { calculatePriority } from '../nlp/priority.ts';
import { SAMPLE_FEEDBACK_DATASET } from '../data/sampleFeedbacks.ts';

export class FeedbackStorage {
  private items: FeedbackItem[] = [];
  private isInitialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      this.seedDataset();
      this.isInitialized = true;
    }
  }

  public seedDataset() {
    this.items = [];
    const baseDate = new Date();

    SAMPLE_FEEDBACK_DATASET.forEach((submission, index) => {
      const createdDate = new Date(baseDate.getTime() - (SAMPLE_FEEDBACK_DATASET.length - index) * 3600000 * 3);
      this.insertDirect(submission, `FB-${1000 + index + 1}`, createdDate.toISOString());
    });

    this.recalculateAllPriorities();
  }

  public resetToEmpty() {
    this.items = [];
  }

  /**
   * Process and insert a student submission through the complete NLP pipeline
   */
  public addFeedback(submission: FeedbackSubmission): FeedbackItem {
    this.ensureInitialized();

    const id = `FB-${1000 + this.items.length + 1}`;
    const timestamp = new Date().toISOString();

    const item = this.insertDirect(submission, id, timestamp);
    // Recalculate priorities across the dataset since topic frequency changed
    this.recalculateAllPriorities();
    return item;
  }

  private insertDirect(submission: FeedbackSubmission, id: string, timestamp: string): FeedbackItem {
    // Step 1: Sentiment Analysis (VADER)
    const sentimentResult = analyzeSentiment(submission.feedback_text);

    // Step 2: TF-IDF & Cosine Similarity Topic Grouping
    const groupResult = groupEngine.assignTopic(
      submission.feedback_text,
      submission.category,
      sentimentResult.sentiment
    );

    // Determine initial priority
    const priorityCalc = calculatePriority(1, sentimentResult.sentiment === 'negative' ? 100 : 0, submission.rating);

    const newItem: FeedbackItem = {
      id,
      department: submission.department,
      year: submission.year,
      category: submission.category,
      rating: Math.max(1, Math.min(5, Math.round(submission.rating))),
      feedback_text: submission.feedback_text.trim(),
      sentiment: sentimentResult.sentiment,
      sentiment_score: sentimentResult.score,
      topic: groupResult.topic,
      topic_type: groupResult.topicType,
      priority: priorityCalc.priority,
      student_id: submission.student_id?.trim() || undefined,
      created_at: timestamp,
    };

    this.items.unshift(newItem);
    return newItem;
  }

  /**
   * Recalculates priority scores across the entire dataset dynamically based on
   * current frequency and negative sentiment concentration
   */
  private recalculateAllPriorities() {
    const topicStats = new Map<
      string,
      { count: number; negativeCount: number; positiveCount: number; ratingSum: number }
    >();

    for (const item of this.items) {
      const stat = topicStats.get(item.topic) || { count: 0, negativeCount: 0, positiveCount: 0, ratingSum: 0 };
      stat.count++;
      stat.ratingSum += item.rating;
      if (item.sentiment === 'negative') stat.negativeCount++;
      if (item.sentiment === 'positive') stat.positiveCount++;
      topicStats.set(item.topic, stat);
    }

    for (const item of this.items) {
      const stat = topicStats.get(item.topic);
      if (stat) {
        const negPct = Math.round((stat.negativeCount / stat.count) * 100);
        const avgRating = Math.round((stat.ratingSum / stat.count) * 10) / 10;
        const calc = calculatePriority(stat.count, negPct, avgRating);
        item.priority = calc.priority;

        // Classify topic type based on majority sentiment
        if (stat.negativeCount > stat.positiveCount && stat.negativeCount / stat.count >= 0.4) {
          item.topic_type = 'issue';
        } else if (stat.positiveCount > stat.negativeCount && stat.positiveCount / stat.count >= 0.5) {
          item.topic_type = 'praise';
        } else {
          item.topic_type = 'neutral';
        }
      }
    }
  }

  /**
   * Filter feedback with flexible criteria
   */
  public getFilteredFeedback(filters?: {
    department?: Department | 'all';
    year?: YearOfStudy | 'all';
    category?: FeedbackCategory | 'all';
    sentiment?: SentimentType | 'all';
    rating?: number | 'all';
    topic?: string | 'all';
    search?: string;
  }): FeedbackItem[] {
    this.ensureInitialized();

    return this.items.filter((item) => {
      if (filters?.department && filters.department !== 'all' && item.department !== filters.department) {
        return false;
      }
      if (filters?.year && filters.year !== 'all' && item.year !== filters.year) {
        return false;
      }
      if (filters?.category && filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      if (filters?.sentiment && filters.sentiment !== 'all' && item.sentiment !== filters.sentiment) {
        return false;
      }
      if (filters?.rating && filters.rating !== 'all' && item.rating !== Number(filters.rating)) {
        return false;
      }
      if (filters?.topic && filters.topic !== 'all' && item.topic !== filters.topic) {
        return false;
      }
      if (filters?.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim();
        const inText = item.feedback_text.toLowerCase().includes(q);
        const inTopic = item.topic.toLowerCase().includes(q);
        const inDept = item.department.toLowerCase().includes(q);
        const inId = item.id.toLowerCase().includes(q);
        const inStudentId = item.student_id ? item.student_id.toLowerCase().includes(q) : false;
        if (!inText && !inTopic && !inDept && !inId && !inStudentId) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Calculate all real metrics directly from the database
   */
  public getAnalytics(): FeedbackAnalytics {
    this.ensureInitialized();

    const total = this.items.length;
    if (total === 0) {
      return {
        total_responses: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
        sentiment_percentages: { positive: 0, neutral: 0, negative: 0 },
        category_performance: [],
        top_recurring_issues: [],
        top_recurring_praises: [],
        all_topics: [],
        recent_feedbacks: [],
      };
    }

    // 1. Rating Distribution & Average
    let ratingSum = 0;
    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of this.items) {
      ratingSum += item.rating;
      ratingDist[item.rating] = (ratingDist[item.rating] || 0) + 1;
    }
    const averageRating = Math.round((ratingSum / total) * 10) / 10;

    // 2. Sentiment Distribution & Percentages
    const sentimentDist: Record<SentimentType, number> = { positive: 0, neutral: 0, negative: 0 };
    for (const item of this.items) {
      sentimentDist[item.sentiment]++;
    }
    const sentimentPercentages = {
      positive: Math.round((sentimentDist.positive / total) * 100),
      neutral: Math.round((sentimentDist.neutral / total) * 100),
      negative: Math.round((sentimentDist.negative / total) * 100),
    };

    // 3. Category-wise Performance
    const categoryMap = new Map<
      FeedbackCategory,
      {
        count: number;
        ratingSum: number;
        positive: number;
        neutral: number;
        negative: number;
      }
    >();

    for (const item of this.items) {
      const cat = categoryMap.get(item.category) || {
        count: 0,
        ratingSum: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
      cat.count++;
      cat.ratingSum += item.rating;
      cat[item.sentiment]++;
      categoryMap.set(item.category, cat);
    }

    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      average_rating: Math.round((stats.ratingSum / stats.count) * 10) / 10,
      positive_percentage: Math.round((stats.positive / stats.count) * 100),
      neutral_percentage: Math.round((stats.neutral / stats.count) * 100),
      negative_percentage: Math.round((stats.negative / stats.count) * 100),
    }));

    categoryPerformance.sort((a, b) => b.count - a.count);

    // 4. Topic-wise Aggregation (The Core Differentiator)
    const topicMap = new Map<
      string,
      {
        topic: string;
        category: FeedbackCategory;
        mentions: number;
        ratingSum: number;
        positive: number;
        neutral: number;
        negative: number;
        samples: Array<{
          id: string;
          text: string;
          rating: number;
          sentiment: SentimentType;
          department: Department;
        }>;
      }
    >();

    for (const item of this.items) {
      let t = topicMap.get(item.topic);
      if (!t) {
        t = {
          topic: item.topic,
          category: item.category,
          mentions: 0,
          ratingSum: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          samples: [],
        };
        topicMap.set(item.topic, t);
      }
      t.mentions++;
      t.ratingSum += item.rating;
      t[item.sentiment]++;
      if (t.samples.length < 5) {
        t.samples.push({
          id: item.id,
          text: item.feedback_text,
          rating: item.rating,
          sentiment: item.sentiment,
          department: item.department,
        });
      }
    }

    const allTopics: TopicSummary[] = Array.from(topicMap.values()).map((t) => {
      const negPct = Math.round((t.negative / t.mentions) * 100);
      const posPct = Math.round((t.positive / t.mentions) * 100);
      const avgRating = Math.round((t.ratingSum / t.mentions) * 10) / 10;
      const priorityCalc = calculatePriority(t.mentions, negPct, avgRating);

      // Find suggested action from canonical topics if available
      const canonical = CANONICAL_TOPICS.find((c) => c.name.toLowerCase() === t.topic.toLowerCase());
      const suggestedAction = canonical
        ? canonical.suggestedAction
        : `Investigate recurring feedback in ${t.category} and engage department representatives.`;

      let topicType: TopicType = 'neutral';
      if (t.negative > t.positive && negPct >= 40) {
        topicType = 'issue';
      } else if (t.positive > t.negative && posPct >= 50) {
        topicType = 'praise';
      }

      return {
        topic: t.topic,
        category: t.category,
        topic_type: topicType,
        mentions: t.mentions,
        sentiment_distribution: {
          positive: t.positive,
          neutral: t.neutral,
          negative: t.negative,
        },
        negative_percentage: negPct,
        positive_percentage: posPct,
        priority: priorityCalc.priority,
        priority_score: priorityCalc.score,
        average_rating: avgRating,
        sample_feedbacks: t.samples,
        suggested_action: suggestedAction,
      };
    });

    // 5. Top 3 Recurring Issues (Priority Score descending, then mentions)
    const recurringIssues = allTopics
      .filter((t) => t.topic_type === 'issue' || t.negative_percentage >= 45)
      .sort((a, b) => {
        if (b.priority_score !== a.priority_score) {
          return b.priority_score - a.priority_score;
        }
        return b.mentions - a.mentions;
      });

    const topRecurringIssues = recurringIssues.slice(0, 3);

    // 6. Top 3 Recurring Praises (Positive percentage >= 60%, sorted by mentions descending)
    const recurringPraises = allTopics
      .filter((t) => t.topic_type === 'praise' || t.positive_percentage >= 60)
      .sort((a, b) => {
        if (b.mentions !== a.mentions) {
          return b.mentions - a.mentions;
        }
        return b.positive_percentage - a.positive_percentage;
      });

    const topRecurringPraises = recurringPraises.slice(0, 3);

    // 7. Recent Feedbacks
    const recentFeedbacks = this.items.slice(0, 10);

    return {
      total_responses: total,
      average_rating: averageRating,
      rating_distribution: {
        1: ratingDist[1] || 0,
        2: ratingDist[2] || 0,
        3: ratingDist[3] || 0,
        4: ratingDist[4] || 0,
        5: ratingDist[5] || 0,
      },
      sentiment_distribution: sentimentDist,
      sentiment_percentages: sentimentPercentages,
      category_performance: categoryPerformance,
      top_recurring_issues: topRecurringIssues,
      top_recurring_praises: topRecurringPraises,
      all_topics: allTopics.sort((a, b) => b.mentions - a.mentions),
      recent_feedbacks: recentFeedbacks,
    };
  }

  /**
   * Export database as standard SQLite SQL dump
   */
  public exportSQL(): string {
    let sql = `-- FeedbackLens AI - SQLite Database Export\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS feedback (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  department TEXT NOT NULL,\n`;
    sql += `  year TEXT NOT NULL,\n`;
    sql += `  category TEXT NOT NULL,\n`;
    sql += `  rating INTEGER NOT NULL,\n`;
    sql += `  feedback_text TEXT NOT NULL,\n`;
    sql += `  sentiment TEXT NOT NULL,\n`;
    sql += `  sentiment_score REAL NOT NULL,\n`;
    sql += `  topic TEXT NOT NULL,\n`;
    sql += `  topic_type TEXT NOT NULL,\n`;
    sql += `  priority TEXT NOT NULL,\n`;
    sql += `  student_id TEXT,\n`;
    sql += `  created_at TEXT NOT NULL\n`;
    sql += `);\n\n`;

    for (const item of this.items) {
      const escape = (s: string) => s.replace(/'/g, "''");
      const studentIdVal = item.student_id ? `'${escape(item.student_id)}'` : 'NULL';
      sql += `INSERT INTO feedback (id, department, year, category, rating, feedback_text, sentiment, sentiment_score, topic, topic_type, priority, student_id, created_at) VALUES (\n`;
      sql += `  '${item.id}', '${escape(item.department)}', '${escape(item.year)}', '${escape(item.category)}', ${item.rating},\n`;
      sql += `  '${escape(item.feedback_text)}', '${item.sentiment}', ${item.sentiment_score}, '${escape(item.topic)}',\n`;
      sql += `  '${item.topic_type}', '${item.priority}', ${studentIdVal}, '${item.created_at}'\n`;
      sql += `);\n`;
    }

    return sql;
  }

  /**
   * Export database as CSV format
   */
  public exportCSV(): string {
    const headers = [
      'id',
      'department',
      'year',
      'category',
      'rating',
      'feedback_text',
      'sentiment',
      'sentiment_score',
      'topic',
      'topic_type',
      'priority',
      'student_id',
      'created_at',
    ];

    const escapeCSV = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = this.items.map((item) =>
      [
        escapeCSV(item.id),
        escapeCSV(item.department),
        escapeCSV(item.year),
        escapeCSV(item.category),
        item.rating,
        escapeCSV(item.feedback_text),
        escapeCSV(item.sentiment),
        item.sentiment_score,
        escapeCSV(item.topic),
        escapeCSV(item.topic_type),
        escapeCSV(item.priority),
        escapeCSV(item.student_id || ''),
        escapeCSV(item.created_at),
      ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}

export const feedbackStorage = new FeedbackStorage();
