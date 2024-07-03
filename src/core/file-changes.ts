import { colors } from 'consola/utils'
import { calcSlices } from 'fast-myers-diff'
import type {
  Change,
  ChangeContents,
  ChangeOrigin,
  DiffTuple,
  FlatDiffTuple
} from './change-log'


const flattenDiff = (diff: Generator<DiffTuple>): FlatDiffTuple[] => {
  return Array.from(diff).map(([type, contents]) => {
    return contents.map(line => [type, line])
  }).flat() as FlatDiffTuple[]
}

export class FileChanges {
  private log: Change[] = []

  constructor(public path: string) {
  }

  at(index: number) {
    return this.log.at(index)
  }

  add(contents: ChangeContents, origin?: ChangeOrigin) {
    const record: Change = {
      timestamp: Date.now(),
      origin: origin,
      contents: contents,
    }
    this.log.push(record)
  }

  get(index: number) {
    return this.log.at(index)
  }

  diff(prevIndex: number, nextIndex: number) {
    const prev = this.log.at(prevIndex)
    const next = this.log.at(nextIndex)

    const diff = calcSlices(prev.contents.split('\n'), next.contents.split('\n'))

    const flatDiff = flattenDiff(diff)

    const out = flatDiff.map(([type, line]) => {
      let color = colors.reset
      let icon = colors.reset('    ')
      if (type === -1){
        color = colors.red
        icon = colors.red(' -  ')
      }
      if (type === 1) {
        color = colors.green
        icon = colors.green(' +  ')
      }

      return `${icon}${color(line)}\n`
    })

    console.log('\n', ...out)

  }
}
