import type { Context } from './context';

export async function write(this: Context) {
  const writtenFiles = this.files.writeFilesToDisk();
  while (!writtenFiles.next().done) {}
}
