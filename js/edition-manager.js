// 발행일 관리 및 콘텐츠 로드 시스템
/** 관리자 미리보기용 비밀번호 (admin-editor와 동일하게 변경 가능) */
const ADMIN_PREVIEW_PASSWORD = 'nexo2026';

class EditionManager {
    constructor() {
        this.editions = [];
        this.currentEdition = null;
        this.currentIndex = -1;
        /** 관리자 미리보기 모드: URL ?preview=1 또는 관리자 로그인 시 발행 전 호 노출 */
        this.previewMode = false;
        /** 호별 목록 뷰 표시 여부 (리스트식 미리보기) */
        this.listViewActive = false;
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
            
            // URL 파라미터에서 발행분·미리보기 확인 (관리자 로그인 시에도 미리보기 적용)
            const urlParams = new URLSearchParams(window.location.search);
            const editionParam = urlParams.get('edition');
            this.previewMode = urlParams.get('preview') === '1' || urlParams.get('preview') === 'true' ||
                (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin-authenticated') === 'true');
            
            // 최신 호 또는 URL 파라미터의 호 로드 (본문 데이터 준비)
            if (this.editions.length > 0) {
                if (editionParam && this.editions.find(e => e.id === editionParam)) {
                    this.loadEdition(editionParam, true);
                } else {
                    // 홈 접속(edition 없음): 내부적으로만 최신호 로드, URL은 index 유지
                    const latestPublished = this.editions.find(e => this.isPublished(e));
                    const toLoad = latestPublished || this.editions[0];
                    this.loadEdition(toLoad.id, false);
                }
            }
            
            // 네비게이션 버튼 이벤트
            this.setupNavigation();
            
            // 호별 목록 토글 (리스트식 미리보기)
            this.setupEditionListToggle();
            
            // 로고 클릭 시 홈(목록 뷰)으로, URL을 index로 정리
            this.setupLogoHomeLink();
            
            // 관리자 로그인 (네이버 카페처럼 로그인 시 발행 예정 미리보기)
            this.setupAdminLogin();
            this.updateAdminAuthUI();
            
            // 처음 들어왔을 때는 호별 목록을 먼저 표시, URL을 edition 없이 유지
            this.showListView();
            if (!editionParam) this.replaceStateToHome();
            
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
        this.updateNavigation();
        // 리뉴얼: articles/tools 렌더링 및 섹션 표시 (RENEWAL_PLAN 3단계)
        if (edition.articles && edition.articles.length > 0) {
            this.renderArticles(edition);
            const articlesSection = document.getElementById('articles-section');
            if (articlesSection) articlesSection.style.display = 'block';
        } else {
            const gridEditor = document.getElementById('articles-grid-editor');
            const gridColumns = document.getElementById('articles-grid-columns');
            if (gridEditor) gridEditor.innerHTML = '';
            if (gridColumns) gridColumns.innerHTML = '';
            const groupEditor = document.getElementById('magazine-group-editor');
            const groupColumns = document.getElementById('magazine-group-columns');
            if (groupEditor) groupEditor.style.display = 'none';
            if (groupColumns) groupColumns.style.display = 'none';
            const articlesSection = document.getElementById('articles-section');
            if (articlesSection) articlesSection.style.display = 'none';
        }
        this.updateToolsSidebar(edition);

        // URL 업데이트 (히스토리 관리, 미리보기 모드 유지)
        if (updateURL) {
            const url = new URL(window.location);
            url.searchParams.set('edition', editionId);
            if (this.previewMode) url.searchParams.set('preview', '1');
            window.history.pushState({ edition: editionId }, '', url);
        }
        
        // 목록 뷰였다면 본문 뷰로 전환
        this.showEditionView();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /** URL을 홈(index)으로 정리 — edition 파라미터 제거 */
    replaceStateToHome() {
        const url = new URL(window.location);
        url.searchParams.delete('edition');
        const cleanSearch = url.searchParams.toString();
        const newUrl = url.pathname + (cleanSearch ? '?' + cleanSearch : '');
        window.history.replaceState({}, '', newUrl);
    }

    /** 리스트식 미리보기: 호별 목록 표시 (홈이면 URL을 index로 유지) */
    showListView() {
        this.listViewActive = true;
        const listView = document.getElementById('edition-list-view');
        const contentWrap = document.getElementById('edition-content-wrap');
        const toggleBtn = document.getElementById('edition-list-toggle');
        if (listView) listView.hidden = false;
        if (contentWrap) contentWrap.hidden = true;
        if (toggleBtn) {
            toggleBtn.textContent = '본문 보기';
            toggleBtn.setAttribute('title', '현재 호 본문으로 돌아가기');
        }
        this.renderEditionList();
        this.replaceStateToHome();
    }

    setupLogoHomeLink() {
        const logoLink = document.querySelector('.logo-home-link');
        if (!logoLink) return;
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showListView();
        });
    }

