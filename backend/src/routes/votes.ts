import { Router, Request, Response } from 'express';
import { telegramAuth } from '../middleware/telegramAuth';
import { voteSchema } from '../validators/problem.validator';
import { toggleVote } from '../services/problem.service';

const router = Router();

router.post('/', telegramAuth, async (req: Request, res: Response) => {
  try {
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const result = await toggleVote(req.dbUserId!, parsed.data.problem_id);
    res.json(result);
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

export default router;
