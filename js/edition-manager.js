// 발행일 관리 및 콘텐츠 로드 시스템
class EditionManager {
    constructor() {
        this.editions = [];
        this.currentEdition = null;
        this.currentIndex = -1;
        /** 관리자 미리보기 모드: URL에 ?preview=1 이 있으면 발행 전 호도 선택·본문 확인 가능 */
        this.previewMode = false;
    }

    /** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 기준) */
    getTodayDateString() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /** 발행일이 지났는지 여부 (id가 YYYY-MM-DD일 때, 오늘 >= 발행일이면 공개) */
    isPublished(edition) {
        if (!edition || !edition.id) return false;
        const today = this.getTodayDateString();
        return today >= edition.id;
    }

    async init() {
        try {
            // 발행 이력 데이터 로드 (CORS 문제 해결을 위해 JavaScript 파일 사용)
            let data;
            if (typeof EDITIONS_DATA !== 'undefined') {
                // JavaScript 파일에서 직접 로드
                data = EDITIONS_DATA;
            } else {
                // JSON 파일에서 로드 시도 (웹 서버 환경)
                try {
                    const response = await fetch('data/editions.json?v=' + Date.now());
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    data = await response.json();
                } catch (fetchError) {
                    console.warn('JSON 파일 로드 실패, 인라인 데이터 사용:', fetchError);
                    // 인라인 데이터로 폴백 (필요시)
                    throw new Error('발행 이력 데이터를 로드할 수 없습니다.');
                }
            }
            
            console.log('로드된 발행분 데이터:', data);
            this.editions = data.editions.sort((a, b) => b.id.localeCompare(a.id)); // 최신순 정렬
            console.log('정렬된 발행분:', this.editions.map(e => e.id));
            
            // 발행일 선택 드롭다운 채우기
            this.populateEditionSelector();
            
            // URL 파라미터에서 발행분·미리보기 확인
            const urlParams = new URLSearchParams(window.location.search);
            const editionParam = urlParams.get('edition');
            this.previewMode = urlParams.get('preview') === '1' || urlParams.get('preview') === 'true';
            
            // 최신 호 또는 URL 파라미터의 호 로드
            if (this.editions.length > 0) {
                if (editionParam && this.editions.find(e => e.id === editionParam)) {
                    this.loadEdition(editionParam);
                } else {
                    // 발행일이 지난 것 중 최신 호 로드 (미리 만든 호는 발행일이 되면 자동 오픈)
                    const latestPublished = this.editions.find(e => this.isPublished(e));
                    if (latestPublished) {
                        this.loadEdition(latestPublished.id);
                    } else {
                        this.loadEdition(this.editions[0].id);
                    }
                }
            }
            
            // 네비게이션 버튼 이벤트
            this.setupNavigation();
            
            // 브라우저 뒤로가기/앞으로가기 지원
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.edition) {
                    this.loadEdition(e.state.edition, false); // URL 업데이트 없이 로드
                }
            });
        } catch (error) {
            console.error('발행 이력 로드 실패:', error);
            this.showError('발행 이력을 불러올 수 없습니다.');
        }
    }

    populateEditionSelector() {
        const selector = document.getElementById('edition-select');
        if (!selector) return;

        // 기존 옵션 제거 (최신호 보기 제외)
        selector.innerHTML = '<option value="">최신호 보기</option>';

        // 발행일이 지난 호만 선택 목록에 표시 (미리보기 모드면 전체 호 표시)
        const listEditions = this.previewMode ? this.editions : this.editions.filter(e => this.isPublished(e));
        console.log(this.previewMode ? '미리보기 모드: 전체 발행분' : '공개된 발행분 개수:', listEditions.length, '/ 전체:', this.editions.length);
        listEditions.forEach(edition => {
            const option = document.createElement('option');
            option.value = edition.id;
            const notYet = !this.isPublished(edition);
            if (edition.status === 'preparing' || edition.title === '발행물 준비중') {
                option.textContent = `${edition.date} - 🔜 발행물 준비중${notYet ? ' (미리보기)' : ''}`;
            } else {
                const titlePart = `${edition.date} - ${(edition.title || '').substring(0, 28)}${(edition.title && edition.title.length > 28) ? '...' : ''}`;
                option.textContent = notYet ? titlePart + ' 📅 미리보기' : titlePart;
            }
            selector.appendChild(option);
        });

        // 선택 이벤트
        selector.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadEdition(e.target.value);
            } else {
                const latestPublished = this.editions.find(ed => this.isPublished(ed));
                if (latestPublished) {
                    this.loadEdition(latestPublished.id);
                } else if (this.editions.length > 0) {
                    this.loadEdition(this.editions[0].id);
                }
            }
        });
    }

    loadEdition(editionId, updateURL = true) {
        const edition = this.editions.find(e => e.id === editionId);
        if (!edition) {
            console.error('발행분을 찾을 수 없습니다:', editionId);
            return;
        }

        this.currentEdition = edition;
        this.currentIndex = this.editions.findIndex(e => e.id === editionId);

        // 발행일이 아직 안 된 호(미리 만든 호) → 미리보기 모드가 아니면 발행 예정 메시지만 표시
        if (!this.isPublished(edition)) {
            if (this.previewMode) {
                this.showPreviewBanner(edition);
                // 아래 본문·업데이트 등은 그대로 진행
            } else {
                this.showNotYetPublishedMessage(edition);
                return;
            }
        } else {
            this.hidePreviewBanner();
        }

        // 준비중 발행물 체크
        if (edition.status === 'preparing' || edition.title === '발행물 준비중') {
            this.showPreparingMessage(edition);
            return;
        }

        // UI 업데이트
        this.updateHeader(edition);
        this.updateHeadline(edition);
        this.updateContent(edition);
        this.updateImages(edition);
        this.updateUpdates(edition);
        this.updateAchievements(edition);
        this.updateNavigation();

        // URL 업데이트 (히스토리 관리, 미리보기 모드 유지)
        if (updateURL) {
            const url = new URL(window.location);
            url.searchParams.set('edition', editionId);
            if (this.previewMode) url.searchParams.set('preview', '1');
            window.history.pushState({ edition: editionId }, '', url);
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeader(edition) {
        const dateElement = document.getElementById('current-date');
        const volumeElement = document.getElementById('current-volume');
        const selector = document.getElementById('edition-select');

        if (dateElement) {
            // 날짜 형식을 "2026.01.28 THURSDAY" 형식으로 변환
            const date = new Date(edition.id);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const weekday = weekdays[date.getDay()];
            dateElement.textContent = `${year}.${month}.${day} ${weekday}`;
        }
        if (volumeElement) {
            // VOL 형식 유지 또는 변환
            volumeElement.textContent = edition.volume || `VOL. ${edition.id}`;
        }
        if (selector) selector.value = edition.id;
    }

    updateHeadline(edition) {
        const headlineElement = document.getElementById('main-headline');
        const subHeadlineElement = document.getElementById('sub-headline');
        
        if (headlineElement) {
            headlineElement.textContent = edition.headline;
        }
        
        if (subHeadlineElement && edition.subHeadline) {
            subHeadlineElement.textContent = edition.subHeadline;
        }
    }

    updateContent(edition) {
        const descElement = document.getElementById('hero-desc');
        if (descElement && edition.content && edition.content.main) {
            // HTML이 포함되어 있으면 innerHTML 사용, 아니면 textContent 사용
            const content = edition.content.main;
            if (content.includes('<') && content.includes('>')) {
                descElement.innerHTML = content;
            } else {
                // 줄바꿈을 <br>로 변환
                descElement.innerHTML = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
            }
        }
    }

    updateImages(edition) {
        // Hero 이미지 업데이트 (첫 번째 이미지가 있으면 사용)
        const heroImage = document.getElementById('hero-image');
        const heroCaption = document.getElementById('hero-caption');
        const imagesContainer = document.getElementById('edition-images-container');
        
        if (edition.images && edition.images.length > 0) {
            // Hero 이미지 업데이트 (첫 번째 이미지)
            const firstImage = edition.images[0];
            if (heroImage) {
                heroImage.src = firstImage.src || `assets/images/${firstImage.filename || firstImage}`;
                heroImage.alt = firstImage.alt || firstImage.caption || 'NEXO Smart Display';
            }
            if (heroCaption && firstImage.caption) {
                heroCaption.textContent = `▲ ${firstImage.caption}`;
            }
            
            // 나머지 이미지들 (최대 2개)을 features 섹션에 표시
            if (imagesContainer) {
                const remainingImages = edition.images.slice(1, 3); // 최대 2개 더
                if (remainingImages.length > 0) {
                    imagesContainer.innerHTML = remainingImages.map(img => {
                        const imgSrc = img.src || `assets/images/${img.filename || img}`;
                        const imgAlt = img.alt || img.caption || 'NEXO Feature';
                        const imgCaption = img.caption || '';
                        return `
                            <div class="feature-image-section">
                                <img src="${imgSrc}" alt="${imgAlt}" class="feature-image">
                                ${imgCaption ? `<div class="image-caption">${imgCaption}</div>` : ''}
                            </div>
                        `;
                    }).join('');
                } else {
                    imagesContainer.innerHTML = '';
                }
            }
        } else {
            // 기본 이미지 사용 (이미지가 없을 경우)
            if (heroImage) {
                heroImage.src = 'assets/images/2.png';
                heroImage.alt = 'NEXO Smart Display';
            }
            if (heroCaption) {
                heroCaption.textContent = '▲ NEXO Smart Display';
            }
            if (imagesContainer) {
                imagesContainer.innerHTML = '';
            }
        }
    }

    updateUpdates(edition) {
        const updatesGrid = document.getElementById('updates-grid');
        const updatesCount = document.getElementById('updates-count');
        
        if (!updatesGrid) return;

        if (!edition.updates || edition.updates.length === 0) {
            updatesGrid.innerHTML = '<p class="no-updates">이번 호에는 새로운 업데이트가 없습니다.</p>';
            if (updatesCount) updatesCount.textContent = '0';
            return;
        }

        if (updatesCount) updatesCount.textContent = edition.updates.length;

        updatesGrid.innerHTML = edition.updates.map(update => `
            <div class="update-card">
                <div class="update-header">
                    <span class="update-category ${this.getCategoryClass(update.category)}">${update.category}</span>
                    <span class="update-version">${update.version}</span>
                </div>
                <p class="update-description">${update.description}</p>
                <span class="update-date">${this.formatUpdateDate(update.date)}</span>
            </div>
        `).join('');
    }

    updateAchievements(edition) {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        // 업적 데이터가 있으면 표시, 없으면 기본 통계 표시
        if (edition.achievements && edition.achievements.length > 0) {
            achievementsGrid.innerHTML = edition.achievements.map((achievement, index) => `
                <div class="achievement-card">
                    <span class="achievement-badge">${achievement.category || '업적'}</span>
                    <div class="achievement-icon">${this.getAchievementIcon(achievement.type)}</div>
                    <h4 class="achievement-title">${achievement.title}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    ${achievement.value ? `<div class="achievement-value">${achievement.value}</div>` : ''}
                    <div class="achievement-meta">
                        <span class="achievement-date">${this.formatUpdateDate(achievement.date || edition.id)}</span>
                        ${achievement.milestone ? `<span class="achievement-category">${achievement.milestone}</span>` : ''}
                    </div>
                </div>
            `).join('');
        } else if (edition.stats) {
            // 기존 통계 데이터를 업적 형태로 표시
            achievementsGrid.innerHTML = `
                <div class="achievement-card">
                    <span class="achievement-badge">성과</span>
                    <div class="achievement-icon">🏢</div>
                    <h4 class="achievement-title">누적 설치 대수 달성</h4>
                    <p class="achievement-description">전국 교육기관 및 기업에 넥소 전자칠판이 설치되어 스마트 교육 환경을 구축하고 있습니다.</p>
                    <div class="achievement-value">${edition.stats.totalInstallations || 0}대</div>
                    <div class="achievement-meta">
                        <span class="achievement-date">${this.formatUpdateDate(edition.id)}</span>
                    </div>
                </div>
                <div class="achievement-card">
                    <span class="achievement-badge">성과</span>
                    <div class="achievement-icon">👥</div>
                    <h4 class="achievement-title">활성 사용자 확보</h4>
                    <p class="achievement-description">매일 넥소 전자칠판을 활용하는 활성 사용자가 지속적으로 증가하고 있습니다.</p>
                    <div class="achievement-value">${this.formatNumber(edition.stats.activeUsers || 0)}명</div>
                    <div class="achievement-meta">
                        <span class="achievement-date">${this.formatUpdateDate(edition.id)}</span>
                    </div>
                </div>
                <div class="achievement-card">
                    <span class="achievement-badge">혁신</span>
                    <div class="achievement-icon">📝</div>
                    <h4 class="achievement-title">컨텐츠 업데이트</h4>
                    <p class="achievement-description">사용자 피드백을 반영한 지속적인 소프트웨어 및 컨텐츠 업데이트를 통해 최적의 사용자 경험을 제공합니다.</p>
                    <div class="achievement-value">${edition.stats.contentUpdates || 0}회</div>
                    <div class="achievement-meta">
                        <span class="achievement-date">${this.formatUpdateDate(edition.id)}</span>
                    </div>
                </div>
            `;
        } else {
            achievementsGrid.innerHTML = '<p class="no-updates">이번 호에는 업적 정보가 없습니다.</p>';
        }
    }

    getAchievementIcon(type) {
        const icons = {
            'product': '🚀',
            'partnership': '🤝',
            'award': '🏆',
            'milestone': '🎯',
            'innovation': '💡',
            'growth': '📈',
            'default': '⭐'
        };
        return icons[type] || icons['default'];
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-edition');
        const nextBtn = document.getElementById('next-edition');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex >= this.editions.length - 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentIndex <= 0;
        }
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prev-edition');
        const nextBtn = document.getElementById('next-edition');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentIndex < this.editions.length - 1) {
                    this.loadEdition(this.editions[this.currentIndex + 1].id);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    this.loadEdition(this.editions[this.currentIndex - 1].id);
                }
            });
        }
    }

    getCategoryClass(category) {
        const classes = {
            '소프트웨어': 'category-software',
            '하드웨어': 'category-hardware',
            '컨텐츠': 'category-content',
            '서비스': 'category-service'
        };
        return classes[category] || 'category-default';
    }

    formatUpdateDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /** 관리자 미리보기 배너 표시 (발행 전 호 본문 위에 노출) */
    showPreviewBanner(edition) {
        let el = document.getElementById('admin-preview-banner');
        if (!el) {
            el = document.createElement('div');
            el.id = 'admin-preview-banner';
            el.setAttribute('role', 'status');
            const main = document.querySelector('main');
            if (main) main.insertBefore(el, main.firstChild);
        }
        el.textContent = `관리자 미리보기 · ${edition.date}에 공개 예정`;
        el.className = 'admin-preview-banner';
        el.style.cssText = 'display:block; background:#1a365d; color:#fff; text-align:center; padding:10px 16px; font-size:14px; font-family:\'Noto Sans KR\',sans-serif;';
    }

    /** 관리자 미리보기 배너 숨김 */
    hidePreviewBanner() {
        const el = document.getElementById('admin-preview-banner');
        if (el) el.style.display = 'none';
    }

    /** 발행일이 되기 전 호(미리 만든 호) 안내 메시지 */
    showNotYetPublishedMessage(edition) {
        this.updateHeader(edition);
        const headlineElement = document.getElementById('main-headline');
        const subHeadlineElement = document.getElementById('sub-headline');
        const descElement = document.getElementById('hero-desc');
        if (headlineElement) headlineElement.textContent = '📅 발행 예정';
        if (subHeadlineElement) subHeadlineElement.textContent = `${edition.date}에 공개됩니다`;
        if (descElement) {
            descElement.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📅</div>
                    <h3 style="font-size: 24px; color: var(--nexo-navy); margin-bottom: 15px; font-family: 'Noto Serif KR', serif;">
                        ${edition.date} 발행 예정
                    </h3>
                    <p style="font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 30px;">
                        이 발행물은 <strong>${edition.date}</strong>에 공개됩니다.<br>
                        매주 목요일 새로운 전자신문이 발행됩니다.
                    </p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; display: inline-block;">
                        <p style="margin: 0; font-size: 14px; color: #888;">
                            💡 발행일이 되면 자동으로 열립니다. 다른 호를 선택해 보세요.
                        </p>
                    </div>
                </div>
            `;
        }
        const updatesSection = document.getElementById('updates-section');
        const achievementsSection = document.getElementById('achievements-section');
        if (updatesSection) updatesSection.style.display = 'none';
        if (achievementsSection) achievementsSection.style.display = 'none';
        const heroImage = document.getElementById('hero-image-container');
        if (heroImage) heroImage.style.display = 'none';
        this.updateNavigation();
        const url = new URL(window.location);
        url.searchParams.set('edition', edition.id);
        window.history.pushState({ edition: edition.id }, '', url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showPreparingMessage(edition) {
        // 헤더 업데이트
        this.updateHeader(edition);
        
        // 준비중 메시지 표시
        const headlineElement = document.getElementById('main-headline');
        const subHeadlineElement = document.getElementById('sub-headline');
        const descElement = document.getElementById('hero-desc');
        
        if (headlineElement) {
            headlineElement.textContent = '🔜 발행물 준비중';
        }
        
        if (subHeadlineElement) {
            subHeadlineElement.textContent = `${edition.date} 발행물을 준비하고 있습니다`;
        }
        
        if (descElement) {
            descElement.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📝</div>
                    <h3 style="font-size: 24px; color: var(--nexo-navy); margin-bottom: 15px; font-family: 'Noto Serif KR', serif;">
                        ${edition.date} 발행물 준비중
                    </h3>
                    <p style="font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 30px;">
                        곧 만나보실 수 있습니다.<br>
                        매주 목요일 새로운 정보와 콘텐츠를 업데이트합니다.
                    </p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; display: inline-block;">
                        <p style="margin: 0; font-size: 14px; color: #888;">
                            💡 발행 준비가 완료되면 자동으로 업데이트됩니다
                        </p>
                    </div>
                </div>
            `;
        }
        
        // 업데이트 및 업적 섹션 숨기기
        const updatesSection = document.getElementById('updates-section');
        const achievementsSection = document.getElementById('achievements-section');
        if (updatesSection) updatesSection.style.display = 'none';
        if (achievementsSection) achievementsSection.style.display = 'none';
        
        // 이미지 숨기기
        const heroImage = document.getElementById('hero-image-container');
        if (heroImage) heroImage.style.display = 'none';
        
        // 네비게이션 업데이트
        this.updateNavigation();
        
        // URL 업데이트
        const url = new URL(window.location);
        url.searchParams.set('edition', edition.id);
        window.history.pushState({ edition: edition.id }, '', url);
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(message) {
        const updatesGrid = document.getElementById('updates-grid');
        if (updatesGrid) {
            updatesGrid.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }
}

// 전역 인스턴스 생성 및 초기화
let editionManagerInstance;

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        editionManagerInstance = new EditionManager();
        editionManagerInstance.init();
    });
} else {
    editionManagerInstance = new EditionManager();
    editionManagerInstance.init();
}

// 전역 접근을 위한 변수
window.EditionManager = EditionManager;
