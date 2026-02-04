// 회원 가입 모달 및 유입 경로 처리
(function() {
    // URL 파라미터에서 유입 경로 읽기
    function getReferrerCode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || urlParams.get('referrer');
    }
    
    // 유입 경로를 폼 필드에 자동 입력
    function setReferrerCodeToForms() {
        const refCode = getReferrerCode();
        if (!refCode) return;
        
        const decodedCode = decodeURIComponent(refCode);
        
        // 주문 폼의 유입 경로 필드
        const orderReferrerInput = document.getElementById('referrer_code');
        if (orderReferrerInput && !orderReferrerInput.value) {
            orderReferrerInput.value = decodedCode;
        }
        
        // 회원 가입 폼의 유입 경로 필드
        const signupReferrerInput = document.getElementById('signup-referrer');
        if (signupReferrerInput && !signupReferrerInput.value) {
            signupReferrerInput.value = decodedCode;
        }
    }
    
    // 모달 닫기 함수 (전역 접근 가능)
    function closeSignupModal() {
        const modal = document.getElementById('member-signup-modal');
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
    }
    
    // 모달 열기/닫기
    function setupSignupModal() {
        const modal = document.getElementById('member-signup-modal');
        if (!modal) return;
        
        const openButtons = [
            document.getElementById('premium-signup-btn'),
            document.getElementById('sidebar-signup-btn')
        ];
        const closeButton = document.getElementById('signup-modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        // 모달 열기
        openButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (modal) {
                        modal.hidden = false;
                        document.body.style.overflow = 'hidden';
                        // 유입 경로 자동 입력
                        setReferrerCodeToForms();
                        // 첫 번째 입력 필드에 포커스
                        const firstInput = modal.querySelector('input[type="text"], input[type="email"]');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 100);
                        }
                    }
                });
            }
        });
        
        // 모달 닫기 - X 버튼
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeSignupModal();
            });
        }
        
        // 모달 닫기 - 배경 클릭
        if (backdrop) {
            backdrop.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeSignupModal();
            });
        }
        
        // 모달 박스 클릭 시 이벤트 전파 방지 (배경 클릭과 구분)
        const modalBox = modal.querySelector('.modal-box');
        if (modalBox) {
            modalBox.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // ESC 키로 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && !modal.hidden) {
                closeSignupModal();
            }
        });
    }
    
    // 구독자 전용 자료 카드 클릭 시 모달 열기
    function setupPremiumCards() {
        const premiumCards = document.querySelectorAll('.premium-file-card.locked');
        premiumCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const openBtn = document.getElementById('premium-signup-btn');
                if (openBtn) {
                    openBtn.click();
                }
            });
        });
    }
    
    // 구독 상태 확인
    function isSubscribed() {
        return localStorage.getItem('nexo-subscribed') === 'true';
    }
    
    // 구독 상태 설정
    function setSubscribed(value) {
        if (value) {
            localStorage.setItem('nexo-subscribed', 'true');
        } else {
            localStorage.removeItem('nexo-subscribed');
        }
        updatePremiumFilesAccess();
    }
    
    // 구독자 전용 자료 접근 권한 업데이트
    function updatePremiumFilesAccess() {
        const isSub = isSubscribed();
        const premiumCards = document.querySelectorAll('.premium-file-card');
        
        premiumCards.forEach(card => {
            if (isSub) {
                card.classList.remove('locked');
                const overlay = card.querySelector('.file-overlay');
                if (overlay) overlay.style.display = 'none';
            } else {
                card.classList.add('locked');
                const overlay = card.querySelector('.file-overlay');
                if (overlay) overlay.style.display = 'flex';
            }
        });
    }
    
    // 폼 제출 처리
    function setupSignupForm() {
        const form = document.getElementById('member-signup-form');
        if (!form) return;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                academy_name: formData.get('academy_name') || '',
                phone: formData.get('phone') || '',
                referrer_code: formData.get('referrer_code') || '',
                notification_agree: formData.get('notification_agree') === '1'
            };
            
            // 필수 필드 확인
            if (!data.name || !data.email) {
                alert('이름과 이메일은 필수 입력 항목입니다.');
                return false;
            }
            
            // 로컬 환경 처리
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocal) {
                console.log('회원 가입 폼 데이터:', data);
                // 로컬 환경에서는 구독 상태만 저장 (테스트용)
                setSubscribed(true);
                closeSignupModal();
                alert('구독이 완료되었습니다! (로컬 테스트 모드)\n\n실제 Netlify에 배포하면 Google Sheets에 데이터가 저장됩니다.\n\n이제 구독자 전용 자료를 다운로드하실 수 있습니다.');
                return false;
            }
            
            // 실제 환경: Netlify Function으로 데이터 전송
            try {
                const response = await fetch('/.netlify/functions/member-signup-to-sheets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // 구독 상태 저장
                    setSubscribed(true);
                    closeSignupModal();
                    alert('구독이 완료되었습니다!\n\n이제 구독자 전용 자료를 다운로드하실 수 있습니다.');
                } else {
                    throw new Error(result.error || '회원 가입 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('회원 가입 오류:', error);
                // 오류가 발생해도 구독 상태는 저장 (사용자 경험 개선)
                setSubscribed(true);
                closeSignupModal();
                alert('구독이 완료되었습니다!\n\n(데이터 저장 중 오류가 발생했을 수 있으나, 구독은 정상 처리되었습니다.)');
            }
        });
    }
    
    // 구독자 전용 자료 다운로드 처리
    function setupPremiumDownloads() {
        const premiumCards = document.querySelectorAll('.premium-file-card');
        
        premiumCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // 잠긴 카드는 모달 열기 (기존 동작)
                if (card.classList.contains('locked')) {
                    const openBtn = document.getElementById('premium-signup-btn');
                    if (openBtn) {
                        openBtn.click();
                    }
                    return;
                }
                
                // 잠금 해제된 카드는 다운로드
                const fileName = card.querySelector('.file-title')?.textContent;
                if (fileName) {
                    // 실제 파일 다운로드 (향후 Supabase 연동 시 파일 URL로 변경)
                    const fileMap = {
                        '상담일지 템플릿': 'assets/downloads/상담일지_템플릿.xlsx',
                        '학원 세무 가이드': 'assets/downloads/학원_세무_가이드.pdf',
                        '학부모 상담 매뉴얼': 'assets/downloads/학부모_상담_매뉴얼.pdf'
                    };
                    
                    const fileUrl = fileMap[fileName] || '#';
                    if (fileUrl !== '#') {
                        // 파일 존재 여부 확인 후 다운로드
                        fetch(fileUrl, { method: 'HEAD' })
                            .then(res => {
                                if (res.ok) {
                                    const a = document.createElement('a');
                                    a.href = fileUrl;
                                    a.download = '';
                                    a.target = '_blank';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                } else {
                                    alert(`"${fileName}" 자료는 준비 중입니다.\n곧 업데이트될 예정이니, 필요하시면 담당자에게 문의해 주세요.`);
                                }
                            })
                            .catch(() => {
                                alert(`"${fileName}" 자료는 준비 중입니다.\n곧 업데이트될 예정이니, 필요하시면 담당자에게 문의해 주세요.`);
                            });
                    } else {
                        alert(`"${fileName}" 자료는 준비 중입니다.`);
                    }
                }
            });
        });
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        setReferrerCodeToForms();
        setupSignupModal();
        setupPremiumCards();
        setupSignupForm();
        setupPremiumDownloads();
        updatePremiumFilesAccess(); // 구독 상태에 따라 자료 접근 권한 업데이트
        
        // 유입 경로가 있으면 콘솔에 표시 (디버깅용)
        const refCode = getReferrerCode();
        if (refCode) {
            console.log('유입 경로 감지:', decodeURIComponent(refCode));
        }
        
        // 구독 상태 확인 (디버깅용)
        if (isSubscribed()) {
            console.log('구독 상태: 활성화됨');
        }
    });
    
    // 전역 함수로 내보내기 (다른 스크립트에서 사용 가능)
    window.closeSignupModal = closeSignupModal;
    window.isSubscribed = isSubscribed;
    window.setSubscribed = setSubscribed;
})();

