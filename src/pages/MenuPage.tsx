import { Link } from 'react-router'

function MenuPage() {
  return (
    <section>
      <h1>Thực đơn</h1>
      <p>Danh sách món ăn đang được xây dựng.</p>
      <Link to="/product/themealdb:52772">Xem trang chi tiết mẫu</Link>
    </section>
  )
}

export default MenuPage
