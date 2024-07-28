import { Logger, type LoggerOptions } from './logger'
import { OutputCollection, type OutputCollectionOptions } from './output-files-collection'

export interface ContextOptions {
  /**
   * Whether files should be written to disk or not.
   */
  dryRun: boolean
  /**
   * Whether log messages should be printed
   */
  silent: boolean
  /**
   * Out dir for files to write
   * equivalent of setting logLevel to 0.
   * @default ./
   */
  outDir: string
  /**
   * The level of messages to be shown:
   * 0: Fatal and Error
   * 1: Warnings
   * 2: Normal logs
   * 3: Informational logs, success, fail, ready, start, ... (default)
   * 4: Debug logs
   * 5: Trace logs
   *
   * @default 3
   */
  logLevel: 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * Whether changes to files shall be logged for debuging purposes
   */
  logChanges: boolean
  /**
   * Whether debug mode should be active.
   * This option sets logLevel to 5 and logChanges to true.
   */
  debug: boolean
}

export interface Context {
  cwd: string;
  name: string;
  options: Partial<ContextOptions>
  files: OutputCollection
  logger: Logger,
  createSubContext: (name: string) => Context
  parentContext: Context | null,
  childContexts: Context[]
}

export function createContext (options?: Partial<ContextOptions>): Context {
  const loggerOptions: LoggerOptions = {
    level: options?.silent ? 0 : (options?.logLevel || 3)
  }

  const outputCollectionOptions: OutputCollectionOptions = {
    dry: options?.dryRun || false,
    outDir: options?.outDir || './',
    logChanges: options.debug || options?.logChanges || false
  }

  const logger = new Logger(loggerOptions)
  const files = new OutputCollection(outputCollectionOptions)

  const context: Context = {
    name: 'root',
    cwd: process.cwd(),
    options: options || {},
    parentContext: null,
    childContexts: [],
    logger,
    files,
    createSubContext(name: string): Context {
      const newContext = {
        ...this,
        name,
        parentContext: this,
        logger: this.logger.createSubLogger(name),
        files: this.files.withOrigin(name)
      }

      this.childContexts.push(newContext)

      return newContext
    }
  }

  return context
}



