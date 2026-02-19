const fs = require('fs');
const path = require('path');

const quizDir = path.join(process.cwd(), 'src/data/quiz/it-passport');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  console.log(`\nChecking ${file}...`);
  const filePath = path.join(quizDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const ids = new Set();
  const questions = new Set();
  const errors = [];

  data.forEach((q, index) => {
    // 1. Check for missing required fields
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
        errors.push(`[Index ${index}] Duplicate question text: ${q.question.substring(0, 30)}...`);
      }
      questions.add(q.question);
    }

    // 2. Check options format
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, oIndex) => {
        if (!opt.match(/^[ア-エA-D]:\s*/)) {
          errors.push(`[Index ${index}] Option ${oIndex} invalid format: ${opt}`);
        }
      });

      // 3. Check answer consistency
      if (q.answer) {
        const optionLabels = q.options.map(opt => opt.charAt(0));
        if (!optionLabels.includes(q.answer)) {
          errors.push(`[Index ${index}] Answer '${q.answer}' not found in options: ${optionLabels.join(', ')}`);
        }
      }
    } else if (q.options) {
      errors.push(`[Index ${index}] 'options' is not an array`);
    }

    // 4. Check explanation quality (simple check for length or placeholders)
    if (q.explanation && (q.explanation.length < 10 || q.explanation.includes('TODO') || q.explanation.includes('入る'))) {
      errors.push(`[Index ${index}] Potential low quality explanation: ${q.explanation}`);
    }
  });

  if (errors.length === 0) {
    console.log(`✅ ${file} passed all checks (${data.length} questions).`);
  } else {
    console.log(`❌ ${file} failed with ${errors.length} errors:`);
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 10) console.log(`  ... and ${errors.length - 10} more`);
  }
});
