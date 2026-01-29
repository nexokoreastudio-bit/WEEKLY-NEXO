// 주문 폼 가격 계산 및 제출 처리
(function() {
    const priceData = {
        '65': { wall: 2250000, stand: 2500000 },
        '75': { wall: 2750000, stand: 3000000 },
        '86': { wall: 3450000, stand: 3800000 },
    };

    function calculateTotalPrice() {
        const size = document.getElementById('size').value;
        const mountType = document.getElementById('mount_type').value;
        const quantity = document.getElementById('quantity').value;

        if (!size || !quantity) {
            return 0;
        }

        const unitPrice = priceData[size]?.[mountType] || 0;
        return unitPrice * parseInt(quantity);
    }

    function updatePriceDisplay() {
        // 가격 표시 기능 비활성화 (총 금액 표시 안 함)
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            priceDisplay.style.display = 'none';
        }
    }

    // 가격 계산 이벤트 리스너
    document.addEventListener('DOMContentLoaded', function() {
        const sizeSelect = document.getElementById('size');
        const mountTypeSelect = document.getElementById('mount_type');
        const quantitySelect = document.getElementById('quantity');
        const orderForm = document.getElementById('order-form');

        if (sizeSelect) {
            sizeSelect.addEventListener('change', updatePriceDisplay);
        }
        if (mountTypeSelect) {
            mountTypeSelect.addEventListener('change', updatePriceDisplay);
        }
        if (quantitySelect) {
            quantitySelect.addEventListener('change', updatePriceDisplay);
        }

        // 폼 제출 처리 - Netlify Forms 사용
        if (orderForm) {
            orderForm.addEventListener('submit', async function(e) {
                // 페이지 이동 전에 모든 로그를 즉시 출력 (큰 폰트로 강조)
                console.log('%c=== 🚀 폼 제출 시작 ===', 'font-size: 18px; font-weight: bold; color: #00ff00; background: #000; padding: 8px; border: 2px solid #00ff00;');
                console.log('제출 시간:', new Date().toLocaleString('ko-KR'));
                
                // localStorage에 로그 저장 (페이지 이동 후에도 확인 가능)
                try {
                    const debugInfo = {
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        hostname: window.location.hostname
                    };
                    localStorage.setItem('nexo_form_debug_start', JSON.stringify(debugInfo));
                    console.log('💾 디버그 정보가 localStorage에 저장되었습니다.');
                } catch (err) {
                    console.warn('localStorage 저장 실패:', err);
                }
                
                // 가격 정보를 hidden 필드에 설정
                const size = document.getElementById('size').value;
                const mountType = document.getElementById('mount_type').value;
                const quantity = document.getElementById('quantity').value;
                
                console.log('선택된 값:', { size, mountType, quantity });
                
                if (size && mountType && quantity) {
                    const unitPrice = priceData[size]?.[mountType] || 0;
                    const totalPrice = calculateTotalPrice();
                    
                    console.log('계산된 가격:', { unitPrice, totalPrice });
                    
                    const unitPriceField = document.getElementById('unit_price');
                    const totalPriceField = document.getElementById('total_price_hidden');
                    
                    if (unitPriceField) {
                        unitPriceField.value = unitPrice.toLocaleString() + '원';
                        console.log('단가 필드 설정:', unitPriceField.value);
                    }
                    if (totalPriceField) {
                        totalPriceField.value = totalPrice.toLocaleString() + '원';
                        console.log('총액 필드 설정:', totalPriceField.value);
                    }
                }
                
                // 폼 데이터 수집 및 출력
                const formData = new FormData(orderForm);
                const formDataObj = {};
                console.log('=== 📋 폼 데이터 ===');
                for (let [key, value] of formData.entries()) {
                    formDataObj[key] = value;
                    console.log(`  ${key}:`, value);
                }
                console.log('전체 폼 데이터 객체:', formDataObj);
                
                // 환경 정보 출력
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                console.log('=== 🌐 환경 정보 ===');
                console.log('호스트:', window.location.hostname);
                console.log('URL:', window.location.href);
                console.log('로컬 환경 여부:', isLocal);
                console.log('Netlify 배포 환경:', !isLocal);
                
                // Netlify Forms 확인
                const hasNetlifyAttr = orderForm.hasAttribute('netlify');
                const hasDataNetlify = orderForm.hasAttribute('data-netlify');
                console.log('=== 📝 Netlify Forms 설정 ===');
                console.log('netlify 속성:', hasNetlifyAttr);
                console.log('data-netlify 속성:', hasDataNetlify);
                console.log('form name:', orderForm.getAttribute('name'));
                console.log('form action:', orderForm.getAttribute('action'));
                
                // 로컬 환경 체크 (개발 중)
                if (isLocal) {
                    // 로컬 환경에서는 폼 데이터를 콘솔에 출력하고 제출 방지
                    e.preventDefault();
                    console.log('⚠️ 로컬 환경: 폼 제출이 차단되었습니다.');
                    console.log('💡 실제 Netlify에 배포하면 정상 작동합니다.');
                    alert('로컬 환경에서는 Netlify Forms가 작동하지 않습니다.\n실제 Netlify에 배포하면 정상 작동합니다.\n\n폼 데이터는 콘솔에 출력되었습니다.');
                    return false;
                }
                
                // 폼 데이터 수집
                const formDataForStorage = new FormData(orderForm);
                const formDataObjForStorage = {};
                for (let [key, value] of formDataForStorage.entries()) {
                    formDataObjForStorage[key] = value;
                }
                
                // localStorage에 저장
                try {
                    localStorage.setItem('nexo_form_submission', JSON.stringify({
                        ...formDataObjForStorage,
                        timestamp: new Date().toISOString(),
                        url: window.location.href
                    }));
                    console.log('%c💾 폼 데이터가 localStorage에 저장되었습니다!', 'font-size: 14px; color: #00aaff; background: #000; padding: 5px;');
                } catch (err) {
                    console.warn('localStorage 저장 실패:', err);
                }
                
                // Google Sheets에 직접 저장 시도 (참고 프로젝트 방식)
                console.log('%c📤 Google Sheets에 직접 저장 시도...', 'font-size: 14px; font-weight: bold; color: #00aaff;');
                
                try {
                    const response = await fetch('/.netlify/functions/form-to-sheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formDataObjForStorage)
                    });
                    
                    const result = await response.json();
                    console.log('Google Sheets 응답 상태:', response.status);
                    console.log('Google Sheets 응답 내용:', result);
                    
                    if (response.ok) {
                        console.log('%c✅ Google Sheets 저장 성공!', 'font-size: 16px; font-weight: bold; color: #00ff00; background: #000; padding: 5px;');
                    } else {
                        console.error('%c❌ Google Sheets 저장 실패:', 'font-size: 14px; color: #ff0000;', result);
                    }
                } catch (error) {
                    console.error('%c❌ Google Sheets 저장 오류:', 'font-size: 14px; color: #ff0000;', error);
                    console.log('⚠️ Google Sheets 저장 실패했지만 Netlify Forms는 계속 진행됩니다.');
                }
                
                console.log('%c✅ Netlify Forms로 제출 진행 중...', 'font-size: 14px; font-weight: bold; color: #00ff00;');
                console.log('제출 후 리다이렉트 예정:', orderForm.getAttribute('action') || '/thank-you.html');
                
                // 제출 직전 최종 확인 메시지
                console.log('%c⏱️ 제출 직전 - 모든 로그가 출력되었습니다.', 'font-size: 16px; color: #ffaa00; background: #000; padding: 8px; border: 2px solid #ffaa00;');
                console.log('페이지가 곧 이동합니다. 로그를 확인하려면 위로 스크롤하세요.');
                
                // Netlify Forms는 자동으로 처리됨 (제출 성공 후 thank-you.html로 리다이렉트)
                
                // 제출 전에 잠시 대기하여 로그가 출력되도록 함
                const logDelay = setTimeout(() => {
                    console.log('%c⏱️ 제출 직전 - 모든 로그가 출력되었습니다.', 'font-size: 12px; color: #ffaa00;');
                }, 100);
                
                // clearTimeout은 필요 없음 (제출이 진행됨)
            });
        }
    });
})();
