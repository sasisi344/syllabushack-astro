const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/master/syllabus-sg.json', 'utf8'));

function findEntries(obj, term, path = '') {
  let results = [];
  if (typeof obj === 'string') {
    if (obj.includes(term)) results.push({ path, value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      results = results.concat(findEntries(item, term, `${path}[${i}]`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      results = results.concat(findEntries(obj[key], term, `${path}.${key}`));
    });
  }
  return results;
}

['科目B', 'ケーススタディ', '実践'].forEach(term => {
  const found = findEntries(data, term);
  console.log(`Term: ${term}, Count: ${found.length}`);
  if (found.length > 0) {
    console.log('Sample:', found[0]);
  }
});
