import { Logger, type LoggerOptions } from './logger'
import { OutputCollection, type OutputCollectionOptions } from './output-files-collection'

export interface ContextOptions {
  files?: Partial<OutputCollectionOptions>
  logger?: Partial<LoggerOptions>
}

export interface Context {
  cwd: string;
  options: Partial<ContextOptions>
  files: OutputCollection
  logger: Logger,
  createSubContext: (name: string) => Context
}

export function createContext (options?: Partial<ContextOptions>): Context {
  const logger = Logger.getInstance(options.logger)
  const files = OutputCollection.getInstance(options.files)

  const context = {
    cwd: process.cwd(),
    options: options || {},
    parent: null,
    logger,
    files,
    createSubContext(name: string): Context {
      return {
        ...this,
        logger: this.logger.createSubLogger(name)
      }
    }
  }

  return context
}
