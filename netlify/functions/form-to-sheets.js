// Netlify Function: Netlify Forms webhook을 받아 Google Sheets에 저장
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    try {
        // 환경 변수 확인
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!sheetId || !clientEmail || !privateKey) {
            console.error('환경 변수가 설정되지 않았습니다.');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: '서버 설정 오류: 환경 변수를 확인해주세요.' }),
            };
        }

        // Netlify Forms webhook 데이터 파싱
        let formData;
        try {
            formData = JSON.parse(event.body);
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '잘못된 데이터 형식입니다.' }),
            };
        }

        // Netlify Forms webhook 형식 확인
        // webhook 형식: { "form_name": "...", "data": { ... } }
        // 또는 직접 호출 형식: { "company_name": "...", ... }
        let submissionData;
        
        if (formData.form_name && formData.data) {
            // Netlify Forms webhook 형식
            submissionData = formData.data;
        } else {
            // 직접 호출 형식
            submissionData = formData;
        }

        const {
            company_name,
            customer_name,
            phone_number,
            region,
            size,
            mount_type,
            quantity,
            unit_price,
            total_price,
        } = submissionData;

        // Google Sheets 연결
        const doc = new GoogleSpreadsheet(sheetId);
        await doc.useServiceAccountAuth({
            client_email: clientEmail,
            private_key: privateKey,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // 첫 번째 시트 사용

        // 데이터 행 생성
        const row = {
            '제출일시': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            '업체명': company_name || '',
            '주문자 성함': customer_name || '',
            '연락처': phone_number || '',
            '지역 / 설치 환경': region || '',
            '인치 종류': size ? `${size}인치` : '',
            '설치 방식': mount_type === 'stand' ? '이동형 스탠드' : (mount_type === 'wall' ? '벽걸이' : mount_type || ''),
            '구매 수량': quantity ? `${quantity}대` : '',
            '단가': unit_price || '',
            '총 주문 금액': total_price || '',
        };

        // 시트에 행 추가
        await sheet.addRow(row);

        console.log('Google Sheets에 데이터 저장 완료:', row);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: '주문이 성공적으로 Google Sheets에 저장되었습니다.' 
            }),
        };
    } catch (error) {
        console.error('Google Sheets 저장 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: '데이터 저장 중 오류가 발생했습니다.',
                details: error.message 
            }),
        };
    }
};
