const fs = require('fs');
const path = require('path');

function findIndexLines(filePath, targetIndices) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  const lines = content.split('\n');
  
  targetIndices.forEach(idx => {
    const item = data[idx];
    if (!item) {
        console.log(`Index ${idx}: Not found`);
        return;
    }
    const snippet = JSON.stringify(item.question).substring(0, 50);
    // Find the line number of the start of this object
    // This is a bit tricky with JSON.parse, so let's just find the index in the raw string if possible
    // or just print the item so we can grep it.
    console.log(`Index ${idx}: ${snippet}`);
  });
}

const techPath = path.join(process.cwd(), 'src/data/quiz/it-passport/technology.json');
console.log('--- technology.json ---');
findIndexLines(techPath, [26, 34, 49, 63, 69]);

const mgmtPath = path.join(process.cwd(), 'src/data/quiz/it-passport/management.json');
console.log('--- management.json ---');
findIndexLines(mgmtPath, [13, 33, 34, 51, 56, 60, 64]);
