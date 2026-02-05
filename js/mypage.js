// 마이페이지 로직
(function() {
    // 로그인 여부 (구독자 로그인)
    function isLoggedIn() {
        return localStorage.getItem('nexo-logged-in') === 'true';
    }

    // 구독 상태 확인
    function isSubscribed() {
        return localStorage.getItem('nexo-subscribed') === 'true';
    }
    
    // 구독자 정보 가져오기
    function getMemberInfo() {
        const info = {
            name: localStorage.getItem('nexo-member-name') || '',
            email: localStorage.getItem('nexo-member-email') || '',
            academy: localStorage.getItem('nexo-member-academy') || '',
            phone: localStorage.getItem('nexo-member-phone') || '',
            referrer: localStorage.getItem('nexo-member-referrer') || '',
            joined: localStorage.getItem('nexo-member-joined') || new Date().toLocaleDateString('ko-KR')
        };
        return info;
    }
    
    // 다운로드 이력 가져오기
    function getDownloadHistory() {
        const history = localStorage.getItem('nexo-download-history');
        return history ? JSON.parse(history) : [];
    }
    
    // 비로그인 시 로그인 페이지로. Render API 또는 Supabase 사용 시 세션·프로필 동기화 후 진행
    function ensureLoggedIn() {
        return new Promise(function(resolve) {
            var token = localStorage.getItem('nexo-auth-token');
            if (window.__USE_RENDER_API__) {
                if (!token) {
                    window.location.href = 'login.html?returnUrl=mypage.html';
                    return;
                }
                fetch('/.netlify/functions/member-auth', { headers: { 'Authorization': 'Bearer ' + token } })
                    .then(function(r) { return r.json(); })
                    .then(function(prof) {
                        if (prof && prof.email) {
                            localStorage.setItem('nexo-logged-in', 'true');
                            localStorage.setItem('nexo-subscribed', 'true');
                            localStorage.setItem('nexo-member-email', prof.email || '');
                            localStorage.setItem('nexo-member-name', prof.name || '');
                            localStorage.setItem('nexo-member-academy', prof.academy_name || '');
                            localStorage.setItem('nexo-member-phone', prof.phone || '');
                            localStorage.setItem('nexo-member-referrer', prof.referrer_code || '');
                            if (prof.created_at) localStorage.setItem('nexo-member-joined', new Date(prof.created_at).toLocaleDateString('ko-KR'));
                            resolve();
                        } else {
                            window.location.href = 'login.html?returnUrl=mypage.html';
                        }
                    })
                    .catch(function() {
                        window.location.href = 'login.html?returnUrl=mypage.html';
                    });
                return;
            }
            if (isLoggedIn()) {
                var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
                if (supabase) {
                    supabase.auth.getSession().then(function(r) {
                        if (r.data.session) {
                            var u = r.data.session.user;
                            localStorage.setItem('nexo-member-email', u.email || '');
                            localStorage.setItem('nexo-member-name', u.user_metadata?.name || '');
                            supabase.from('member_profiles').select('*').eq('id', u.id).single().then(function(prof) {
                                if (prof.data) {
                                    localStorage.setItem('nexo-member-academy', prof.data.academy_name || '');
                                    localStorage.setItem('nexo-member-phone', prof.data.phone || '');
                                    localStorage.setItem('nexo-member-referrer', prof.data.referrer_code || '');
                                    if (prof.data.created_at) {
                                        var d = new Date(prof.data.created_at);
                                        localStorage.setItem('nexo-member-joined', d.toLocaleDateString('ko-KR'));
                                    }
                                }
                                resolve();
                            }).catch(function() { resolve(); });
                        } else resolve();
                    }).catch(function() { resolve(); });
                } else resolve();
                return;
            }
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (supabase) {
                supabase.auth.getSession().then(function(r) {
                    if (!r.data.session) {
                        window.location.href = 'login.html?returnUrl=mypage.html';
                        return;
                    }
                    var u = r.data.session.user;
                    localStorage.setItem('nexo-logged-in', 'true');
                    localStorage.setItem('nexo-subscribed', 'true');
                    localStorage.setItem('nexo-member-email', u.email || '');
                    localStorage.setItem('nexo-member-name', u.user_metadata?.name || '');
                    supabase.from('member_profiles').select('*').eq('id', u.id).single().then(function(prof) {
                        if (prof.data) {
                            localStorage.setItem('nexo-member-academy', prof.data.academy_name || '');
                            localStorage.setItem('nexo-member-phone', prof.data.phone || '');
                            localStorage.setItem('nexo-member-referrer', prof.data.referrer_code || '');
                            if (prof.data.created_at) {
                                var d = new Date(prof.data.created_at);
                                localStorage.setItem('nexo-member-joined', d.toLocaleDateString('ko-KR'));
                            }
                        }
                        resolve();
                    }).catch(function() { resolve(); });
                }).catch(function() {
                    window.location.href = 'login.html?returnUrl=mypage.html';
                });
            } else {
                window.location.href = 'login.html?returnUrl=mypage.html';
            }
        });
    }

    // 마이페이지 제목: 가입 시 기록한 이름으로 표시
    function setMypageTitle() {
        const titleEl = document.getElementById('mypage-title');
        if (!titleEl) return;
        const name = localStorage.getItem('nexo-member-name') || '';
        titleEl.textContent = name ? '👤 ' + name + '님 마이페이지' : '👤 마이페이지';
    }

    // 구독 상태 표시
    function displaySubscriptionStatus() {
        const statusText = document.getElementById('subscription-status-text');
        if (!statusText) return;
        
        if (isSubscribed()) {
            statusText.textContent = '✅ 활성화됨';
            statusText.classList.add('active');
            statusText.classList.remove('inactive');
        } else {
            statusText.textContent = '❌ 구독하지 않음';
            statusText.classList.add('inactive');
            statusText.classList.remove('active');
            
            // 구독하지 않은 경우 안내
            const statusCard = document.querySelector('.status-card');
            if (statusCard) {
                statusCard.innerHTML = `
                    <div class="status-icon">⚠️</div>
                    <div class="status-content">
                        <h2>구독이 필요합니다</h2>
                        <p class="status-text inactive">구독하시면 유료급 고급 자료를 무료로 다운로드하실 수 있습니다.</p>
                        <a href="login.html?returnUrl=mypage.html" class="btn-primary" style="display: inline-block; margin-top: 15px; padding: 10px 20px;">로그인 / 구독하러 가기</a>
                    </div>
                `;
            }
        }
    }
    
    // 구독자 정보 표시 (편집 폼에 값 채우기)
    function displayMemberInfo() {
        if (!isSubscribed()) {
            const memberInfo = document.getElementById('member-info');
            if (memberInfo) {
                memberInfo.style.display = 'none';
            }
            return;
        }
        
        const info = getMemberInfo();
        const memberInfo = document.getElementById('member-info');
        if (memberInfo) {
            memberInfo.style.display = 'block';
        }
        
        const nameInput = document.getElementById('edit-name');
        const emailInput = document.getElementById('edit-email');
        const academyInput = document.getElementById('edit-academy');
        const phoneInput = document.getElementById('edit-phone');
        const referrerInput = document.getElementById('edit-referrer');
        const joinedEl = document.getElementById('member-joined');
        
        if (nameInput) nameInput.value = info.name || '';
        if (emailInput) emailInput.value = info.email || '';
        if (academyInput) academyInput.value = info.academy || '';
        if (phoneInput) phoneInput.value = info.phone || '';
        if (referrerInput) referrerInput.value = info.referrer || '';
        if (joinedEl) joinedEl.textContent = info.joined || new Date().toLocaleDateString('ko-KR');
    }

    // 구독자 정보 저장 (폼 제출)
    function setupMemberInfoForm() {
        const form = document.getElementById('member-info-form');
        if (!form) return;
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            var name = (document.getElementById('edit-name') && document.getElementById('edit-name').value) ? document.getElementById('edit-name').value.trim() : '';
            var email = (document.getElementById('edit-email') && document.getElementById('edit-email').value) ? document.getElementById('edit-email').value.trim() : '';
            var academy = (document.getElementById('edit-academy') && document.getElementById('edit-academy').value) ? document.getElementById('edit-academy').value.trim() : '';
            var phone = (document.getElementById('edit-phone') && document.getElementById('edit-phone').value) ? document.getElementById('edit-phone').value.trim() : '';
            var referrer = (document.getElementById('edit-referrer') && document.getElementById('edit-referrer').value) ? document.getElementById('edit-referrer').value.trim() : '';
            if (!name || !email) {
                alert('이름과 이메일은 필수입니다.');
                return;
            }
            if (window.__USE_RENDER_API__ && localStorage.getItem('nexo-auth-token')) {
                var apiRes = await fetch('/.netlify/functions/member-auth', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('nexo-auth-token')
                    },
                    body: JSON.stringify({ name: name, email: email, academy_name: academy, phone: phone, referrer_code: referrer })
                });
                var apiData = await apiRes.json();
                if (!apiRes.ok) {
                    alert(apiData.error || '저장 실패');
                    return;
                }
            }
            var supabase = typeof getSupabase === 'function' ? getSupabase() : null;
            if (supabase) {
                var sessionRes = await supabase.auth.getSession();
                var uid = sessionRes.data.session && sessionRes.data.session.user ? sessionRes.data.session.user.id : null;
                if (uid) {
                    var up = await supabase.from('member_profiles').update({
                        name: name,
                        email: email,
                        academy_name: academy,
                        phone: phone,
                        referrer_code: referrer,
                        updated_at: new Date().toISOString()
                    }).eq('id', uid);
                    if (up.error) {
                        alert('저장 실패: ' + (up.error.message || '오류가 발생했습니다.'));
                        return;
                    }
                }
            }
            localStorage.setItem('nexo-member-name', name);
            localStorage.setItem('nexo-member-email', email);
            localStorage.setItem('nexo-member-academy', academy);
            localStorage.setItem('nexo-member-phone', phone);
            localStorage.setItem('nexo-member-referrer', referrer);
            alert('저장되었습니다.');
        });
    }

    // 로그아웃 버튼 (세션만 종료)
    function setupMypageLogout() {
        const btn = document.getElementById('mypage-logout-btn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            localStorage.removeItem('nexo-auth-token');
            localStorage.removeItem('nexo-logged-in');
            localStorage.removeItem('nexo-login-remember');
            alert('로그아웃되었습니다.');
            window.location.href = 'index.html';
        });
    }
    
    // 다운로드 이력 표시
    function displayDownloadHistory() {
        const history = getDownloadHistory();
        const downloadList = document.getElementById('download-list');
        if (!downloadList) return;
        
        if (history.length === 0) {
            downloadList.innerHTML = '<p class="empty-state">아직 다운로드한 자료가 없습니다.</p>';
            return;
        }
        
        downloadList.innerHTML = history.map(item => `
            <div class="download-item">
                <span class="download-item-name">${escapeHtml(item.name)}</span>
                <span class="download-item-date">${item.date}</span>
            </div>
        `).join('');
    }
    
    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 구독 취소 (회원 정보까지 삭제)
    function setupUnsubscribe() {
        const logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) return;
        logoutBtn.addEventListener('click', function() {
            if (confirm('구독을 취소하시겠습니까?\n\n구독을 취소하시면 구독자 전용 자료를 다운로드할 수 없습니다.')) {
                localStorage.removeItem('nexo-logged-in');
                localStorage.removeItem('nexo-login-remember');
                localStorage.removeItem('nexo-subscribed');
                localStorage.removeItem('nexo-member-name');
                localStorage.removeItem('nexo-member-email');
                localStorage.removeItem('nexo-member-academy');
                localStorage.removeItem('nexo-member-phone');
                localStorage.removeItem('nexo-member-referrer');
                localStorage.removeItem('nexo-member-joined');
                localStorage.removeItem('nexo-member-password');
                alert('구독이 취소되었습니다.');
                window.location.href = 'index.html';
            }
        });
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        ensureLoggedIn().then(function() {
            setMypageTitle();
            displaySubscriptionStatus();
            displayMemberInfo();
            displayDownloadHistory();
            setupMemberInfoForm();
            setupMypageLogout();
            setupUnsubscribe();
        });
    });
})();


