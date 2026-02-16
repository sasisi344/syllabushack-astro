import fs from 'fs';
import path from 'path';

const TARGET_FILES = [
  'src/data/quiz/it-passport/strategy.json',
  'src/data/quiz/it-passport/management.json',
  'src/data/quiz/it-passport/technology.json'
];

function repairFile(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return;

  const b = fs.readFileSync(fullPath);
  const content = b.toString('utf8');
  
  if (!content.includes('\uFFFD')) {
    console.log(`${filePath}: No corruption found.`);
    return;
  }

  // 既知のパターンを修復
  let repaired = content
    .replace(/動\uFFFD/g, '動')
    .replace(/移動\uFFFD/g, '移動')
    .replace(/\uFFFDノ/g, 'モノ') 
    .replace(/担当\uFFFD/g, '担当し')
    .replace(/企業\uFFFD/g, '企業内')
    .replace(/行\uFFFD/g, '行う')
    .replace(/用\uFFFD/g, '用いて')
    .replace(/技術\uFFFD/g, '技術')
    .replace(/管理\uFFFD/g, '管理')
    .replace(/活用\uFFFD/g, '活用')
    .replace(/関連\uFFFD/g, '関連')
    .replace(/理解\uFFFD/g, '理解')
    .replace(/重視\uFFFD/g, '重視')
    .replace(/進歩\uFFFD/g, '進歩')
    .replace(/実現\uFFFD/g, '実現')
    .replace(/適切\uFFFD/g, '適切')
    .replace(/基礎\uFFFD/g, '基礎')
    .replace(/知識\uFFFD/g, '知識');

  // 残った \uFFFD は単に削除（意味が通じなくなる可能性はあるが、表示上の不快感は消える）
  repaired = repaired.replace(/\uFFFD/g, '');

  fs.writeFileSync(fullPath, repaired, 'utf8');
  console.log(`${filePath}: Repaired!`);
}

TARGET_FILES.forEach(f => repairFile(f));
