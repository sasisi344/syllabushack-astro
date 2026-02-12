import fs from 'fs';
import path from 'path';

const postDir = 'src/data/post';

function getAllFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, allFiles);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      allFiles.push(name);
    }
  });
  return allFiles;
}

const files = getAllFiles(postDir);
const categories = {};

files.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  const titleMatch = content.match(/^title:\s*[\"']?(.+?)[\"']?\s*$/m);
  const catMatch = content.match(/^category:\s*[\"']?(.+?)[\"']?\s*$/m);
  
  // Use directory name as primary category source based on project rules
  const relativePath = path.relative(postDir, p);
  const dirCat = relativePath.split(path.sep)[0];
  
  if (titleMatch) {
    const title = titleMatch[1].replace(/['"]/g, '').trim();
    const cat = dirCat || (catMatch ? catMatch[1].replace(/['"]/g, '') : 'other').trim();
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(title);
  }
});

let output = '# 記事一覧 (カテゴリ別集計)\n\n';
output += `全記事数: ${files.length}\n\n`;

Object.keys(categories).sort().forEach(cat => {
  output += `## ${cat} (${categories[cat].length}記事)\n\n`;
  categories[cat].sort().forEach(t => {
    output += `- ${t}\n`;
  });
  output += '\n';
});

const outDir = '.workspace/data-set';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'article-list.md'), output);
console.log('Article list generated at .workspace/data-set/article-list.md');
