const fs = require('fs');
const path = require('path');

const dir = path.join('src', 'data', 'quiz', 'sg');
const files = ['strategy.json', 'management.json', 'technology.json', 'practical.json'];

files.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) {
    console.log(`[NOT FOUND] ${f}`);
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(`✅ ${f}: ${data.length} items`);
    // Basic structural check
    data.forEach((item, i) => {
        if (!item.question || !item.options || !item.answer) {
            console.error(`❌ ${f} index ${i}: Missing basic fields`);
        }
        if (f === 'practical.json' && !item.scenario) {
            console.error(`❌ ${f} index ${i}: Missing scenario field`);
        }
    });
  } catch (e) {
    console.error(`❌ ${f}: JSON Parse Error - ${e.message}`);
  }
});
