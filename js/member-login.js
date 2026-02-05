// 구독자 로그인 기능
(function() {
    // 로그인 모달 열기/닫기
    function setupLoginModal() {
        const modal = document.getElementById('member-login-modal');
        if (!modal) return;
        
        const openButton = document.getElementById('member-login-open');
        const closeButton = document.getElementById('login-modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        // 모달 열기
        if (openButton) {
            openButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (modal) {
                    modal.hidden = false;
                    document.body.style.overflow = 'hidden';
                    // 첫 번째 입력 필드에 포커스
                    const firstInput = modal.querySelector('input[type="text"]');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }
            });
        }
        
        // 모달 닫기
        function closeLoginModal() {
            if (modal) {
                modal.hidden = true;
                document.body.style.overflow = '';
            }
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', closeLoginModal);
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', closeLoginModal);
        }
        
        // ESC 키로 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.hidden) {
                closeLoginModal();
            }
        });
        
        // 모달 박스 클릭 시 이벤트 전파 방지
        const modalBox = modal.querySelector('.modal-box');
        if (modalBox) {
            modalBox.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // 아이디 찾기 모달
    function setupFindIdModal() {
        const modal = document.getElementById('find-id-modal');
        if (!modal) return;
        
        const openLink = document.getElementById('find-id-link');
        const closeButton = document.getElementById('find-id-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        const backLink = document.getElementById('back-to-login-from-find-id');
        const form = document.getElementById('find-id-form');
        const resultDiv = document.getElementById('find-id-result');
        
        function openFindIdModal() {
            const loginModal = document.getElementById('member-login-modal');
            if (loginModal) loginModal.hidden = true;
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
        
        function closeFindIdModal() {
            modal.hidden = true;
            document.body.style.overflow = '';
            if (resultDiv) resultDiv.style.display = 'none';
            if (form) form.reset();
        }
        
        if (openLink) {
            openLink.addEventListener('click', function(e) {
                e.preventDefault();
                openFindIdModal();
            });
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', closeFindIdModal);
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', closeFindIdModal);
        }
        
        if (backLink) {
            backLink.addEventListener('click', function(e) {
                e.preventDefault();
                closeFindIdModal();
                const loginModal = document.getElementById('member-login-modal');
                if (loginModal) {
                    loginModal.hidden = false;
                }
            });
        }
        
        // 아이디 찾기 폼 제출
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('find-id-name').value.trim();
                const phone = document.getElementById('find-id-phone').value.trim();
                
                if (!name || !phone) {
                    alert('이름과 연락처를 모두 입력해주세요.');
                    return;
                }
                
                // localStorage에서 회원 정보 찾기
                const storedEmail = localStorage.getItem('nexo-member-email');
                const storedName = localStorage.getItem('nexo-member-name');
                const storedPhone = localStorage.getItem('nexo-member-phone');
                
                if (storedName === name && storedPhone === phone && storedEmail) {
                    // 결과 표시
                    const foundEmail = document.getElementById('found-email');
                    if (foundEmail) {
                        foundEmail.textContent = storedEmail;
                    }
                    if (resultDiv) {
                        resultDiv.style.display = 'block';
                    }
                } else {
                    alert('입력하신 정보와 일치하는 회원을 찾을 수 없습니다.\n다시 확인해주세요.');
                }
            });
        }
    }
    
    // 비밀번호 찾기 모달
    function setupFindPasswordModal() {
        const modal = document.getElementById('find-password-modal');
        if (!modal) return;
        
        const openLink = document.getElementById('find-password-link');
        const closeButton = document.getElementById('find-password-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        const backLink = document.getElementById('back-to-login-from-find-password');
        const form = document.getElementById('find-password-form');
        const resultDiv = document.getElementById('find-password-result');
        
        function openFindPasswordModal() {
            const loginModal = document.getElementById('member-login-modal');
            if (loginModal) loginModal.hidden = true;
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
        
        function closeFindPasswordModal() {
            modal.hidden = true;
            document.body.style.overflow = '';
            if (resultDiv) resultDiv.style.display = 'none';
            if (form) form.reset();
        }
        
        if (openLink) {
            openLink.addEventListener('click', function(e) {
                e.preventDefault();
                openFindPasswordModal();
            });
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', closeFindPasswordModal);
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', closeFindPasswordModal);
        }
        
        if (backLink) {
            backLink.addEventListener('click', function(e) {
                e.preventDefault();
                closeFindPasswordModal();
                const loginModal = document.getElementById('member-login-modal');
                if (loginModal) {
                    loginModal.hidden = false;
                }
            });
        }
        
        // 비밀번호 찾기 폼 제출
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const identifier = document.getElementById('find-password-identifier').value.trim();
                
                if (!identifier) {
                    alert('이메일 또는 연락처를 입력해주세요.');
                    return;
                }
                
                // localStorage에서 회원 정보 확인
                const storedEmail = localStorage.getItem('nexo-member-email');
                const storedPhone = localStorage.getItem('nexo-member-phone');
                
                if ((identifier === storedEmail || identifier === storedPhone) && storedEmail) {
                    // 결과 표시 (실제로는 이메일 발송)
                    if (resultDiv) {
                        resultDiv.style.display = 'block';
                    }
                    alert('비밀번호 재설정 링크를 ' + storedEmail + '로 보내드렸습니다.\n이메일을 확인해주세요.');
                } else {
                    alert('입력하신 정보와 일치하는 회원을 찾을 수 없습니다.\n다시 확인해주세요.');
                }
            });
        }
    }
    
    // 회원가입 링크
    function setupSignupLink() {
        const signupLink = document.getElementById('go-to-signup-link');
        if (!signupLink) return;
        
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 로그인 모달 닫기
            const loginModal = document.getElementById('member-login-modal');
            if (loginModal) loginModal.hidden = true;
            
            // 회원가입 모달 열기
            const signupModal = document.getElementById('member-signup-modal');
            if (signupModal) {
                signupModal.hidden = false;
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // 로그인 폼 제출
    function setupLoginForm() {
        const form = document.getElementById('member-login-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const identifier = document.getElementById('login-identifier').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const remember = document.getElementById('login-remember').checked;
            
            if (!identifier || !password) {
                alert('이메일/연락처와 비밀번호를 모두 입력해주세요.');
                return;
            }
            
            // localStorage에서 회원 정보 확인
            const storedEmail = localStorage.getItem('nexo-member-email');
            const storedPhone = localStorage.getItem('nexo-member-phone');
            const storedPassword = localStorage.getItem('nexo-member-password');
            
            // 이메일 또는 전화번호로 로그인 가능
            const isEmailMatch = identifier === storedEmail;
            const isPhoneMatch = identifier === storedPhone;
            
            if ((isEmailMatch || isPhoneMatch) && password === storedPassword) {
                // 로그인 성공
                localStorage.setItem('nexo-logged-in', 'true');
                if (remember) {
                    localStorage.setItem('nexo-login-remember', 'true');
                }
                
                // 구독 상태 활성화
                localStorage.setItem('nexo-subscribed', 'true');
                
                // 모달 닫기
                const modal = document.getElementById('member-login-modal');
                if (modal) modal.hidden = true;
                document.body.style.overflow = '';
                
                // UI 업데이트
                if (window.updateSubscriberUI) {
                    window.updateSubscriberUI();
                }
                
                // 토스트 알림
                if (window.showToastNotification) {
                    window.showToastNotification('로그인되었습니다! 🎉');
                } else {
                    alert('로그인되었습니다!');
                }
            } else {
                alert('이메일/연락처 또는 비밀번호가 올바르지 않습니다.');
            }
        });
    }
    
    // 로그인 버튼 표시/숨김 (구독하지 않은 경우에만 표시)
    function updateLoginButton() {
        const loginBtn = document.getElementById('member-login-open');
        if (!loginBtn) return;
        
        const isSubscribed = localStorage.getItem('nexo-subscribed') === 'true';
        const isLoggedIn = localStorage.getItem('nexo-logged-in') === 'true';
        
        // 구독하지 않았거나 로그인하지 않은 경우에만 표시
        if (!isSubscribed && !isLoggedIn) {
            loginBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'none';
        }
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        setupLoginModal();
        setupFindIdModal();
        setupFindPasswordModal();
        setupSignupLink();
        setupLoginForm();
        updateLoginButton();
    });
    
    // 전역 함수로 내보내기
    window.updateLoginButton = updateLoginButton;
})();

