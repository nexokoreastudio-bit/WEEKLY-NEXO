import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 관리자 권한 확인 페이지 (디버깅용)
 */
export default async function CheckRolePage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">로그인 필요</h1>
          <p className="text-red-600">관리자 권한을 확인하려면 먼저 로그인해주세요.</p>
          <a href="/login" className="mt-4 inline-block text-blue-600 hover:underline">
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    )
  }

  // 사용자 프로필 확인
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-nexo-navy mb-6">관리자 권한 확인</h1>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">인증 정보</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email || '없음'}</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700 mb-2">프로필 정보</h2>
            {profileError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-600"><strong>오류:</strong> {profileError.message}</p>
                <p className="text-sm text-red-500 mt-2">
                  users 테이블에 해당 사용자의 레코드가 없을 수 있습니다.
                </p>
              </div>
            ) : profile ? (
              <div className="bg-gray-50 p-4 rounded border">
                <p><strong>Role:</strong> {profile.role || '없음'}</p>
                <p><strong>Nickname:</strong> {profile.nickname || '없음'}</p>
                <p><strong>Email:</strong> {profile.email || '없음'}</p>
                <p><strong>Academy Name:</strong> {profile.academy_name || '없음'}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-yellow-600">프로필을 찾을 수 없습니다.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-700 mb-2">관리자 권한</h2>
            <div className={`p-4 rounded border ${isAdmin ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-bold ${isAdmin ? 'text-green-800' : 'text-red-800'}`}>
                {isAdmin ? '✅ 관리자 권한이 있습니다' : '❌ 관리자 권한이 없습니다'}
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">관리자 권한 부여 방법</h2>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-gray-700 mb-2">
                  Supabase Dashboard의 SQL Editor에서 다음 쿼리를 실행하세요:
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <strong>권장 방법:</strong> 이메일로 권한 부여 (더 안전함)
                </p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`UPDATE public.users
SET role = 'admin'
WHERE email = '${user.email || 'your-email@example.com'}';`}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  또는 UUID로 권한 부여:
                </p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`UPDATE public.users
SET role = 'admin'
WHERE id = '${user.id}';`}
                </pre>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="text-yellow-800 font-semibold mb-1">⚠️ 주의사항:</p>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>UUID는 반드시 올바른 형식이어야 합니다: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'</li>
                    <li>이메일로 업데이트하는 것이 더 안전하고 간단합니다</li>
                    <li>쿼리 실행 후 페이지를 새로고침하세요</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <a
              href="/admin/field-news"
              className={`inline-block px-4 py-2 rounded ${
                isAdmin
                  ? 'bg-nexo-navy text-white hover:bg-nexo-cyan'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAdmin ? '관리자 페이지로 이동' : '관리자 권한이 필요합니다'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