    /** 본문 뷰 표시 */
    showEditionView() {
        this.listViewActive = false;
        const listView = document.getElementById('edition-list-view');
        const contentWrap = document.getElementById('edition-content-wrap');
        const toggleBtn = document.getElementById('edition-list-toggle');
        if (listView) listView.hidden = true;
        if (contentWrap) contentWrap.hidden = false;
        if (toggleBtn) {
            toggleBtn.textContent = '📋 호별 목록';
            toggleBtn.setAttribute('title', '호별 목록으로 보기');
        }
    }

    setupEditionListToggle() {
        const toggleBtn = document.getElementById('edition-list-toggle');
        if (!toggleBtn) return;
        toggleBtn.addEventListener('click', () => {
            if (this.listViewActive) {
                this.showEditionView();
            } else {
                this.showListView();
            }
        });
    }

    /** 본문 HTML에서 텍스트만 추출 (요약용) */
    getExcerptFromContent(edition, maxLen = 100) {
        if (!edition || !edition.content || !edition.content.main) return '';
        const html = edition.content.main;
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
        return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
    }

    renderEditionList() {
        const container = document.getElementById('edition-list-container');
        if (!container) return;
        const listEditions = this.previewMode ? this.editions : this.editions.filter(e => this.isPublished(e));
        container.innerHTML = listEditions.map(edition => {
            const isPreparing = edition.status === 'preparing' || edition.title === '발행물 준비중';
            const notYet = !this.isPublished(edition);
            const thumbSrc = edition.images && edition.images[0]
                ? (edition.images[0].src || `assets/images/${edition.images[0].filename || edition.images[0]}`)
                : 'assets/images/2.png';
            const thumbAlt = edition.images && edition.images[0] ? (edition.images[0].alt || '') : 'NEXO Weekly';
            const category = edition.volume || `VOL. ${edition.id}`;
            const title = isPreparing ? '발행물 준비중' : (edition.headline || edition.title || edition.id);
            const excerpt = isPreparing ? '' : (edition.subHeadline || this.getExcerptFromContent(edition, 90));
            const dateLabel = edition.date || edition.id;
            const badge = notYet ? ' 📅 미리보기' : (isPreparing ? ' 🔜 준비중' : '');
            return `
                <article class="edition-list-card" data-edition-id="${edition.id}" role="button" tabindex="0">
                    <div class="edition-list-card-text">
                        <span class="edition-list-card-category">${category}${badge}</span>
                        <h3 class="edition-list-card-title">${title}</h3>
                        ${excerpt ? `<p class="edition-list-card-excerpt">${excerpt}</p>` : ''}
                        <span class="edition-list-card-meta">${dateLabel}</span>
                    </div>
                    <div class="edition-list-card-thumb">
                        <img src="${thumbSrc}" alt="${thumbAlt}" loading="lazy">
                    </div>
                </article>
            `;
        }).join('');
        container.querySelectorAll('.edition-list-card').forEach(card => {
            const id = card.getAttribute('data-edition-id');
            const open = () => this.loadEdition(id);
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        });
    }

    /** 관리자 로그인 시 미리보기 모드 갱신 (호별 목록·드롭다운에 발행 예정 노출) */
    refreshPreviewState() {
        this.previewMode = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin-authenticated') === 'true';
        this.populateEditionSelector();
        if (this.listViewActive) this.renderEditionList();
    }

