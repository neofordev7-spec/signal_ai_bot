import { Router, Request, Response } from 'express';
import { adminAuth } from '../middleware/telegramAuth';
import { getAnalytics } from '../services/analytics.service';

const router = Router();

router.get('/', adminAuth, async (_req: Request, res: Response) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
