import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground">
          요청하신 발행호를 찾을 수 없습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

