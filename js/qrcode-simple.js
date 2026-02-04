// 간단한 QR 코드 생성기 (Canvas 기반)
// QRCode 라이브러리가 없을 때 사용할 수 있는 대체 방법
(function() {
    // QR 코드 라이브러리 로드 확인
    if (typeof QRCode !== 'undefined') {
        console.log('QR 코드 라이브러리 사용 가능');
        return;
    }
    
    // 간단한 QR 코드 생성 (외부 라이브러리 없이)
    // 참고: 실제 QR 코드 생성은 복잡하므로 라이브러리 사용 권장
    window.SimpleQRCode = {
        generate: function(canvas, text) {
            if (typeof QRCode !== 'undefined') {
                // 라이브러리가 있으면 사용
                QRCode.toCanvas(canvas, text, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#001F3F',
                        light: '#FFFFFF'
                    }
                });
                return;
            }
            
            // 라이브러리가 없으면 안내 메시지
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 300, 300);
            
            ctx.fillStyle = '#001F3F';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR 코드 라이브러리를', 150, 120);
            ctx.fillText('로드할 수 없습니다', 150, 150);
            ctx.fillText('파일을 다운로드해주세요', 150, 180);
            
            // 다운로드 링크 표시
            const link = document.createElement('a');
            link.href = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
            link.textContent = '라이브러리 다운로드';
            link.style.display = 'block';
            link.style.marginTop = '10px';
            link.style.textAlign = 'center';
        }
    };
})();

