import { z } from 'zod';
import * as dotenv from 'dotenv';
import { join } from 'path';

const envPath = join(__dirname, '../../../.env');

dotenv.config({ path: envPath });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  ARGON_MEMORY_COST: z.coerce.number().default(2 ** 16),
  ARGON_TIME_COST: z.coerce.number().default(5),
  ARGON_PARALLELISM: z.coerce.number().default(1),
  JWT_SECRET: z.string().min(1),
  COOKIE_EXPIRATION: z.coerce.number(),
  JWT_EXPIRATION: z.string(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    '❌ Erro ao validar variáveis de ambiente:',
    _env.error.format(),
  );
  throw new Error('Variáveis de ambiente inválidas');
}

export const env = _env.data;
