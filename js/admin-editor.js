// 관리자 에디터 JavaScript (간단 버전)
const ADMIN_PASSWORD = 'nexo2026';

// 로그인 처리
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin-authenticated', 'true');
        showEditor();
    } else {
        alert('비밀번호가 올바르지 않습니다.');
    }
});

// 로그아웃
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin-authenticated');
    location.reload();
});

// 인증 확인
function checkAuth() {
    if (sessionStorage.getItem('admin-authenticated') === 'true') {
        showEditor();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-editor').style.display = 'none';
}

function showEditor() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-editor').style.display = 'block';
}

// 툴바 버튼 - 텍스트 삽입
function insertText(text, editorId) {
    const editor = document.getElementById(editorId);
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;
    
    editor.value = value.substring(0, start) + text + value.substring(end);
    editor.focus();
    editor.setSelectionRange(start + text.length, start + text.length);
}

// 이미지 미리보기
document.querySelectorAll('.image-input-hidden').forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const index = e.target.dataset.index;
        const preview = document.getElementById(`preview-${index}`);
        const filenameInput = document.getElementById(`image-${index}-filename`);
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="미리보기">`;
            };
            reader.readAsDataURL(file);
            
            // 파일명 자동 입력
            if (filenameInput) {
                filenameInput.value = file.name;
            }
        }
    });
});

// 발행일 자동 계산
document.getElementById('edition-date').addEventListener('change', (e) => {
    const date = new Date(e.target.value);
    const day = date.getDay();
    
    if (day !== 4) {
        alert('⚠️ 주의: 선택한 날짜가 목요일이 아닙니다. 매주 목요일에 발행됩니다.');
    }
});

// 텍스트 파싱 함수 - 사용자 입력을 구조화된 데이터로 변환
function parseContent(text, title) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // 제목에서 헤드라인 추출
    let headline = title;
    let subHeadline = '';
    
    // [제목] 형식이면 제목 추출
    const titleMatch = title.match(/\[(.+?)\]/);
    if (titleMatch) {
        headline = titleMatch[1];
    }
    
    // 본문 추출
    let mainContent = '';
    const updates = [];
    const achievements = [];
    let stats = {
        totalInstallations: 15000,
        activeUsers: 3000,
        contentUpdates: 5
    };
    
    let currentSection = 'main';
    let currentUpdate = null;
    let currentAchievement = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 빈 줄은 본문에 추가
        if (!line) {
            if (mainContent && !mainContent.endsWith('\n\n')) {
                mainContent += '\n\n';
            }
            continue;
        }
        
        // ✅ 체크리스트 = 업데이트
        if (line.startsWith('✅')) {
            const content = line.substring(1).trim();
            const parts = content.split(':');
            if (parts.length >= 2) {
                updates.push({
                    category: '서비스',
                    version: parts[0].trim(),
                    description: parts.slice(1).join(':').trim(),
                    date: getTodayDate()
                });
            } else {
                updates.push({
                    category: '서비스',
                    version: '업데이트',
                    description: content,
                    date: getTodayDate()
                });
            }
            continue;
        }
        
        // 🏆 업적
        if (line.startsWith('🏆')) {
            const content = line.substring(1).trim();
            achievements.push({
                type: 'growth',
                category: '성장',
                title: content.split(':')[0] || '주요 업적',
                description: content,
                date: getTodayDate(),
                value: '',
                milestone: '주요 성과'
            });
            continue;
        }
        
        // 💡 특별 제안
        if (line.startsWith('💡')) {
            const content = line.substring(1).trim();
            if (!subHeadline) {
                subHeadline = content;
            }
            continue;
        }
        
        // 📞 연락처, 🌐 웹사이트는 본문에 포함
        if (line.startsWith('📞') || line.startsWith('🌐')) {
            mainContent += line + '\n';
            continue;
        }
        
        // 숫자 패턴 찾기 (통계)
        const numberMatch = line.match(/(\d+)[만천백]?/);
        if (numberMatch && parseInt(numberMatch[1]) > 100) {
            // 통계 정보 추출 시도
            if (line.includes('설치') || line.includes('대')) {
                const num = parseInt(numberMatch[1]);
                if (num > stats.totalInstallations) {
                    stats.totalInstallations = num;
                }
            }
            if (line.includes('사용자') || line.includes('명')) {
                const num = parseInt(numberMatch[1]);
                if (num > stats.activeUsers) {
                    stats.activeUsers = num;
                }
            }
        }
        
        // 일반 본문
        mainContent += line + '\n';
    }
    
    // 본문 정리
    mainContent = mainContent.trim();
    
    // 업데이트가 없으면 기본값
    if (updates.length === 0) {
        updates.push({
            category: '서비스',
            version: '주간 업데이트',
            description: '이번 주 주요 소식을 전달합니다.',
            date: getTodayDate()
        });
    }
    
    // 업적이 없으면 기본값
    if (achievements.length === 0 && mainContent.includes('검증') || mainContent.includes('실적')) {
        achievements.push({
            type: 'growth',
            category: '성장',
            title: '검증된 실적',
            description: '전국 학원 및 기업에 넥소 전자칠판이 인정받고 있습니다.',
            date: getTodayDate(),
            value: '',
            milestone: '시장 인정'
        });
    }
    
    return {
        headline: headline || title,
        subHeadline: subHeadline,
        mainContent: mainContent,
        updates: updates,
        achievements: achievements.length > 0 ? achievements : [{
            type: 'growth',
            category: '성장',
            title: '주간 발행',
            description: '매주 목요일 새로운 정보를 전달합니다.',
            date: getTodayDate(),
            value: '',
            milestone: '정기 발행'
        }],
        stats: stats
    };
}

// 오늘 날짜 가져오기
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 폼 제출
document.getElementById('edition-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('edition-date').value;
    const title = document.getElementById('edition-title').value;
    const content = document.getElementById('content-editor').value;
    
    if (!date || !title || !content) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 텍스트 파싱
    const parsed = parseContent(content, title);
    
    // 이미지 수집
    const images = [];
    for (let i = 1; i <= 3; i++) {
        const filename = document.getElementById(`image-${i}-filename`).value;
        if (filename) {
            images.push({
                filename: filename,
                alt: title,
                caption: ''
            });
        }
    }
    
    // 날짜 포맷팅
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[dateObj.getDay()];
    const formattedDate = `${year}년 ${month}월 ${day}일 ${weekday}`;
    
    // 발행물 데이터 생성
    const editionData = {
        id: date,
        date: formattedDate,
        volume: `VOL. ${year}-${month}`,
        title: title,
        headline: parsed.headline,
        subHeadline: parsed.subHeadline,
        content: {
            main: parsed.mainContent,
            features: []
        },
        stats: parsed.stats,
        updates: parsed.updates,
        achievements: parsed.achievements,
        images: images
    };
    
    // 파일 생성 및 다운로드
    try {
        await generateEditionFile(editionData);
        showSuccessMessage(editionData, images);
    } catch (error) {
        alert('오류가 발생했습니다: ' + error.message);
        console.error(error);
    }
});

// editions-data.js 파일 생성
async function generateEditionFile(newEdition) {
    // 기존 데이터 로드 시도 (실패해도 계속 진행)
    let existingData = { editions: [] };
    
    try {
        // 로컬 스토리지에서 기존 데이터 확인
        const saved = localStorage.getItem('editions-backup');
        if (saved) {
            existingData = JSON.parse(saved);
        }
    } catch (e) {
        console.log('기존 데이터 로드 실패, 새로 시작합니다.');
    }
    
    // 새 발행분을 맨 앞에 추가
    existingData.editions.unshift(newEdition);
    
    // 로컬 스토리지에 백업 저장
    localStorage.setItem('editions-backup', JSON.stringify(existingData));
    
    // JavaScript 파일 내용 생성
    const fileContent = `// 발행 이력 데이터 (CORS 문제 해결을 위해 JavaScript 파일로 변환)
