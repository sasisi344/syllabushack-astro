const fs = require('fs');
const path = require('path');

const techPath = path.join(process.cwd(), 'src/data/quiz/it-passport/technology.json');
const data = JSON.parse(fs.readFileSync(techPath, 'utf8'));

console.log(JSON.stringify(data[33], null, 2));
console.log(JSON.stringify(data[69], null, 2));
