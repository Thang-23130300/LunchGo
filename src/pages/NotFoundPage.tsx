import { Link } from 'react-router'
import { usePageTitle } from '@/app/usePageTitle'

function NotFoundPage() {
  usePageTitle('Không tìm thấy trang')

  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found__code" aria-hidden="true">404</p>
      <h1 id="not-found-title">Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to="/" className="site-button site-button--primary">← Về trang chủ</Link>
    </section>
  )
}

export default NotFoundPage
