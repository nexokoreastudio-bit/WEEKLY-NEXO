/**
 * Netlify 빌드 시 환경 변수로 js/config.js 생성.
 * SUPABASE_URL, SUPABASE_ANON_KEY가 있으면 진짜 회원(DB) 모드용 설정을 씁니다.
 */
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';

const content = `// 자동 생성됨 (scripts/write-config.js). 수정하지 마세요.
window.__SUPABASE_URL__ = ${JSON.stringify(url)};
window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(key)};
`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote js/config.js (Supabase:', url ? 'configured' : 'not set', ')');
