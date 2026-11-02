const fs = require('fs');
const deckText = fs.readFileSync('src/data/deck.ts', 'utf8');
const idMatches = [...deckText.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Total card IDs in deck.ts:', idMatches.length);
console.log('Cards:', idMatches);

const achText = fs.readFileSync('src/data/achievements.ts', 'utf8');
const achMatches = [...achText.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Total achievements in achievements.ts:', achMatches.length);
console.log('Achievements:', achMatches);
