const fs = require('fs');
const path = require('path');

const techPath = path.join(process.cwd(), 'src/data/quiz/it-passport/technology.json');
const mgmtPath = path.join(process.cwd(), 'src/data/quiz/it-passport/management.json');

const techIndices = [26, 34, 49, 63, 69];
const mgmtIndices = [13, 33, 34, 51, 56, 60, 64];

function dumpIndices(filePath, indices, label) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const results = [];
  indices.forEach(idx => {
    results.push({
      index: idx,
      data: data[idx]
    });
  });
  return results;
}

const finalDump = {
  technology: dumpIndices(techPath, techIndices, 'technology.json'),
  management: dumpIndices(mgmtPath, mgmtIndices, 'management.json')
};

fs.writeFileSync(path.join(process.cwd(), '.workspace/indices-dump.json'), JSON.stringify(finalDump, null, 2), 'utf8');
console.log('Dumped to .workspace/indices-dump.json');
