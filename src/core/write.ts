import type { Context } from './context'
import { relative } from 'path'

export async function write({ logger, files }: Context) {

  files.on('write:file-written', (data) => {
    const file = relative(process.cwd(), data.path)
    logger.success(`${file} (${data.index}/${data.total})`)
  })

  files.on('write:file-error', (data) => {
    const file = relative(data.path, process.cwd())
    logger.fail(file)
    process.exit(1)
  })

  files.on('write:done', (data) => {
    logger.success(`Successfully written all files!`)
  })

  files.writeFilesToDisk()


}
