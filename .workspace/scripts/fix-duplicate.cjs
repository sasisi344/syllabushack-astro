const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/data/quiz/it-passport/technology.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Change ID for index 69
data[69].id = "ip-1770863600069";

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed duplicate ID in technology.json');
