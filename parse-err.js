const fs = require('fs');
const content = fs.readFileSync('build-err2.txt', 'utf8');

// Remove ANSI escape codes
const clean = content.replace(/\x1b\[[0-9;]*m/g, '');

// Find all lines with error-like content
const lines = clean.split('\n');
const errorLines = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].toLowerCase();
  if (l.includes('error') || l.includes('cannot') || l.includes('not defined') || 
      l.includes('failed') || l.includes('unexpected') || l.includes('renderframe') ||
      l.includes('unable') || l.includes('undefined')) {
    errorLines.push(`L${i}: ${lines[i].substring(0, 200)}`);
  }
}

console.log(`Total lines: ${lines.length}`);
console.log(`Error lines found: ${errorLines.length}`);
errorLines.forEach(l => console.log(l));
