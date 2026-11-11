import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/app/hooks'
import type { AppDispatch } from '@/app/store'
import { addToCart } from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { useLocation, useNavigate, useParams } from 'react-router'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

type ShareButtonProps = {
  productName: string
}

function ShareButton({ productName }: ShareButtonProps) {
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const canonical = location.pathname + location.search
    navigator.clipboard.writeText(canonical).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={handleCopy}
      aria-label={`Sao chép liên kết món ${productName}`}
    >
      {copied ? '✓ Đã sao chép' : '🔗 Sao chép liên kết'}
    </button>
  )
}

function ProductPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { products, status } = useAppSelector(selectCatalog)
  const product = products.find((item) => item.id === id)

  const fromMenu: unknown = (location.state as { fromMenu?: unknown } | null)?.fromMenu
  const menuHref = typeof fromMenu === 'string' && (fromMenu === '/menu' || fromMenu.startsWith('/menu?'))
    ? fromMenu
    : '/menu'

  function handleBack() {
    navigate(menuHref)
  }

  if (status === 'idle') {
    return (
      <section className="container py-5">
        <p role="status" className="text-secondary">Đang tải thông tin món ăn...</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="container py-5">
        <div className="alert alert-warning" role="alert">
          {status === 'error'
            ? 'Không thể tải thông tin món ăn. Vui lòng thử lại sau.'
            : 'Không tìm thấy món ăn này.'}
        </div>
        <button className="btn btn-outline-primary" onClick={handleBack}>
          ← Quay lại thực đơn
        </button>
      </section>
    )
  }

  return (
    <section className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <button
          className="btn btn-link p-0 text-decoration-none"
          onClick={handleBack}
        >
          ← Quay lại thực đơn
        </button>
        <ShareButton productName={product.name} />
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
          />
        </div>

        <div className="col-12 col-md-6">
          <span className="badge text-bg-light mb-2">{product.category}</span>

          <h1 className="fw-bold">{product.name}</h1>

          <p className="fs-4 fw-bold text-danger">{formatPrice(product.price)}</p>
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={() => dispatch(addToCart(product.id))}
          >
            Thêm vào giỏ hàng
          </button>

          <p className="text-secondary small">Nguồn dữ liệu: {product.source}</p>

          {product.calories !== undefined && (
            <p>Năng lượng: {product.calories} kcal / khẩu phần</p>
          )}

          <h2 className="h5 mt-4">Nguyên liệu</h2>
          {product.ingredients.length > 0 ? (
            <ul>
              {product.ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">Chưa có thông tin nguyên liệu.</p>
          )}

          <p className={product.isAvailable ? 'text-success' : 'text-danger'}>
            {product.isAvailable ? '● Đang có sẵn' : '● Tạm hết món'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProductPage
