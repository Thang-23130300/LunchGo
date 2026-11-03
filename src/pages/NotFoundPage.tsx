import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section>
      <h1>404 - Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to="/">Về trang chủ</Link>
    </section>
  )
}

export default NotFoundPage
