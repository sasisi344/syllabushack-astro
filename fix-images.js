import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('index.md') || file.endsWith('index.mdx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const rootDir = process.cwd();
const dataPostDir = path.join(rootDir, 'src', 'data', 'post');

const files = walk(dataPostDir);
files.forEach((file) => {
  const dir = path.dirname(file);
  const coverPath = path.join(dir, 'cover.jpg');
  const hasCover = fs.existsSync(coverPath);
  
  // Calculate relative path from src/data/post
  const relativeDir = path.relative(dataPostDir, dir).replace(/\\/g, '/');
  const fullPath = `~/data/post/${relativeDir}/cover.jpg`;

  let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let newLines = [];
  let imageAdded = false;

  for (let line of lines) {
    if (line.startsWith('image:')) {
      continue;
    }
    newLines.push(line);
    if (line.startsWith('title:') && !imageAdded && hasCover) {
      newLines.push(`image: "${fullPath}"`);
      imageAdded = true;
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
});
console.log('Finished processing files with full paths.');
