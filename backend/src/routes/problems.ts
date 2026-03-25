import { Router, Request, Response } from 'express';
import { telegramAuth, optionalAuth } from '../middleware/telegramAuth';
import { submitLimiter } from '../middleware/rateLimiter';
import { createProblemSchema, problemsQuerySchema } from '../validators/problem.validator';
import { createProblem, getProblems, getProblemById } from '../services/problem.service';

const router = Router();

// Create a problem
router.post('/', telegramAuth, submitLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = createProblemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const imageUrl = req.body.image_url || undefined;
    const problem = await createProblem(req.dbUserId!, parsed.data, imageUrl);
    res.status(201).json(problem);
  } catch (err) {
    console.error('Create problem error:', err);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// List problems
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const parsed = problemsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }

    const result = await getProblems(parsed.data, req.dbUserId);
    res.json(result);
  } catch (err) {
    console.error('List problems error:', err);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get single problem
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const problem = await getProblemById(id, req.dbUserId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    res.json(problem);
  } catch (err) {
    console.error('Get problem error:', err);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

export default router;
