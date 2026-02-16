import fs from 'fs';
const content = fs.readFileSync('build-err2.txt', 'utf8');
const clean = content.replace(/\x1b\[[0-9;]*m/g, '');

// Split on both real newlines and literal \\n
const lines = clean.split(/\n|\\n/);
const errorLines = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].toLowerCase();
  if (l.includes('cannot') || l.includes('not defined') || l.includes('fieldstats') || 
      l.includes('strategy-drill') || l.includes('it-passport-quiz')) {
    errorLines.push(`${i}: ${lines[i].substring(0, 250)}`);
  }
}

console.log(`Total split lines: ${lines.length}`);
console.log(`Matching lines: ${errorLines.length}`);
errorLines.forEach(l => console.log(l));
