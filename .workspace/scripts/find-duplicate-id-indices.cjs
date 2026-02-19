const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/quiz/it-passport/technology.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const targetId = 'ip-20240729103001';
const indices = [];

data.forEach((q, index) => {
  if (q.id === targetId) {
    indices.push(index);
  }
});

console.log(`Indices with ID ${targetId}:`, indices);
