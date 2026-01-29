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
        const totalPrice = calculateTotalPrice();
        const priceDisplay = document.getElementById('price-display');
        const totalPriceElement = document.getElementById('total-price');

        if (totalPrice > 0) {
            priceDisplay.style.display = 'block';
            totalPriceElement.textContent = totalPrice.toLocaleString() + '원';
        } else {
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
            orderForm.addEventListener('submit', function(e) {
                console.log('=== 🚀 폼 제출 시작 ===');
                console.log('제출 시간:', new Date().toLocaleString('ko-KR'));
                
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
                
                console.log('✅ Netlify Forms로 제출 진행 중...');
                console.log('제출 후 리다이렉트 예정:', orderForm.getAttribute('action') || '/thank-you.html');
                
                // Netlify에 배포된 환경에서는 자동으로 처리됨
                // 제출 성공 후 thank-you.html로 리다이렉트됨
                
                // 제출 후 확인을 위한 타이머 (실제 제출은 Netlify Forms가 처리)
                setTimeout(() => {
                    console.log('⏱️ 제출 후 1초 경과 - Netlify Forms가 처리 중일 것입니다.');
                }, 1000);
            });
        }
    });
})();
