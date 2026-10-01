import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { feedbackStorage } from './src/db/storage.ts';
import { analyzeSentiment } from './src/nlp/sentiment.ts';
import { groupEngine } from './src/nlp/grouping.ts';
import { calculatePriority } from './src/nlp/priority.ts';
import { FeedbackCategory, SentimentType } from './src/types/feedback.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get Analytics summary
  app.get('/api/analytics', (_req: Request, res: Response) => {
    try {
      const analytics = feedbackStorage.getAnalytics();
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to compute analytics' });
    }
  });

  // Get filtered feedback list
  app.get('/api/feedback', (req: Request, res: Response) => {
    try {
      const { department, year, category, sentiment, rating, topic, search } = req.query;
      const items = feedbackStorage.getFilteredFeedback({
        department: department as any,
        year: year as any,
        category: category as any,
        sentiment: sentiment as any,
        rating: rating ? Number(rating) : undefined,
        topic: topic as any,
        search: search as string,
      });
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch feedback list' });
    }
  });

  // Submit new feedback
  app.post('/api/feedback', (req: Request, res: Response) => {
    try {
      const { department, year, category, rating, feedback_text, student_id } = req.body;

      if (!feedback_text || typeof feedback_text !== 'string' || feedback_text.trim().length === 0) {
        res.status(400).json({ error: 'Feedback text is required and cannot be empty.' });
        return;
      }

      if (!category) {
        res.status(400).json({ error: 'Feedback category is required.' });
        return;
      }

      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
        return;
      }

      const newItem = feedbackStorage.addFeedback({
        department: department || 'Information Technology',
        year: year || 'III Year',
        category: category as FeedbackCategory,
        rating: numRating,
        feedback_text: feedback_text.trim(),
        student_id: student_id ? String(student_id).trim() : undefined,
      });

      const updatedAnalytics = feedbackStorage.getAnalytics();
      res.status(201).json({ item: newItem, analytics: updatedAnalytics });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to process feedback submission' });
    }
  });

  // Live NLP Preview (for interactive form preview without saving)
  app.post('/api/analyze-preview', (req: Request, res: Response) => {
    try {
      const { text, category } = req.body;
      if (!text || typeof text !== 'string') {
        res.json({
          sentiment: 'neutral',
          score: 0,
          topic: 'General Experience',
          explanation: 'Enter feedback to see real-time analysis.',
        });
        return;
      }

      const sentimentResult = analyzeSentiment(text);
      const groupResult = groupEngine.assignTopic(
        text,
        category as FeedbackCategory | undefined,
        sentimentResult.sentiment
      );
      const priority = calculatePriority(1, sentimentResult.sentiment === 'negative' ? 100 : 0);

      res.json({
        sentiment: sentimentResult.sentiment,
        score: sentimentResult.score,
        sentimentExplanation: sentimentResult.explanation,
        topic: groupResult.topic,
        topicType: groupResult.topicType,
        category: groupResult.category,
        similarityScore: groupResult.similarityScore,
        groupExplanation: groupResult.explanation,
        priority: priority.priority,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Analysis preview failed' });
    }
  });

  // Seed sample benchmark dataset
  app.post('/api/seed', (_req: Request, res: Response) => {
    try {
      feedbackStorage.seedDataset();
      const analytics = feedbackStorage.getAnalytics();
      res.json({ message: 'Sample dataset seeded successfully', analytics });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to seed sample dataset' });
    }
  });

  // Reset database to empty
  app.post('/api/reset', (_req: Request, res: Response) => {
    try {
      feedbackStorage.resetToEmpty();
      const analytics = feedbackStorage.getAnalytics();
      res.json({ message: 'Database reset to empty state', analytics });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to reset database' });
    }
  });

  // Export SQLite SQL dump
  app.get('/api/export/sql', (_req: Request, res: Response) => {
    try {
      const sqlDump = feedbackStorage.exportSQL();
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', 'attachment; filename="feedbacklens_sqlite.sql"');
      res.send(sqlDump);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to export SQL' });
    }
  });

  // Export CSV dump
  app.get('/api/export/csv', (_req: Request, res: Response) => {
    try {
      const csvDump = feedbackStorage.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="feedbacklens_export.csv"');
      res.send(csvDump);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to export CSV' });
    }
  });

  // --- Vite Dev Server Middleware or Static Build ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FeedbackLens AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FeedbackLens AI] Failed to start server:', err);
  process.exit(1);
});
