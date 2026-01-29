// Netlify Function: Google Sheets에 주문 데이터 저장
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

    // POST 요청만 처리
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
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
                body: JSON.stringify({ error: '서버 설정 오류' }),
            };
        }

        // 요청 데이터 파싱
        const data = JSON.parse(event.body);
        const {
            companyName,
            customerName,
            phoneNumber,
            region,
            size,
            mountType,
            quantity,
            unitPrice,
            totalPrice,
        } = data;

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
            '업체명': companyName || '',
            '주문자 성함': customerName || '',
            '연락처': phoneNumber || '',
            '지역 / 설치 환경': region || '',
            '인치 종류': size ? `${size}인치` : '',
            '설치 방식': mountType || '',
            '구매 수량': quantity ? `${quantity}대` : '',
            '단가': unitPrice ? `${unitPrice.toLocaleString()}원` : '',
            '총 주문 금액': totalPrice ? `${totalPrice.toLocaleString()}원` : '',
        };

        // 시트에 행 추가
        await sheet.addRow(row);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: '주문이 성공적으로 접수되었습니다.' }),
        };
    } catch (error) {
        console.error('Google Sheets 저장 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '데이터 저장 중 오류가 발생했습니다.' }),
        };
    }
};
