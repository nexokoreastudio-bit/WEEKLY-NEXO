/**
 * Supabase 클라이언트 (진짜 회원 DB 사용 시).
 * window.__SUPABASE_URL__ / __SUPABASE_ANON_KEY__ 가 있으면 클라이언트 반환, 없으면 null.
 */
(function() {
  var url = typeof window !== 'undefined' && window.__SUPABASE_URL__;
  var key = typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__;
  var client = null;

  if (url && key && typeof window.supabase !== 'undefined') {
    try {
      client = window.supabase.createClient(url, key);
    } catch (e) {
      console.warn('Supabase createClient failed:', e);
    }
  }

  window.getSupabase = function() {
    return client;
  };
  window.isSupabaseEnabled = function() {
    return client !== null;
  };
})();
