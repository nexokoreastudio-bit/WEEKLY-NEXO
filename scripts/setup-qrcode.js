// QR 코드 라이브러리 설정 스크립트
// npm install 후 실행: node scripts/setup-qrcode.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.join(__dirname, '../js/qrcode.min.js');
const qrcodeLibPath = path.join(__dirname, '../node_modules/qrcode');

// 방법 1: build 폴더 확인
const buildFile = path.join(qrcodeLibPath, 'build/qrcode.min.js');
if (fs.existsSync(buildFile)) {
    fs.copyFileSync(buildFile, targetFile);
    console.log('✅ QR 코드 라이브러리가 js/qrcode.min.js로 복사되었습니다.');
    process.exit(0);
}

// 방법 2: browserify로 번들 생성 시도
console.log('📦 build 폴더를 찾을 수 없습니다. browserify로 번들 생성 시도...');

try {
    // browserify 설치 확인
    const browserifyPath = path.join(__dirname, '../node_modules/.bin/browserify');
    if (!fs.existsSync(browserifyPath)) {
        console.log('💡 browserify를 설치하는 중...');
        execSync('npm install --save-dev browserify', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    
    // browserify로 번들 생성
    const browserFile = path.join(qrcodeLibPath, 'lib/browser.js');
    if (fs.existsSync(browserFile)) {
        console.log('📦 browserify로 브라우저 번들 생성 중...');
        execSync(`${browserifyPath} ${browserFile} -o ${targetFile}`, { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        console.log('✅ QR 코드 라이브러리가 js/qrcode.min.js로 생성되었습니다.');
        process.exit(0);
    }
} catch (error) {
    console.warn('⚠️ browserify 번들 생성 실패:', error.message);
}

// 방법 3: 수동 다운로드 안내
console.error('❌ QR 코드 라이브러리를 자동으로 설정할 수 없습니다.');
console.log('\n💡 수동 설정 방법:');
console.log('1. 브라우저에서 다음 URL을 열어주세요:');
console.log('   https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
console.log('2. 페이지 내용을 복사하여 js/qrcode.min.js 파일로 저장하세요.');
console.log('3. 또는 다음 명령어로 다운로드하세요:');
console.log('   curl -L -o js/qrcode.min.js https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
process.exit(1);

