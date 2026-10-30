import { Link, useParams } from 'react-router'

function ProductPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <h1>Chi tiết món ăn</h1>
      <p>Mã món: {id}</p>
      <p>Thông tin món ăn đang được xây dựng.</p>
      <Link to="/menu">Về thực đơn</Link>
    </section>
  )
}

export default ProductPage
