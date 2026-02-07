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
        function openLoginModal() {
            if (modal) {
                modal.hidden = false;
                document.body.style.overflow = 'hidden';
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) setTimeout(() => firstInput.focus(), 100);
            }
        }
        // 로그인 버튼이 링크(login.html)가 아닐 때만 모달 열기 (예: 인라인 로그인 유도 시)
        if (openButton && openButton.tagName !== 'A') {
            openButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openLoginModal();
            });
        }
        const openFromSection = document.getElementById('member-login-open-from-section');
        if (openFromSection) {
            openFromSection.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openLoginModal();
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
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var identifier = (document.getElementById('login-identifier').value || '').trim().toLowerCase();
            var password = (document.getElementById('login-password').value || '').trim();
            var remember = document.getElementById('login-remember').checked;
            if (!identifier || !password) {
                alert('이메일/연락처와 비밀번호를 모두 입력해주세요.');
                return;
            }
            if (window.__USE_RENDER_API__) {
                try {
                    var apiRes = await fetch('/.netlify/functions/member-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'login', email: identifier, password: password })
                    });
                    var apiData = await apiRes.json();
                    if (!apiRes.ok) {
                        alert(apiData.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
                        return;
                    }
                    if (apiData.token) localStorage.setItem('nexo-auth-token', apiData.token);
                    if (apiData.user) {
                        localStorage.setItem('nexo-member-email', apiData.user.email || '');
                        localStorage.setItem('nexo-member-name', apiData.user.name || '회원');
                        localStorage.setItem('nexo-member-academy', apiData.user.academy_name || '');
                        localStorage.setItem('nexo-member-phone', apiData.user.phone || '');
                        localStorage.setItem('nexo-member-referrer', apiData.user.referrer_code || '');
                        if (apiData.user.created_at) localStorage.setItem('nexo-member-joined', new Date(apiData.user.created_at).toLocaleDateString('ko-KR'));
                    }
                    localStorage.setItem('nexo-logged-in', 'true');
                    if (remember) localStorage.setItem('nexo-login-remember', 'true');
                    localStorage.setItem('nexo-subscribed', 'true');
                    var modal = document.getElementById('member-login-modal');
                    if (modal) modal.hidden = true;
                    document.body.style.overflow = '';
                    if (window.updateUserWidget) window.updateUserWidget();
                    if (window.updateSubscriberUI) window.updateSubscriberUI();
                    if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                    else alert('로그인되었습니다!');
                } catch (err) { alert('로그인 중 오류가 발생했습니다.'); }
                return;
            }
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (supabase) {
                var signRes = await supabase.auth.signInWithPassword({ email: identifier, password: password });
                if (signRes.error) {
                    alert(signRes.error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
                    return;
                }
                var user = signRes.data.user;
                localStorage.setItem('nexo-logged-in', 'true');
                if (remember) localStorage.setItem('nexo-login-remember', 'true');
                localStorage.setItem('nexo-subscribed', 'true');
                localStorage.setItem('nexo-member-email', user.email || '');
                localStorage.setItem('nexo-member-name', user.user_metadata?.name || '회원');
                var modal = document.getElementById('member-login-modal');
                if (modal) modal.hidden = true;
                document.body.style.overflow = '';
                if (window.updateUserWidget) window.updateUserWidget();
                if (window.updateSubscriberUI) window.updateSubscriberUI();
                if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                else alert('로그인되었습니다!');
                return;
            }
            var storedEmail = (localStorage.getItem('nexo-member-email') || '').trim().toLowerCase();
            var storedPhone = (localStorage.getItem('nexo-member-phone') || '').trim();
            var storedPassword = (localStorage.getItem('nexo-member-password') || '').trim();
            var isEmailMatch = identifier === storedEmail;
            var isPhoneMatch = identifier === storedPhone;
            if ((isEmailMatch || isPhoneMatch) && password === storedPassword) {
                localStorage.setItem('nexo-logged-in', 'true');
                if (remember) localStorage.setItem('nexo-login-remember', 'true');
                localStorage.setItem('nexo-subscribed', 'true');
                var modal = document.getElementById('member-login-modal');
                if (modal) modal.hidden = true;
                document.body.style.overflow = '';
                if (window.updateSubscriberUI) window.updateSubscriberUI();
                if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                else alert('로그인되었습니다!');
            } else {
                alert('이메일/연락처 또는 비밀번호가 올바르지 않습니다.');
            }
        });
    }
    
    // 네이버 스타일 사용자 위젯: 로그인 시 프로필 카드, 비로그인 시 로그인 버튼
    function updateUserWidget() {
        const guestEl = document.getElementById('user-widget-guest');
        const loggedEl = document.getElementById('user-widget-logged');
        const prominentAuth = document.getElementById('member-auth-prominent');
        var isLoggedIn = localStorage.getItem('nexo-logged-in') === 'true';
        if (window.__USE_RENDER_API__ && localStorage.getItem('nexo-auth-token')) isLoggedIn = true;
        
        if (guestEl) guestEl.style.display = isLoggedIn ? 'none' : 'flex';
        if (loggedEl) loggedEl.style.display = isLoggedIn ? 'flex' : 'none';
        if (prominentAuth) prominentAuth.style.display = isLoggedIn ? 'none' : 'block';
        // 상단 유틸 바: 로그인 시 마이페이지만, 비로그인 시 로그인 링크 표시
        var utilityMypage = document.getElementById('utility-mypage-link');
        var utilityLogin = document.getElementById('utility-login-link');
        if (utilityMypage) utilityMypage.style.display = isLoggedIn ? 'inline-flex' : 'none';
        if (utilityLogin) utilityLogin.style.display = isLoggedIn ? 'none' : 'inline-flex';
        
        if (isLoggedIn) {
            const nameEl = document.getElementById('user-widget-name');
            const emailEl = document.getElementById('user-widget-email');
            if (nameEl) nameEl.textContent = (localStorage.getItem('nexo-member-name') || '회원') + '님';
            if (emailEl) emailEl.textContent = localStorage.getItem('nexo-member-email') || '';
        }
    }
    
    // 메인 상단 인라인 로그인 폼 (처음 방문자 노출)
    function setupInlineLoginForm() {
        const form = document.getElementById('inline-login-form');
        if (!form) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var identifier = (document.getElementById('inline-login-identifier') || {}).value.trim().toLowerCase();
            var password = (document.getElementById('inline-login-password') || {}).value.trim();
            if (!identifier || !password) {
                alert('이메일/연락처와 비밀번호를 입력해주세요.');
                return;
            }
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (window.__USE_RENDER_API__) {
                try {
                    var apiRes = await fetch('/.netlify/functions/member-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'login', email: identifier, password: password })
                    });
                    var apiData = await apiRes.json();
                    if (!apiRes.ok) { alert(apiData.error || '이메일 또는 비밀번호가 올바르지 않습니다.'); return; }
                    if (apiData.token) localStorage.setItem('nexo-auth-token', apiData.token);
                    if (apiData.user) {
                        localStorage.setItem('nexo-member-email', apiData.user.email || '');
                        localStorage.setItem('nexo-member-name', apiData.user.name || '회원');
                        localStorage.setItem('nexo-member-academy', apiData.user.academy_name || '');
                        localStorage.setItem('nexo-member-phone', apiData.user.phone || '');
                        localStorage.setItem('nexo-member-referrer', apiData.user.referrer_code || '');
                        if (apiData.user.created_at) localStorage.setItem('nexo-member-joined', new Date(apiData.user.created_at).toLocaleDateString('ko-KR'));
                    }
                    localStorage.setItem('nexo-logged-in', 'true');
                    localStorage.setItem('nexo-subscribed', 'true');
                    if (window.updateUserWidget) window.updateUserWidget();
                    if (window.updateSubscriberUI) window.updateSubscriberUI();
                    if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                    else alert('로그인되었습니다!');
                } catch (err) { alert('로그인 중 오류가 발생했습니다.'); }
                return;
            }
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (supabase) {
                var signRes = await supabase.auth.signInWithPassword({ email: identifier, password: password });
                if (signRes.error) {
                    alert(signRes.error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
                    return;
                }
                var user = signRes.data.user;
                localStorage.setItem('nexo-logged-in', 'true');
                localStorage.setItem('nexo-subscribed', 'true');
                localStorage.setItem('nexo-member-email', user.email || '');
                localStorage.setItem('nexo-member-name', user.user_metadata?.name || '회원');
                if (window.updateUserWidget) window.updateUserWidget();
                if (window.updateSubscriberUI) window.updateSubscriberUI();
                if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                else alert('로그인되었습니다!');
                return;
            }
            var storedEmail = (localStorage.getItem('nexo-member-email') || '').trim().toLowerCase();
            var storedPhone = (localStorage.getItem('nexo-member-phone') || '').trim();
            var storedPassword = (localStorage.getItem('nexo-member-password') || '').trim();
            var ok = (identifier === storedEmail || identifier === storedPhone) && password === storedPassword;
            if (ok) {
                localStorage.setItem('nexo-logged-in', 'true');
                localStorage.setItem('nexo-subscribed', 'true');
                if (window.updateUserWidget) window.updateUserWidget();
                if (window.updateSubscriberUI) window.updateSubscriberUI();
                if (typeof window.showToastNotification === 'function') window.showToastNotification('로그인되었습니다! 🎉');
                else alert('로그인되었습니다!');
            } else {
                alert('이메일/연락처 또는 비밀번호가 올바르지 않습니다.');
            }
        });
    }
    
    function setupLogout() {
        const logoutBtn = document.getElementById('user-widget-logout');
        if (!logoutBtn) return;
        logoutBtn.addEventListener('click', async function() {
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (supabase) await supabase.auth.signOut();
            localStorage.removeItem('nexo-auth-token');
            localStorage.removeItem('nexo-logged-in');
            localStorage.removeItem('nexo-login-remember');
            updateUserWidget();
            if (window.updateSubscriberUI) window.updateSubscriberUI();
            if (typeof window.showToastNotification === 'function') window.showToastNotification('로그아웃되었습니다.');
            else alert('로그아웃되었습니다.');
        });
    }
    
    // Supabase 또는 Render API 세션 있으면 localStorage 동기화 후 위젯 갱신
    function syncSupabaseSession() {
        if (window.__USE_RENDER_API__ && localStorage.getItem('nexo-auth-token')) {
            fetch('/.netlify/functions/member-auth', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nexo-auth-token') } })
                .then(function(r) { return r.json(); })
                .then(function(prof) {
                    if (prof && prof.email) {
                        localStorage.setItem('nexo-logged-in', 'true');
                        localStorage.setItem('nexo-subscribed', 'true');
                        localStorage.setItem('nexo-member-email', prof.email || '');
                        localStorage.setItem('nexo-member-name', prof.name || '회원');
                    }
                })
                .catch(function() { })
                .finally(function() { updateUserWidget(); });
            return;
        }
        var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
        if (!supabase) {
            updateUserWidget();
            return;
        }
        supabase.auth.getSession().then(function(_ref) {
            var data = _ref.data;
            if (data.session && data.session.user) {
                var u = data.session.user;
                localStorage.setItem('nexo-logged-in', 'true');
                localStorage.setItem('nexo-subscribed', 'true');
                localStorage.setItem('nexo-member-email', u.email || '');
                localStorage.setItem('nexo-member-name', u.user_metadata?.name || '회원');
            }
        }).finally(function() {
            updateUserWidget();
        });
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        setupLoginModal();
        setupFindIdModal();
        setupFindPasswordModal();
        setupSignupLink();
        setupLoginForm();
        setupInlineLoginForm();
        setupLogout();
        syncSupabaseSession();
    });
    
    // 전역 함수 (하위 호환 + 위젯 갱신)
    window.updateLoginButton = updateUserWidget;
    window.updateUserWidget = updateUserWidget;
})();

