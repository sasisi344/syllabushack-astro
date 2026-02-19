import { getPermalink } from './src/utils/permalinks';

console.log('it-passport-quiz:', getPermalink('it-passport-quiz'));
console.log('app/it-passport-quiz:', getPermalink('app/it-passport-quiz'));
console.log('method (category):', getPermalink('method', 'category'));
