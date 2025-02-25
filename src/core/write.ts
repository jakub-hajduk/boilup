import type { Context } from './context';

export async function write(this: Context) {
  this.files.on('write:file-written', (data) => {
    // const file = relative(process.cwd(), data.path)
    // this.logger.success(`${file} (${data.index}/${data.total})`)
  });

  this.files.on('write:file-error', (data) => {
    // const file = relative(data.path, process.cwd())
    // this.logger.fail(file)
    process.exit(1);
  });

  this.files.on('write:done', (data) => {
    // this.logger.success(`Successfully written all files!`)
  });

  this.files.writeFilesToDisk();
}
