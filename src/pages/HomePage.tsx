import { Link } from 'react-router'

function HomePage() {
  return (
    <section>
      <h1>Trang chủ</h1>
      <p>Chào mừng bạn đến với LunchGo.</p>
      <Link to="/menu">Khám phá thực đơn</Link>
    </section>
  )
}

export default HomePage
