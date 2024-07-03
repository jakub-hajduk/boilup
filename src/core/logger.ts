import { type ConsolaInstance, createConsola } from 'consola'
import ora from 'ora'

export interface LoggerOptions {
  name?: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
}

export class Logger {
  consola: ConsolaInstance = createConsola()
  name: string
  path: string[] = ['root']

  subLoggers: Record<string, Logger> = {}

  constructor(private options?: Partial<LoggerOptions>) {
    this.consola = createConsola({
      level: options.level,
      formatOptions: {
        date: false
      }
    })
    this.name = 'root'

    if (options.name) {
      this.consola = this.consola.withTag(options.name)
      this.name = options.name
    }
  }

  static instance: Logger

  static getInstance(options?: Partial<LoggerOptions>) {
    if (!Logger.instance) {
      Logger.instance = new Logger(options)
    }

    return Logger.instance
  }

  log(message: string) {
    this.consola.log(message)
  }

  info(message: string) {
    this.consola.info(message)
  }

  success(message: string) {
    this.consola.success(message)
  }

  error(message: string) {
    this.consola.error(message)
  }

  fail(message: string) {
    this.consola.fail(message)
  }

  debug(message: string) {
    this.consola.debug(message)
  }

  start(message: string) {
    return ora(message).start()
  }

  tag(tag: string) {
    const consolaWithTag = new Logger(this.options)
    return consolaWithTag.consola.withTag(tag)
  }


  createSubLogger(name: string) {
    if (this.subLoggers[name]) {
      return this.subLoggers[name]
    }

    const loggerInstance = new Logger({
      ...this.options,
      name
    })

    loggerInstance.path = [...this.path, name]

    this.subLoggers[name] = loggerInstance

    return loggerInstance
  }
}
