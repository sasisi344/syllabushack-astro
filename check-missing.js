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

const files = walk('src/data/post');
files.forEach((file) => {
  const dir = path.dirname(file);
  const coverJpg = path.join(dir, 'cover.jpg');
  if (!fs.existsSync(coverJpg)) {
    console.log(`MISSING cover.jpg in: ${dir}`);
  }
});
