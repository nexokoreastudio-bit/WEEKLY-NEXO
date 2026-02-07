/**
 * Netlify Function: 회원 가입/로그인/프로필 (Render.com PostgreSQL)
 * POST body.action = 'register' | 'login'
 * GET + Authorization: Bearer <token> = 프로필 조회
 * PATCH + Authorization + body = 프로필 수정
 */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

function res(status, body) {
  return { statusCode: status, headers: HEADERS, body: JSON.stringify(body) };
}

function getPool() {
  const url = process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL;
  if (!url) return null;
  return new Pool({ connectionString: url, ssl: url.includes('render.com') ? { rejectUnauthorized: false } : false });
}

function verifyToken(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(auth.slice(7), secret);
  } catch (e) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return res(200, {});

  const pool = getPool();
  if (!pool) return res(500, { error: 'DB 연결 설정이 없습니다. DATABASE_URL을 확인하세요.' });

  let body = {};
  if (event.body) {
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return res(400, { error: '잘못된 JSON입니다.' });
    }
  }

  try {
    // 회원가입
    if (event.httpMethod === 'POST' && body.action === 'register') {
      const { email, password, name, academy_name, phone, referrer_code } = body;
      const emailTrim = (email || '').trim().toLowerCase();
      const nameTrim = (name || '').trim();
      if (!emailTrim || !password || !nameTrim) return res(400, { error: '이메일, 비밀번호, 이름은 필수입니다.' });
      if (password.length < 4) return res(400, { error: '비밀번호는 4자 이상이어야 합니다.' });

      const password_hash = await bcrypt.hash(password, 10);
      const client = await pool.connect();
      try {
        const r = await client.query(
          `INSERT INTO members (email, password_hash, name, academy_name, phone, referrer_code)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, name, academy_name, phone, referrer_code, created_at`,
          [emailTrim, password_hash, nameTrim, (academy_name || '').trim(), (phone || '').trim(), (referrer_code || '').trim()]
        );
        const row = r.rows[0];
        const secret = process.env.JWT_SECRET;
        if (!secret) return res(500, { error: 'JWT_SECRET이 설정되지 않았습니다.' });
        const token = jwt.sign({ sub: row.id, email: row.email }, secret, { expiresIn: '30d' });
        return res(200, {
          success: true,
          token,
          user: {
            id: row.id,
            email: row.email,
            name: row.name,
            academy_name: row.academy_name || '',
            phone: row.phone || '',
            referrer_code: row.referrer_code || '',
            created_at: row.created_at,
          },
        });
      } catch (err) {
        if (err.code === '23505') return res(400, { error: '이미 사용 중인 이메일입니다.' });
        throw err;
      } finally {
        client.release();
      }
    }

    // 로그인
    if (event.httpMethod === 'POST' && body.action === 'login') {
      const { email, password } = body;
      const emailTrim = (email || '').trim().toLowerCase();
      if (!emailTrim || !password) return res(400, { error: '이메일과 비밀번호를 입력하세요.' });

      const client = await pool.connect();
      try {
        const r = await client.query(
          'SELECT id, email, password_hash, name, academy_name, phone, referrer_code, created_at FROM members WHERE email = $1',
          [emailTrim]
        );
        if (r.rows.length === 0) return res(401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        const row = r.rows[0];
        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok) return res(401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' });

        const secret = process.env.JWT_SECRET;
        if (!secret) return res(500, { error: 'JWT_SECRET이 설정되지 않았습니다.' });
        const token = jwt.sign({ sub: row.id, email: row.email }, secret, { expiresIn: '30d' });
        return res(200, {
          success: true,
          token,
          user: {
            id: row.id,
            email: row.email,
            name: row.name,
            academy_name: row.academy_name || '',
            phone: row.phone || '',
            referrer_code: row.referrer_code || '',
            created_at: row.created_at,
          },
        });
      } finally {
        client.release();
      }
    }

    // 프로필 조회 (GET) 또는 수정 (PATCH)
    const payload = verifyToken(event);
    if (!payload) return res(401, { error: '로그인이 필요합니다.' });

    if (event.httpMethod === 'GET') {
      const client = await pool.connect();
      try {
        const r = await client.query(
          'SELECT id, email, name, academy_name, phone, referrer_code, subscription_status, created_at, updated_at FROM members WHERE id = $1',
          [payload.sub]
        );
        if (r.rows.length === 0) return res(404, { error: '회원 정보를 찾을 수 없습니다.' });
        const row = r.rows[0];
        return res(200, {
          id: row.id,
          email: row.email,
          name: row.name,
          academy_name: row.academy_name || '',
          phone: row.phone || '',
          referrer_code: row.referrer_code || '',
          subscription_status: row.subscription_status,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      } finally {
        client.release();
      }
    }

    if (event.httpMethod === 'PATCH') {
      const { name, email, academy_name, phone, referrer_code } = body;
      const emailTrim = (email || '').trim().toLowerCase();
      const nameTrim = (name || '').trim();
      if (!emailTrim || !nameTrim) return res(400, { error: '이름과 이메일은 필수입니다.' });

      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE members SET name = $1, email = $2, academy_name = $3, phone = $4, referrer_code = $5, updated_at = NOW() WHERE id = $6`,
          [nameTrim, emailTrim, (academy_name || '').trim(), (phone || '').trim(), (referrer_code || '').trim(), payload.sub]
        );
        return res(200, { success: true });
      } catch (err) {
        if (err.code === '23505') return res(400, { error: '이미 사용 중인 이메일입니다.' });
        throw err;
      } finally {
        client.release();
      }
    }

    return res(405, { error: '허용되지 않은 요청입니다.' });
  } catch (err) {
    console.error('member-auth error:', err);
    return res(500, { error: '서버 오류가 발생했습니다.' });
  }
};