const EDITIONS_DATA = ${JSON.stringify(existingData, null, 2)};

`;
    
    // 파일 다운로드
    downloadFile(fileContent, 'editions-data.js');
    
    // 클립보드에 복사
    await copyToClipboard(fileContent);
    
    return fileContent;
}

// 파일 다운로드
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 클립보드에 복사
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('클립보드에 복사되었습니다.');
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
    }
}

// 성공 메시지
function showSuccessMessage(editionData, images) {
    const messageDiv = document.getElementById('success-message');
    const detailsDiv = document.getElementById('success-details');
    
    let imageInstructions = '';
    if (images && images.length > 0) {
        imageInstructions = '<div style="margin-top: 15px; padding: 15px; background: #e8f4f8; border-radius: 6px;"><strong>📸 이미지 파일 복사 안내:</strong><ol style="margin-top: 10px; margin-left: 20px;">';
        images.forEach((img, idx) => {
            imageInstructions += `<li><code>${img.filename}</code> 파일을 <code>assets/images/</code> 폴더에 복사하세요</li>`;
        });
        imageInstructions += '</ol></div>';
    }
    
    detailsDiv.innerHTML = `
        <p><strong>다음 단계를 따라주세요:</strong></p>
        <ol>
            <li><strong>파일 다운로드:</strong> <code>editions-data.js</code> 파일이 자동으로 다운로드되었습니다.</li>
            <li><strong>파일 교체:</strong> 다운로드된 파일을 <code>js/editions-data.js</code>로 교체하세요.</li>
            <li><strong>이미지 복사:</strong> 아래 안내에 따라 이미지 파일을 복사하세요.</li>
            <li><strong>확인:</strong> 브라우저를 새로고침하여 새 발행물을 확인하세요.</li>
        </ol>
        ${imageInstructions}
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
            <strong>💡 파싱 결과:</strong>
            <ul style="margin-top: 10px; margin-left: 20px;">
                <li>제목: ${editionData.title}</li>
                <li>헤드라인: ${editionData.headline}</li>
                <li>업데이트: ${editionData.updates.length}개</li>
                <li>업적: ${editionData.achievements.length}개</li>
                <li>이미지: ${images.length}개</li>
            </ul>
        </div>
    `;
    
    messageDiv.style.display = 'flex';
}

function closeSuccessMessage() {
    document.getElementById('success-message').style.display = 'none';
    // 폼 초기화
    document.getElementById('edition-form').reset();
    // 이미지 미리보기 초기화
    document.querySelectorAll('.image-preview-simple').forEach(preview => {
        preview.innerHTML = `
            <div class="image-placeholder-simple">
                <span class="placeholder-icon">📷</span>
                <span class="placeholder-text">이미지 선택</span>
            </div>
        `;
    });
    document.querySelectorAll('.image-filename-input').forEach(input => {
        input.value = '';
    });
}

// 미리보기
function previewParsed() {
    const title = document.getElementById('edition-title').value;
    const content = document.getElementById('content-editor').value;
    
    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }
    
    const parsed = parseContent(content, title);
    const previewDiv = document.getElementById('parsed-preview');
    const panel = document.getElementById('preview-panel');
    
    previewDiv.innerHTML = JSON.stringify(parsed, null, 2);
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
}

// 페이지 로드 시 인증 확인
checkAuth();

// 성공 메시지 닫기 함수를 전역으로
window.closeSuccessMessage = closeSuccessMessage;
