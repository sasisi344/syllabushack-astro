import { execSync } from 'child_process';

function run(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
  }
}

console.log('--- Starting Bulk Generation for FE Quiz Data ---');

// Strategy
run('node scripts/generate-quiz-fe.js --category strategy --count 5');

// Management
run('node scripts/generate-quiz-fe.js --category management --count 5');

// Technology
run('node scripts/generate-quiz-fe.js --category technology --count 27');

// Practical
run('node scripts/generate-quiz-fe-b.js --count 38');

console.log('--- Bulk Generation Finished ---');
