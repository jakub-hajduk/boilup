import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { outputFileSync } from '../utils/output-file-sync.util'
import { TypedEmitter } from '../utils/typed-event-emitter.util'
import { ChangeLog } from './change-log'


export interface OutputCollectionOptions {
  outDir: string;
  dry: boolean;
}

export interface OutputCollectionEventMap {
  'file:stacked': { path: string, origin: string, contents: string }
  'write:start': { index: number, total: number }
  'write:file-written': { path: string, index: number, total: number }
  'write:file-error': { path: string, index: number, total: number, error: Error }
  'write:done': { index: number, total: number }
}

export class OutputCollection {
  static instance: OutputCollection

  private emitter = new TypedEmitter<OutputCollectionEventMap>();
  private changeLog = new ChangeLog()
  public files: Map<string, string> = new Map();

  private options: OutputCollectionOptions = {
    outDir: dirname(fileURLToPath(import.meta.url)),
    dry: false
  };

  on = this.emitter.on
  once = this.emitter.once

  constructor(options?: Partial<OutputCollectionOptions>) {
    this.options = { ...this.options, ...options};
    this.on = this.emitter.on.bind(this);
    this.once = this.emitter.once.bind(this);
  }

  static getInstance(options?: Partial<OutputCollectionOptions>) {
    if (!OutputCollection.instance) {
      OutputCollection.instance = new OutputCollection(options)
    }

    return OutputCollection.instance
  }

  public get(path: string): [string, string]
  public get(predicate: (path: string, contents: string) => boolean): [string, string]
  public get(pathOrPredicate: string | ((path: string, contents: string) => boolean)): [string, string] {
    if(typeof pathOrPredicate === 'function') {
      for(let file of this.files) {
        if (pathOrPredicate(...file)) {
          return file
        }
      }
      return
    }

    if (this.files.has(pathOrPredicate)) {
      return [pathOrPredicate, this.files.get(pathOrPredicate)]
    }
  }

  public write(path: string, contents: string, origin?: string) {
    this.files.set(path, contents);
    this.changeLog.add(path, contents, origin)
    this.emitter.emit('file:stacked',  { path, origin, contents });
  }

  public getChanges(path: string) {
    return this.changeLog.get(path)
  }

  public writeFilesToDisk(options?: Partial<OutputCollectionOptions>) {
    const finalOptions: OutputCollectionOptions = {
      ...this.options,
      ...options
    }
    let index = 1;
    this.emitter.emit('write:start', { index, total: this.files.size });
    this.files.forEach(async (contents, file) => {
      const path = resolve(finalOptions.outDir, file)
      try {
        if (!this.options.dry) {
          outputFileSync(path, contents);
        }
        this.emitter.emit('write:file-written', { path, index, total: this.files.size });
      } catch (error) {
        this.emitter.emit('write:file-error', { path, index, total: this.files.size, error });
      }
      index++;
    });
    this.emitter.emit('write:done', { index, total: this.files.size });
  }
}
