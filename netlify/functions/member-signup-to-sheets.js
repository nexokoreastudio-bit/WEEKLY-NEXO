// Netlify Function: 회원 가입 폼 데이터를 Google Sheets에 저장
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

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

        // 폼 데이터 파싱
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
        let submissionData;
        if (formData.form_name && formData.data) {
            // Netlify Forms webhook 형식
            submissionData = formData.data;
        } else {
            // 직접 호출 형식
            submissionData = formData;
        }

        const {
            name,
            email,
            academy_name,
            phone,
            referrer_code,
            notification_agree
        } = submissionData;

        // 필수 필드 확인
        if (!name || !email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '이름과 이메일은 필수입니다.' }),
            };
        }

        // Google Sheets 인증 및 연결
        const serviceAccountAuth = new JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();

        // 회원 시트 찾기 또는 생성
        let sheet;
        const sheetTitle = '회원 가입';
        try {
            sheet = doc.sheetsByTitle[sheetTitle];
        } catch (e) {
            // 시트가 없으면 생성
            sheet = await doc.addSheet({ title: sheetTitle });
            // 헤더 추가
            await sheet.setHeaderRow([
                '가입일시',
                '이름',
                '이메일',
                '학원명',
                '연락처',
                '유입 경로',
                '알림 수신 동의'
            ]);
        }

        // 데이터 행 생성
        const row = {
            '가입일시': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            '이름': name || '',
            '이메일': email || '',
            '학원명': academy_name || '',
            '연락처': phone || '',
            '유입 경로': referrer_code || '',
            '알림 수신 동의': notification_agree ? '동의' : '비동의'
        };

        // Google Sheets에 추가
        await sheet.addRow(row);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: '회원 가입이 완료되었습니다.',
            }),
        };
    } catch (error) {
        console.error('회원 가입 데이터 저장 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: '회원 가입 처리 중 오류가 발생했습니다.',
                details: error.message,
            }),
        };
    }
};


