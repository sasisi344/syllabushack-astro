import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

const files = [
  'src/data/post/app/dev-story-concept/index.md',
  'src/data/post/app/dev-story-data/index.md',
  'src/data/post/app/dev-story-ui/index.md',
  'src/data/post/app/gemini-cli-quiz-maker/index.md',
  'src/data/post/method/scientific-study-methods/index.md',
  'src/data/post/method/ai-rubber-ducking/index.md',
  'src/data/post/method/voice-output-learning/index.md',
  'src/data/post/method/generative-memory-palace/index.md',
  'src/data/post/method/miro-diagram-thinking/index.md',
  'src/data/post/method/syllabus-diff-hack/index.md',
  'src/data/post/method/miss-note-db/index.md',
  'src/data/post/method/digital-detox-learning/index.md',
  'src/data/post/method/ai-dj-pomodoro/index.md',
  'src/data/post/method/exam-day-doping/index.md'
];

files.forEach(file => {
  const filePath = path.resolve(rootDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if updateDate already exists
    if (!content.includes('updateDate:')) {
      // Regex to find publishDate and insert updateDate after it
      const regex = /(publishDate:\s*[^\n]+)/;
      if (regex.test(content)) {
        // Also capture the value of publishDate to reuse if needed, though user said use same date
        // Just extract the date string to be safe if format varies
        const match = content.match(regex);
        const publishDateLine = match[0];
        const dateValue = publishDateLine.split(':')[1].trim(); 
        
        // As per user request: "Same as publishDate" (which is mostly 2026-02-19 today)
        // But let's use the actual date found in the file to be consistent
        const newContent = content.replace(regex, `$1\nupdateDate: ${dateValue}`);
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${file} with date ${dateValue}`);
      } else {
        console.log(`Skipped (no publishDate match): ${file}`);
      }
    } else {
      console.log(`Skipped (already has updateDate): ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
