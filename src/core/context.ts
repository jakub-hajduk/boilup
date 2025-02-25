import { Writepool } from 'writepool';

export interface ContextOptions {
  /**
   * Whether files should be written to disk or not.
   */
  dryRun: boolean;
  /**
   * Whether log messages should be printed
   */
  silent: boolean;
  /**
   * Out dir for files to write
   * equivalent of setting logLevel to 0.
   * @default ./
   */
  outDir: string;
}

export interface Context {
  cwd: string;
  name: string;
  options: Partial<ContextOptions>;
  files: Writepool;
}

export function createContext(options?: Partial<ContextOptions>): Context {
  const outputCollectionOptions = {
    dry: options?.dryRun || false,
    outDir: options?.outDir || './',
  };
  const files = new Writepool(outputCollectionOptions);

  const context: Context = {
    name: 'root',
    cwd: process.cwd(),
    options: options || {},
    files,
  };

  return context;
}
