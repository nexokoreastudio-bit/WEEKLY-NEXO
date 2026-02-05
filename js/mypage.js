// 마이페이지 로직
(function() {
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
                        <a href="index.html" class="btn-primary" style="display: inline-block; margin-top: 15px; padding: 10px 20px;">구독하러 가기</a>
                    </div>
                `;
            }
        }
    }
    
    // 구독자 정보 표시
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
        
        // 정보 표시
        const nameEl = document.getElementById('member-name');
        const emailEl = document.getElementById('member-email');
        const academyEl = document.getElementById('member-academy');
        const phoneEl = document.getElementById('member-phone');
        const referrerEl = document.getElementById('member-referrer');
        const joinedEl = document.getElementById('member-joined');
        
        if (nameEl) nameEl.textContent = info.name || '미입력';
        if (emailEl) emailEl.textContent = info.email || '미입력';
        if (academyEl) academyEl.textContent = info.academy || '미입력';
        if (phoneEl) phoneEl.textContent = info.phone || '미입력';
        if (referrerEl) referrerEl.textContent = info.referrer || '없음';
        if (joinedEl) joinedEl.textContent = info.joined || new Date().toLocaleDateString('ko-KR');
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
    
    // 구독 취소
    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) return;
        
        logoutBtn.addEventListener('click', function() {
            if (confirm('구독을 취소하시겠습니까?\n\n구독을 취소하시면 구독자 전용 자료를 다운로드할 수 없습니다.')) {
                // localStorage 초기화
                localStorage.removeItem('nexo-subscribed');
                localStorage.removeItem('nexo-member-name');
                localStorage.removeItem('nexo-member-email');
                localStorage.removeItem('nexo-member-academy');
                localStorage.removeItem('nexo-member-phone');
                localStorage.removeItem('nexo-member-referrer');
                localStorage.removeItem('nexo-member-joined');
                
                alert('구독이 취소되었습니다.');
                window.location.href = 'index.html';
            }
        });
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        displaySubscriptionStatus();
        displayMemberInfo();
        displayDownloadHistory();
        setupLogout();
    });
})();


