import { Link } from 'react-router'

type NotFoundPageProps = {
  returnTo?: string
  returnLabel?: string
}

function NotFoundPage({ returnTo = '/', returnLabel = 'Về trang chủ' }: NotFoundPageProps) {
  return (
    <section>
      <h1>404 - Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to={returnTo}>{returnLabel}</Link>
    </section>
  )
}

export default NotFoundPage
