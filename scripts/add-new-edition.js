/**
 * 새로운 발행호 추가 스크립트
 * 
 * 사용법:
 * node scripts/add-new-edition.js "2026-02-12" "발행호 제목" "부제목(선택사항)"
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addNewEdition() {
  console.log('📰 새로운 발행호 추가\n');

  // 1. 발행일 입력
  const editionId = await question('발행일 (YYYY-MM-DD): ');
  if (!editionId.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.error('❌ 날짜 형식이 올바르지 않습니다. (예: 2026-02-12)');
    rl.close();
    return;
  }

  // 2. 제목 입력
  const title = await question('발행호 제목: ');
  if (!title.trim()) {
    console.error('❌ 제목을 입력해주세요.');
    rl.close();
    return;
  }

  // 3. 부제목 입력 (선택사항)
  const subtitle = await question('부제목 (선택사항, Enter로 건너뛰기): ');

  // 4. 카테고리 선택
  const category = await question('카테고리 (news/column/update/event, 기본값: news): ') || 'news';
  if (!['news', 'column', 'update', 'event'].includes(category)) {
    console.error('❌ 올바른 카테고리를 입력해주세요.');
    rl.close();
    return;
  }

  // 5. 콘텐츠 입력 (선택사항)
  console.log('\n콘텐츠 입력 (HTML 가능, 여러 줄 입력 후 빈 줄에서 Enter 두 번):');
  const contentLines = [];
  let emptyLineCount = 0;
  
  rl.on('line', (line) => {
    if (line.trim() === '') {
      emptyLineCount++;
      if (emptyLineCount >= 2) {
        rl.removeAllListeners('line');
        const content = contentLines.join('\n').trim();
        proceedWithInsert(editionId, title, subtitle, category, content);
      }
    } else {
      emptyLineCount = 0;
      contentLines.push(line);
    }
  });

  // 간단한 방법: 한 줄로 입력받기
  const content = await question('콘텐츠 (HTML, Enter로 건너뛰기): ');
  await proceedWithInsert(editionId, title, subtitle, category, content);
}

async function proceedWithInsert(editionId, title, subtitle, category, content) {
  console.log('\n📝 입력된 정보:');
  console.log(`  발행일: ${editionId}`);
  console.log(`  제목: ${title}`);
  console.log(`  부제목: ${subtitle || '(없음)'}`);
  console.log(`  카테고리: ${category}`);
  console.log(`  콘텐츠: ${content ? `${content.substring(0, 50)}...` : '(없음)'}`);

  const confirm = await question('\n위 정보로 추가하시겠습니까? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('취소되었습니다.');
    rl.close();
    return;
  }

  // 데이터베이스에 추가
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      content: content.trim() || null,
      category: category,
      edition_id: editionId,
      published_at: new Date(editionId + 'T00:00:00Z').toISOString(),
      is_published: true,
      views: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 추가 실패:', error.message);
    rl.close();
    return;
  }

  console.log('\n✅ 발행호가 성공적으로 추가되었습니다!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Edition ID: ${data.edition_id}`);
  console.log(`   제목: ${data.title}`);
  console.log(`\n🌐 확인: http://localhost:3001/news/${editionId}`);

  rl.close();
}

addNewEdition().catch(console.error);

