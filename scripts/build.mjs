import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const outputRoot = new URL('../dist/', import.meta.url);
const hash = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

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
await copyDirectory(new URL('../quest/', import.meta.url).pathname, new URL('./quest/', outputRoot).pathname);
await copyDirectory(new URL('../public/', import.meta.url).pathname, new URL('./public/', outputRoot).pathname);

const dataPath = new URL('./src/quest-data.js', outputRoot);
const mainPath = new URL('./src/main.js', outputRoot);
const stylesPath = new URL('./src/styles.css', outputRoot);
const landingStylesPath = new URL('./src/landing.css', outputRoot);
const portraitPath = new URL('./public/polina-detective-barcelona.jpg', outputRoot);

const dataVersion = hash(await readFile(dataPath));
const mainSource = (await readFile(mainPath, 'utf8'))
  .replace("'./quest-data.js'", `'./quest-data.js?v=${dataVersion}'`);
await writeFile(mainPath, mainSource);

const portraitVersion = hash(await readFile(portraitPath));
const landingStyles = (await readFile(landingStylesPath, 'utf8'))
  .replace('polina-detective-barcelona.jpg', `polina-detective-barcelona.jpg?v=${portraitVersion}`);
await writeFile(landingStylesPath, landingStyles);

const mainVersion = hash(mainSource);
const stylesVersion = hash(await readFile(stylesPath));
const landingStylesVersion = hash(landingStyles);

for (const page of ['index.html', 'quest/index.html', 'quest/history/index.html']) {
  const pagePath = new URL(`./${page}`, outputRoot);
  const html = (await readFile(pagePath, 'utf8'))
    .replace(/src\/main\.js"/g, `src/main.js?v=${mainVersion}"`)
    .replace(/src\/styles\.css"/g, `src/styles.css?v=${stylesVersion}"`)
    .replace(/src\/landing\.css"/g, `src/landing.css?v=${landingStylesVersion}"`);
  await writeFile(pagePath, html);
}

console.log(`Static site built in ${outputRoot.pathname}`);
