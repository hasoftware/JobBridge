import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: 'OAUTH_CALLBACK', code, error },
        window.location.origin,
      )
      window.close()
    }
  }, [code, error])

  return (
    <div className="oauth-callback">
      <div>Đang xử lý đăng nhập...</div>
      <div>Bạn có thể đóng cửa sổ này nếu không tự đóng.</div>
    </div>
  )
}
