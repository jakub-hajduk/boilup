import { FileChanges } from './file-changes'

export type ChangeOrigin = string;
export type ChangeTimestamp = number;
export type ChangeContents = string;

export interface ChangeMeta {
  origin: ChangeOrigin,
  timestamp: ChangeTimestamp,
}

export interface Change extends ChangeMeta {
  contents: ChangeContents;
}

export type DiffTuple = [-1 | 0 | 1, string[]]
export type FlatDiffTuple = [-1 | 0 | 1, string]


export class ChangeLog  {
  changes: Map<string, FileChanges> = new Map()

  add(path: string, contents: ChangeContents, origin?: ChangeOrigin) {
    if (!this.changes.has(path)) {
        this.changes.set(path, new FileChanges(path))
    }
    this.changes.get(path).add(contents, origin)
  }

  get(path: string): FileChanges | undefined {
    return this.changes.get(path)
  }
}
