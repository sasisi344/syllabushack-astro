const fs = require('fs');
const path = require('path');

const quizDir = path.join(process.cwd(), 'src/data/quiz/it-passport');

function fixFile(fileName, fixes) {
  const filePath = path.join(quizDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let modified = false;

  fixes.forEach(fix => {
    const item = data[fix.index];
    if (item) {
      Object.keys(fix.update).forEach(key => {
        item[key] = fix.update[key];
      });
      modified = true;
      console.log(`Prepared fix for ${fileName} [Index ${fix.index}]`);
    } else {
      console.warn(`Item at Index ${fix.index} not found in ${fileName}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully fixed ${fileName}`);
  }
}

// technology.json fixes
const techFixes = [
  { index: 26, update: { id: "ip-1770863600026" } },
  { index: 34, update: { id: "ip-1770863600034" } },
  { index: 49, update: { answer: "ア" } }, // Social Engineering question
  { index: 63, update: { id: "ip-1770863600063" } }
  // Index 5? Maybe there's one more. I'll re-run report after these.
];

// management.json fixes
const mgmtFixes = [
  { index: 13, update: { id: "ip-1770863700013" } },
  { index: 33, update: { id: "ip-1770863700033" } },
  { index: 34, update: { answer: "ア" } }, // SLI question
  { index: 51, update: { id: "ip-1770863700051" } },
  { index: 56, update: { id: "ip-1770863700056" } },
  { index: 60, update: { id: "ip-1770863700060" } },
  { index: 64, update: { id: "ip-1770863700064" } }
];

fixFile('technology.json', techFixes);
fixFile('management.json', mgmtFixes);
