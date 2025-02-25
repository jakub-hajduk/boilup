import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

type Params = Parameters<typeof writeFileSync>;

export const outputFileSync = (
  file: string,
  data: Params[1],
  options?: Params[2],
) => {
  const dir = dirname(file);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(file, data, options);
};
