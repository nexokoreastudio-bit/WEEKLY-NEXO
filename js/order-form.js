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
                // 가격 정보를 hidden 필드에 설정
                const size = document.getElementById('size').value;
                const mountType = document.getElementById('mount_type').value;
                const quantity = document.getElementById('quantity').value;
                
                if (size && mountType && quantity) {
                    const unitPrice = priceData[size]?.[mountType] || 0;
                    const totalPrice = calculateTotalPrice();
                    
                    const unitPriceField = document.getElementById('unit_price');
                    const totalPriceField = document.getElementById('total_price_hidden');
                    
                    if (unitPriceField) {
                        unitPriceField.value = unitPrice.toLocaleString() + '원';
                    }
                    if (totalPriceField) {
                        totalPriceField.value = totalPrice.toLocaleString() + '원';
                    }
                }
                
                // 로컬 환경 체크 (개발 중)
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                
                if (isLocal) {
                    // 로컬 환경에서는 폼 데이터를 콘솔에 출력하고 제출 방지
                    e.preventDefault();
                    const formData = new FormData(orderForm);
                    console.log('=== 폼 제출 데이터 (로컬 테스트) ===');
                    for (let [key, value] of formData.entries()) {
                        console.log(key + ':', value);
                    }
                    alert('로컬 환경에서는 Netlify Forms가 작동하지 않습니다.\n실제 Netlify에 배포하면 정상 작동합니다.\n\n폼 데이터는 콘솔에 출력되었습니다.');
                    return false;
                }
                
                // Netlify에 배포된 환경에서는 자동으로 처리됨
                // 제출 성공 후 thank-you.html로 리다이렉트됨
            });
        }
    });
})();
