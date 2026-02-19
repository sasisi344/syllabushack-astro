const fs = require('fs');
const path = require('path');

const quizDir = path.join(process.cwd(), 'src/data/quiz/it-passport');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json'));

const report = {};

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const ids = new Set();
  const questions = new Set();
  const errors = [];

  data.forEach((q, index) => {
    const requiredFields = ['id', 'question', 'options', 'answer', 'explanation'];
    requiredFields.forEach(field => {
      if (!q[field]) {
        errors.push(`[Index ${index}] Missing field: ${field}`);
      }
    });

    if (q.id) {
      if (ids.has(q.id)) {
        errors.push(`[Index ${index}] Duplicate ID: ${q.id}`);
      }
      ids.add(q.id);
    }

    if (q.question) {
      if (questions.has(q.question)) {
        errors.push(`[Index ${index}] Duplicate question: ${q.question.substring(0, 30)}`);
      }
      questions.add(q.question);
    }

    if (Array.isArray(q.options)) {
      q.options.forEach((opt, oIndex) => {
        if (!opt.match(/^[ア-エA-D]:\s*/)) {
          errors.push(`[Index ${index}] Invalid opt format: ${opt}`);
        }
      });
    }
  });

  report[file] = {
    count: data.length,
    errors: errors
  };
});

fs.writeFileSync(path.join(process.cwd(), '.workspace/data-check-report.json'), JSON.stringify(report, null, 2));
console.log('Report generated at .workspace/data-check-report.json');
