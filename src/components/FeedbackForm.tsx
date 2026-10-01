import React, { useState } from 'react';
import {
  Send,
  Star,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Department,
  FeedbackCategory,
  FeedbackSubmission,
  YearOfStudy,
} from '../types/feedback.ts';

interface FeedbackFormProps {
  onSubmit: (submission: FeedbackSubmission) => Promise<boolean>;
  onNavigateToDashboard?: () => void;
}

const DEPARTMENTS: Department[] = [
  'Information Technology',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'AI & Data Science',
  'Management Studies',
];

const YEARS: YearOfStudy[] = ['I Year', 'II Year', 'III Year', 'IV Year'];

const CATEGORIES: FeedbackCategory[] = [
  'Teaching',
  'Faculty',
  'Laboratory',
  'Infrastructure',
  'Library',
  'Hostel',
  'Canteen',
  'Transportation',
  'Events',
  'Campus',
  'Other',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  onNavigateToDashboard,
}) => {
  const [department, setDepartment] = useState<Department>('Information Technology');
  const [year, setYear] = useState<YearOfStudy>('III Year');
  const [category, setCategory] = useState<FeedbackCategory>('Infrastructure');
  const [rating, setRating] = useState<number>(4);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!feedbackText.trim()) {
      setErrorMessage('Please enter your feedback before submitting.');
      return;
    }

    if (feedbackText.trim().length < 5) {
      setErrorMessage('Please provide a few more words to help us understand your experience.');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a feedback category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        department,
        year,
        category,
        rating,
        feedback_text: feedbackText.trim(),
        student_id: studentId.trim() || undefined,
      });

      if (success) {
        setSuccessSubmitted(true);
        setFeedbackText('');
        setStudentId('');
        setRating(4);
      } else {
        setErrorMessage('Failed to save feedback. Please check connection and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickExample = (exampleText: string, exampleCategory: FeedbackCategory, exampleRating: number) => {
    setFeedbackText(exampleText);
    setCategory(exampleCategory);
    setRating(exampleRating);
    setSuccessSubmitted(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Submit Student Feedback
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anonymous Feedback Allowed</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Share your constructive feedback to help faculty and administration improve academics, campus facilities, and student life.
          </p>
        </div>

        {/* Success Alert */}
        {successSubmitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Thank you! Your feedback has been received.</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your feedback has been added to the department dashboard and grouped with related responses.
                </p>
              </div>
            </div>
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                type="button"
                className="text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors ml-4 flex-shrink-0"
              >
                View Dashboard
              </button>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Year of Study <span className="text-rose-500">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as YearOfStudy)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Student ID (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Student ID
                </label>
                <span className="text-[10px] text-slate-400">Optional · Leave empty to stay anonymous</span>
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. CS-2024-042 (optional)"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Overall Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoveredStar !== null ? hoveredStar : rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoveredStar(starVal)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 text-sm">{rating} / 5</span>
                <span className="text-slate-500 ml-2">({RATING_LABELS[rating]})</span>
              </div>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Your Feedback <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {feedbackText.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what went well or what needs improvement. For example: 'The WiFi is very slow in laboratory 3' or 'The professor explains concepts clearly'..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none leading-relaxed"
            />
          </div>

          {/* Quick Examples */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Click a sample to fill:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleQuickExample('The WiFi is very slow in the laboratory.', 'Infrastructure', 2)
                }
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-md text-slate-700 text-[11px] transition-colors"
              >
                "The WiFi is very slow in the laboratory."
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickExample('Internet speed is poor and connection drops.', 'Infrastructure', 1)
                }
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-md text-slate-700 text-[11px] transition-colors"
              >
                "Internet speed is poor and connection drops."
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickExample(
                    'Faculty explains concepts clearly with practical examples.',
                    'Teaching',
                    5
                  )
                }
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-400 rounded-md text-slate-700 text-[11px] transition-colors"
              >
                "Faculty explains concepts clearly with practical examples."
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
