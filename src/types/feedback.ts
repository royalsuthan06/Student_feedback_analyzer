export type Department =
  | 'Information Technology'
  | 'Computer Science & Engineering'
  | 'Electronics & Communication'
  | 'Electrical & Electronics'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'AI & Data Science'
  | 'Management Studies';

export type YearOfStudy = 'I Year' | 'II Year' | 'III Year' | 'IV Year';

export type FeedbackCategory =
  | 'Teaching'
  | 'Faculty'
  | 'Laboratory'
  | 'Infrastructure'
  | 'Library'
  | 'Hostel'
  | 'Canteen'
  | 'Transportation'
  | 'Events'
  | 'Campus'
  | 'Other';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type TopicType = 'issue' | 'praise' | 'neutral';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FeedbackItem {
  id: string;
  department: Department;
  year: YearOfStudy;
  category: FeedbackCategory;
  rating: number; // 1 to 5
  feedback_text: string;
  sentiment: SentimentType;
  sentiment_score: number; // -1.0 to 1.0
  topic: string;
  topic_type: TopicType;
  priority: PriorityLevel;
  student_id?: string;
  created_at: string;
}

export interface FeedbackSubmission {
  department: Department;
  year: YearOfStudy;
  category: FeedbackCategory;
  rating: number;
  feedback_text: string;
  student_id?: string;
}

export interface TopicSummary {
  topic: string;
  category: FeedbackCategory;
  topic_type: TopicType;
  mentions: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  negative_percentage: number;
  positive_percentage: number;
  priority: PriorityLevel;
  priority_score: number;
  average_rating: number;
  sample_feedbacks: Array<{
    id: string;
    text: string;
    rating: number;
    sentiment: SentimentType;
    department: Department;
  }>;
  suggested_action?: string;
}

export interface FeedbackAnalytics {
  total_responses: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentiment_percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  category_performance: Array<{
    category: FeedbackCategory;
    count: number;
    average_rating: number;
    positive_percentage: number;
    neutral_percentage: number;
    negative_percentage: number;
  }>;
  top_recurring_issues: TopicSummary[];
  top_recurring_praises: TopicSummary[];
  all_topics: TopicSummary[];
  recent_feedbacks: FeedbackItem[];
}
