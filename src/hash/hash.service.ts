import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { env } from 'src/config/env';

@Injectable()
export class HashService {
  async hash(data: string): Promise<string> {
    return argon2.hash(data, {
      type: argon2.argon2id,
      memoryCost: env.ARGON_MEMORY_COST,
      timeCost: env.ARGON_TIME_COST,
      parallelism: env.ARGON_PARALLELISM,
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
