import { z } from 'zod';

export const createProblemSchema = z.object({
  title: z.string().min(5).max(300),
  description: z.string().min(10).max(5000),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const voteSchema = z.object({
  problem_id: z.number().int().positive(),
});

export const problemsQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['trending', 'new', 'urgent']).optional().default('new'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().optional(),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type ProblemsQuery = z.infer<typeof problemsQuerySchema>;
