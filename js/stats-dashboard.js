// 유입 경로 통계 대시보드
(function() {
    // Google Sheets에서 데이터 가져오기 (Netlify Function 사용)
    async function fetchStatsData() {
        const loadingEl = document.getElementById('stats-loading');
        const errorEl = document.getElementById('stats-error');
        const contentEl = document.getElementById('stats-content');
        
        // 로딩 표시
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'none';
        
        try {
            // Netlify Function 호출 (향후 구현)
            // 현재는 Function이 없으므로 바로 샘플 데이터 표시
            // Function이 구현되면 아래 주석을 해제하고 사용
            /*
            const response = await fetch('/.netlify/functions/get-stats', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                displayStats(data);
            } else {
                displaySampleStats();
            }
            */
            
            // 현재는 샘플 데이터만 표시
            displaySampleStats();
        } catch (error) {
            console.warn('통계 데이터를 불러올 수 없습니다. 샘플 데이터를 표시합니다.', error);
            displaySampleStats();
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }
    
    // 샘플 데이터 표시 (개발/테스트용)
    function displaySampleStats() {
        const sampleData = {
            totalOrders: 25,
            totalReferrals: 18,
            uniqueReferrers: 8,
            referrers: [
                { code: 'STAFF-홍길동', count: 5, lastOrder: '2026-02-05' },
                { code: 'STAFF-김철수', count: 4, lastOrder: '2026-02-04' },
                { code: 'PARTNER-넥소대리점', count: 3, lastOrder: '2026-02-03' },
                { code: 'STAFF-이영희', count: 2, lastOrder: '2026-02-02' },
                { code: 'MEMBER-추천회원', count: 2, lastOrder: '2026-02-01' },
                { code: 'STAFF-박민수', count: 1, lastOrder: '2026-01-30' },
                { code: 'PARTNER-교육기관', count: 1, lastOrder: '2026-01-29' }
            ]
        };
        displayStats(sampleData);
    }
    
    // 통계 데이터 표시
    function displayStats(data) {
        const errorEl = document.getElementById('stats-error');
        const contentEl = document.getElementById('stats-content');
        
        if (errorEl) errorEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';
        
        // 요약 통계
        const totalOrdersEl = document.getElementById('total-orders');
        const totalReferralsEl = document.getElementById('total-referrals');
        const uniqueReferrersEl = document.getElementById('unique-referrers');
        
        if (totalOrdersEl) totalOrdersEl.textContent = data.totalOrders || 0;
        if (totalReferralsEl) totalReferralsEl.textContent = data.totalReferrals || 0;
        if (uniqueReferrersEl) uniqueReferrersEl.textContent = data.uniqueReferrers || 0;
        
        // 유입 경로별 통계 테이블
        const tbody = document.getElementById('referrer-stats-tbody');
        if (tbody && data.referrers) {
            tbody.innerHTML = data.referrers.map(ref => {
                const date = ref.lastOrder ? new Date(ref.lastOrder).toLocaleDateString('ko-KR') : '-';
                return `
                    <tr>
                        <td><strong>${escapeHtml(ref.code)}</strong></td>
                        <td>${ref.count}건</td>
                        <td>${date}</td>
                    </tr>
                `;
            }).join('');
            
            // 데이터가 없을 때
            if (data.referrers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999; padding: 40px;">아직 유입 경로 데이터가 없습니다.</td></tr>';
            }
        }
    }
    
    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', fetchStatsData);
        }
        
        // 탭이 활성화될 때 자동으로 데이터 로드
        const statsTab = document.querySelector('.admin-tab[data-tab="stats"]');
        if (statsTab) {
            statsTab.addEventListener('click', function() {
                setTimeout(() => {
                    const statsContent = document.getElementById('tab-stats');
                    if (statsContent && !statsContent.hidden && statsContent.style.display !== 'none') {
                        fetchStatsData();
                    }
                }, 100);
            });
        }
    });
})();

