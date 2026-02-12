const fs = require('fs');
const path = require('path');

const files = ['strategy.json', 'management.json', 'generative-ai.json'];
const dir = path.join('src', 'data', 'quiz', 'it-passport');

files.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) {
    console.log(`[SKIP] ${f} not found`);
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (data.length === 0) {
      console.log(`[SKIP] ${f} is empty`);
      return;
    }
    const item = data[Math.floor(Math.random() * data.length)];
    console.log(`--- ${f} (${data.length} items) ---`);
    console.log(`Keyword: [${item.keyword}]`);
    console.log(`Q: ${item.question}`);
    console.log(`A: ${item.answer}`);
    if (item.options) console.log(`Opts: ${item.options.join(' / ')}`);
    if (item.explanation) console.log(`Exp: ${item.explanation.substring(0, 100)}...`);
  } catch (e) {
    console.error(`[ERROR] ${f}: ${e.message}`);
  }
});
