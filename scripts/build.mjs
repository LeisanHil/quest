import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const outputRoot = new URL('../dist/', import.meta.url);

async function copyDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source)) {
    const sourcePath = join(source, entry);
    const destinationPath = join(destination, entry);
    if ((await stat(sourcePath)).isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }
}

await rm(outputRoot, { force: true, recursive: true });
await mkdir(outputRoot, { recursive: true });
await copyFile(new URL('../index.html', import.meta.url), new URL('./index.html', outputRoot));
await copyDirectory(new URL('../src/', import.meta.url).pathname, new URL('./src/', outputRoot).pathname);

console.log(`Static site built in ${outputRoot.pathname}`);
