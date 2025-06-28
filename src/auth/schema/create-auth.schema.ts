import { z } from 'zod';

export const createAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateAuthDto = z.infer<typeof createAuthSchema>;