    /** 관리자 로그인 UI (네이버 카페처럼 로그인 시 발행 예정 미리보기) */
    setupAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        const btnOpen = document.getElementById('admin-login-open');
        const btnLogout = document.getElementById('admin-logout');
        const inputPass = document.getElementById('admin-login-password');
        const btnConfirm = document.getElementById('admin-login-confirm');
        const btnCancel = document.getElementById('admin-login-cancel');
        if (!modal || !btnConfirm) return;

        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                modal.hidden = false;
                if (inputPass) { inputPass.value = ''; inputPass.focus(); }
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', () => { modal.hidden = true; });
        }
        const backdrop = modal.querySelector('.admin-login-modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => { modal.hidden = true; });
        }
        const tryLogin = () => {
            const pwd = inputPass ? inputPass.value.trim() : '';
            if (pwd === ADMIN_PREVIEW_PASSWORD) {
                if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('admin-authenticated', 'true');
                modal.hidden = true;
                this.refreshPreviewState();
                this.updateAdminAuthUI();
            } else {
                if (inputPass) inputPass.select();
                alert('비밀번호가 올바르지 않습니다.');
            }
        };
        btnConfirm.addEventListener('click', tryLogin);
        if (inputPass) {
            inputPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
        }
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('admin-authenticated');
                window.location.reload();
            });
        }
    }

    /** 관리자 로그인/로그아웃 버튼 표시 갱신 */
    updateAdminAuthUI() {
        const area = document.getElementById('admin-auth-area');
        const isAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin-authenticated') === 'true';
        if (!area) return;
        if (isAdmin) {
            area.innerHTML = '<span class="admin-badge">관리자 (미리보기)</span> <button type="button" id="admin-logout" class="admin-logout-btn">로그아웃</button>';
            const logoutBtn = document.getElementById('admin-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('admin-authenticated');
                    window.location.reload();
                });
            }
        } else {
            area.innerHTML = '<button type="button" id="admin-login-open" class="admin-login-btn">관리자 로그인</button>';
            const openBtn = document.getElementById('admin-login-open');
            if (openBtn && document.getElementById('admin-login-modal')) {
                openBtn.addEventListener('click', () => {
                    document.getElementById('admin-login-modal').hidden = false;
                    const inputPass = document.getElementById('admin-login-password');
                    if (inputPass) { inputPass.value = ''; inputPass.focus(); }
                });
            }
        }
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
        const leadElement = document.getElementById('lead-text');
        
        if (headlineElement) {
            headlineElement.textContent = edition.headline;
        }
        
        if (subHeadlineElement && edition.subHeadline) {
            subHeadlineElement.textContent = edition.subHeadline;
        }
        
        if (leadElement) {
            leadElement.textContent = edition.leadText || '압도적인 4K UHD 화질과 AI 기술의 결합';
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

    /** 쌤 도구함 영역 갱신 — 발행 예정/준비중일 때도 호출해 도구가 보이도록 함 */
    updateToolsSidebar(edition) {
        const toolsSidebar = document.getElementById('tools-sidebar');
        const toolsContainer = document.getElementById('tools-container');
        if (!toolsSidebar) return;
        toolsSidebar.style.display = 'block';
        if (toolsContainer) {
            if (edition.tools && edition.tools.length > 0) {
                this.renderTools(edition);
            } else {
                toolsContainer.innerHTML = '<p class="tools-empty-hint">이번 호에는 사용할 수 있는 도구가 없습니다.</p>';
            }
        }
    }

    /** 리뉴얼: 매거진(넥소 에디터 / 칼럼 구분, 가로 배열) 렌더링 */
    renderArticles(edition) {
        if (!edition.articles || edition.articles.length === 0) return;
        const escape = (s) => {
            if (s == null) return '';
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        };
        const isEditorArticle = (art) => {
            const a = (art.author || '').trim();
            return a === '넥소 에디터' || a === '넥소 마케팅';
        };
        const editorArticles = edition.articles.filter(isEditorArticle);
        const columnArticles = edition.articles.filter((art) => !isEditorArticle(art));

        const renderCard = (art) => {
            const typeClass = (art.type === 'column' || art.type === 'news') ? `article-type-${art.type}` : 'article-type-news';
            const tagsHtml = (art.tags && art.tags.length) ? art.tags.map((t) => `<span class="article-card-tag">${escape(t)}</span>`).join('') : '';
            return `
                <article class="article-card ${typeClass}">
                    <h4 class="article-card-title">${escape(art.title)}</h4>
                    ${art.author ? `<p class="article-card-author">${escape(art.author)}</p>` : ''}
                    <div class="article-card-content">${art.content || ''}</div>
                    ${tagsHtml ? `<div class="article-card-tags">${tagsHtml}</div>` : ''}
                </article>
            `;
        };

        const gridEditor = document.getElementById('articles-grid-editor');
        const gridColumns = document.getElementById('articles-grid-columns');
        const groupEditor = document.getElementById('magazine-group-editor');
        const groupColumns = document.getElementById('magazine-group-columns');

        if (gridEditor && groupEditor) {
            if (editorArticles.length > 0) {
                groupEditor.style.display = 'block';
                gridEditor.innerHTML = editorArticles.map(renderCard).join('');
            } else {
                groupEditor.style.display = 'none';
                gridEditor.innerHTML = '';
            }
        }
        if (gridColumns && groupColumns) {
            if (columnArticles.length > 0) {
                groupColumns.style.display = 'block';
                gridColumns.innerHTML = columnArticles.map(renderCard).join('');
            } else {
                groupColumns.style.display = 'none';
                gridColumns.innerHTML = '';
            }
        }
    }

    /** 리뉴얼: NEXO 쌤 도구함 렌더링 (download 링크, widget → 모달) */
    renderTools(edition) {
        const container = document.getElementById('tools-container');
        if (!container || !edition.tools || edition.tools.length === 0) return;
        const escape = (s) => {
            if (s == null) return '';
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        };
        container.innerHTML = edition.tools.map((tool) => {
            if (tool.type === 'download') {
                const url = (tool.url || '').trim() || '#';
                const title = escape(tool.title);
                return `
                    <a href="${escape(url)}" class="tool-card tool-card-download" data-download-url="${escape(url)}" download target="_blank" rel="noopener" title="${title}">
                        <span class="tool-card-icon">📥</span>
                        <span class="tool-card-title">${title}</span>
                        ${tool.fileType ? `<span class="tool-card-filetype">${escape(tool.fileType)}</span>` : ''}
                    </a>
                `;
            }
            if (tool.type === 'widget') {
                const name = (tool.name || '').toLowerCase();
                const title = escape(tool.title);
                const icon = tool.icon || '🔧';
                const dataName = escape(name);
                return `
                    <button type="button" class="tool-card tool-card-widget" data-widget-name="${dataName}" data-widget-title="${title}" title="${title}">
                        <span class="tool-card-icon">${icon}</span>
                        <span class="tool-card-title">${title}</span>
                    </button>
                `;
            }
            return '';
        }).join('');

        // 위젯 버튼 클릭 → 모달 열기
        container.querySelectorAll('.tool-card-widget').forEach((btn) => {
            btn.addEventListener('click', () => {
                const widgetName = (btn.dataset.widgetName || '').toLowerCase();
                const widgetTitle = btn.dataset.widgetTitle || '도구';
                this.openToolModal(widgetName, widgetTitle);
            });
        });

        // 다운로드 링크: 파일 없으면 "자료 준비 중" 안내 (404 시 에러 페이지가 받아지는 것 방지)
        container.querySelectorAll('.tool-card-download').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('data-download-url') || link.getAttribute('href');
                const title = link.querySelector('.tool-card-title')?.textContent || '자료';
                if (!url || url === '#') {
                    this.showDownloadPreparingMessage(title);
                    return;
                }
                fetch(url, { method: 'HEAD' })
                    .then((res) => {
                        if (res.ok) {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = '';
                            a.rel = 'noopener';
                            a.target = '_blank';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        } else {
                            this.showDownloadPreparingMessage(title);
                        }
                    })
                    .catch(() => this.showDownloadPreparingMessage(title));
            });
        });
    }

    /** 다운로드 자료 준비 중 안내 (방문자용 짧은 문구) */
    showDownloadPreparingMessage(title) {
        const msg = `"${title}" 자료는 준비 중입니다.\n곧 업데이트될 예정이니, 필요하시면 담당자에게 문의해 주세요.`;
        if (typeof alert === 'function') alert(msg);
    }

    /** 도구 모달 열기: timer → 5분 타이머 UI, 그 외 → 준비 중 */
    openToolModal(widgetName, widgetTitle) {
        let modal = document.getElementById('tool-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tool-modal';
            modal.className = 'tool-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="tool-modal-box">
                    <div class="tool-modal-header">
                        <h3 class="tool-modal-title"></h3>
                        <button type="button" class="tool-modal-close" aria-label="닫기">&times;</button>
                    </div>
                    <div class="tool-modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.tool-modal-close').addEventListener('click', () => this.closeToolModal());
            modal.addEventListener('click', (e) => { if (e.target === modal) this.closeToolModal(); });
        }
        const titleEl = modal.querySelector('.tool-modal-title');
        const bodyEl = modal.querySelector('.tool-modal-body');
        if (titleEl) titleEl.textContent = widgetTitle;
        if (bodyEl) {
            if (widgetName === 'timer') {
                bodyEl.innerHTML = `
                    <div class="widget-timer">
                        <div class="widget-timer-display" id="widget-timer-display">5:00</div>
                        <div class="widget-timer-buttons">
                            <button type="button" id="widget-timer-start">시작</button>
                            <button type="button" id="widget-timer-pause" disabled>일시정지</button>
                            <button type="button" id="widget-timer-reset">리셋</button>
                        </div>
                    </div>
                `;
                this.runTimerWidget(bodyEl);
            } else {
                bodyEl.innerHTML = '<p class="widget-coming">이 도구는 준비 중입니다. 곧 만나보실 수 있습니다.</p>';
            }
        }
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        this._toolModalKeydown = (e) => { if (e.key === 'Escape') this.closeToolModal(); };
        document.addEventListener('keydown', this._toolModalKeydown);
    }

    closeToolModal() {
        const modal = document.getElementById('tool-modal');
        if (modal) {
            modal.classList.remove('is-open');
            document.body.style.overflow = '';
        }
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
        if (this._toolModalKeydown) {
            document.removeEventListener('keydown', this._toolModalKeydown);
            this._toolModalKeydown = null;
        }
    }

    /** 5분 집중 타이머 위젯 로직 */
    runTimerWidget(container) {
        const display = container.querySelector('#widget-timer-display');
        const startBtn = container.querySelector('#widget-timer-start');
        const pauseBtn = container.querySelector('#widget-timer-pause');
        const resetBtn = container.querySelector('#widget-timer-reset');
        if (!display || !startBtn) return;
        const totalSeconds = 5 * 60;
        let remaining = totalSeconds;

        const formatTime = (sec) => {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m}:${String(s).padStart(2, '0')}`;
        };
        const updateDisplay = () => { display.textContent = formatTime(remaining); };
        const stopTimer = () => {
            if (this._timerInterval) {
                clearInterval(this._timerInterval);
                this._timerInterval = null;
            }
            startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
        };
        startBtn.addEventListener('click', () => {
            if (this._timerInterval) return;
            startBtn.disabled = true;
            if (pauseBtn) pauseBtn.disabled = false;
            this._timerInterval = setInterval(() => {
                remaining--;
                updateDisplay();
                if (remaining <= 0) {
                    stopTimer();
                    remaining = 0;
                    updateDisplay();
                }
            }, 1000);
        });
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this._timerInterval) {
                    clearInterval(this._timerInterval);
                    this._timerInterval = null;
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                }
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                stopTimer();
                remaining = totalSeconds;
                updateDisplay();
                startBtn.disabled = false;
                if (pauseBtn) pauseBtn.disabled = true;
            });
        }
        updateDisplay();
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
            const dateLabel = edition.date || edition.id || '';
            descElement.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;" aria-hidden="true">📅</div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--nexo-navy); margin-bottom: 20px; letter-spacing: 0.5px;">${dateLabel}</div>
                    <h3 style="font-size: 24px; color: var(--nexo-navy); margin-bottom: 15px; font-family: 'Noto Serif KR', serif;">
                        발행 예정
                    </h3>
                    <p style="font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 30px;">
                        이 발행물은 <strong>${dateLabel}</strong>에 공개됩니다.<br>
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
        if (updatesSection) updatesSection.style.display = 'none';
        const heroImage = document.getElementById('hero-image-container');
        if (heroImage) heroImage.style.display = 'none';
        this.updateNavigation();
        this.updateToolsSidebar(edition);
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
        
        // 업데이트 섹션 숨기기
        const updatesSection = document.getElementById('updates-section');
        if (updatesSection) updatesSection.style.display = 'none';
        
        // 이미지 숨기기
        const heroImage = document.getElementById('hero-image-container');
        if (heroImage) heroImage.style.display = 'none';
        
        // 네비게이션 업데이트
        this.updateNavigation();
        this.updateToolsSidebar(edition);
        
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
function initEditionManager() {
    editionManagerInstance = new EditionManager();
    editionManagerInstance.init();
    window.editionManagerInstance = editionManagerInstance;
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditionManager);
} else {
    initEditionManager();
}

window.EditionManager = EditionManager;
