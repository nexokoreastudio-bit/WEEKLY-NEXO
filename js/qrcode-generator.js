// QR 코드 생성 도구
(function() {
    // 탭 전환 기능
    document.addEventListener('DOMContentLoaded', function() {
        const tabs = document.querySelectorAll('.admin-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // 탭 활성화
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 콘텐츠 표시
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                    targetContent.classList.add('active');
                }
            });
        });
    });
    
    // QR 코드 생성
    document.addEventListener('DOMContentLoaded', function() {
        const generateBtn = document.getElementById('generate-qrcode-btn');
        const ownerNameInput = document.getElementById('qrcode-owner-name');
        const ownerTypeInput = document.getElementById('qrcode-owner-type');
        const codeInput = document.getElementById('qrcode-code');
        const resultDiv = document.getElementById('qrcode-result');
        const canvas = document.getElementById('qrcode-canvas');
        const downloadBtn = document.getElementById('download-qrcode-btn');
        const copyUrlBtn = document.getElementById('copy-url-btn');
        
        if (!generateBtn) return;
        
        generateBtn.addEventListener('click', function() {
            const ownerName = ownerNameInput.value.trim();
            const ownerType = ownerTypeInput.value;
            
            if (!ownerName || !ownerType) {
                alert('소유자 이름과 유형을 입력해주세요.');
                return;
            }
            
            // QR 코드 생성 함수
            function generateQRCode() {
                // 고유 코드 생성
                let code = codeInput.value.trim();
                if (!code) {
                    // 자동 생성: OWNER-TYPE-이름 형식
                    const typeMap = {
                        'staff': 'STAFF',
                        'partner': 'PARTNER',
                        'member': 'MEMBER'
                    };
                    const typePrefix = typeMap[ownerType] || 'CODE';
                    const nameSlug = ownerName.replace(/\s+/g, '-').toUpperCase();
                    code = `${typePrefix}-${nameSlug}`;
                }
                
                // URL 생성 (유입 경로 파라미터 포함)
                const baseUrl = window.location.origin;
                const qrUrl = `${baseUrl}/index.html?ref=${encodeURIComponent(code)}`;
                
                // QR 코드 생성 (온라인 API 사용)
                if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
                    // 라이브러리가 있으면 사용
                    QRCode.toCanvas(canvas, qrUrl, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#001F3F',
                            light: '#FFFFFF'
                        }
                    }, function(error) {
                        if (error) {
                            console.error('QR 코드 생성 오류:', error);
                            generateQRCodeWithAPI(canvas, qrUrl, code, ownerName);
                        } else {
                            showQRCodeResult(code, ownerName, qrUrl);
                        }
                    });
                } else {
                    // 라이브러리가 없으면 온라인 API 사용
                    generateQRCodeWithAPI(canvas, qrUrl, code, ownerName);
                }
            }
            
            // 온라인 API로 QR 코드 생성
            function generateQRCodeWithAPI(canvas, qrUrl, code, ownerName) {
                const size = 300;
                const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrUrl)}&color=001F3F&bgcolor=FFFFFF&margin=2`;
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    const ctx = canvas.getContext('2d');
                    canvas.width = size;
                    canvas.height = size;
                    ctx.drawImage(img, 0, 0);
                    showQRCodeResult(code, ownerName, qrUrl);
                };
                img.onerror = function() {
                    console.error('QR 코드 API 오류');
                    alert('QR 코드 생성에 실패했습니다. 인터넷 연결을 확인해주세요.');
                };
                img.src = apiUrl;
            }
            
            // 결과 표시
            function showQRCodeResult(code, ownerName, qrUrl) {
                document.getElementById('qrcode-result-code').textContent = code;
                document.getElementById('qrcode-result-owner').textContent = ownerName;
                document.getElementById('qrcode-result-url').textContent = qrUrl;
                resultDiv.style.display = 'block';
                
                // URL을 data 속성에 저장 (복사용)
                if (copyUrlBtn) copyUrlBtn.dataset.url = qrUrl;
            }
            
            // QR 코드 생성 (온라인 API 우선 사용)
            // 라이브러리가 있으면 사용, 없으면 온라인 API 사용
            if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
                // 라이브러리가 있으면 사용
                generateQRCode();
            } else {
                // 라이브러리가 없으면 바로 온라인 API 사용 (대기 없음)
                generateQRCode();
            }
        });
        
        // 이미지 다운로드
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                const code = document.getElementById('qrcode-result-code').textContent;
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qrcode-${code}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
            });
        }
        
        // URL 복사
        if (copyUrlBtn) {
            copyUrlBtn.addEventListener('click', function() {
                const url = this.dataset.url;
                if (!url) return;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function() {
                        alert('URL이 클립보드에 복사되었습니다!');
                    }).catch(function(err) {
                        console.error('복사 실패:', err);
                        fallbackCopy(url);
                    });
                } else {
                    fallbackCopy(url);
                }
            });
        }
        
        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('URL이 클립보드에 복사되었습니다!');
            } catch (err) {
                alert('복사에 실패했습니다. 수동으로 복사해주세요:\n' + text);
            }
            document.body.removeChild(textArea);
        }
    });
    
    // URL 파라미터에서 유입 경로 읽기 (index.html에서 사용)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            // 주문 폼의 유입 경로 필드에 자동 입력
            document.addEventListener('DOMContentLoaded', function() {
                const referrerInput = document.getElementById('referrer_code');
                if (referrerInput) {
                    referrerInput.value = decodeURIComponent(refCode);
                }
            });
        }
    }
})();

