
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { LunchProduct } from '@/models/product'
import { fallbackCatalog } from '@/data/fallbackCatalog'
import { getRecipes } from '@/services/dummyJsonClient'
import { mapDummyRecipe } from '@/services/productMapper'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function MenuPage() {
  const [products, setProducts] = useState<LunchProduct[]>(fallbackCatalog)
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const result = await getRecipes(30)
        const apiProducts = result.recipes.map(mapDummyRecipe)

        const combined = [...apiProducts, ...fallbackCatalog]
        const uniqueProducts = Array.from(
          new Map(combined.map((product) => [product.id, product])).values(),
        )

        if (active) {
          setProducts(uniqueProducts)
          setApiError(false)
        }
      } catch {
        if (active) {
          setProducts(fallbackCatalog)
          setApiError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => ['Tất cả', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return products.filter((product) => {
      const matchesKeyword =
        product.name.toLowerCase().includes(normalizedKeyword) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(normalizedKeyword),
        )

      const matchesCategory =
        selectedCategory === 'Tất cả' ||
        product.category === selectedCategory

      return matchesKeyword && matchesCategory
    })
  }, [products, keyword, selectedCategory])

  return (
    <section className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">Thực đơn LunchGo</h1>
        <p className="text-secondary">
          Khám phá các món ăn và lựa chọn bữa trưa phù hợp với bạn.
        </p>
      </div>

      {apiError && (
        <div className="alert alert-warning" role="alert">
          Không thể kết nối máy chủ món ăn. LunchGo đang sử dụng dữ liệu dự phòng.
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <input
            type="search"
            className="form-control"
            placeholder="Tìm món ăn hoặc nguyên liệu..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            aria-label="Tìm kiếm món ăn"
          />
        </div>

        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Lọc theo danh mục"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-secondary" role="status">
          Đang tải thực đơn...
        </p>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="alert alert-info">
          Không tìm thấy món ăn phù hợp.
        </div>
      )}

      <div className="row g-4">
        {filteredProducts.map((product) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={product.id}>
            <article className="card h-100 shadow-sm">
              <img
                src={product.image}
                className="card-img-top"
                alt={product.name}
                style={{ height: 190, objectFit: 'cover' }}
                loading="lazy"
              />

              <div className="card-body d-flex flex-column">
                <span className="badge text-bg-light align-self-start mb-2">
                  {product.category}
                </span>

                <h2 className="h5 card-title">{product.name}</h2>

                <p className="text-secondary small mb-2">
                  {product.ingredients.slice(0, 3).join(', ') || 'Chưa có thông tin nguyên liệu'}
                </p>

                <p className="fw-bold text-danger mt-auto mb-3">
                  {formatPrice(product.price)}
                </p>

                <Link
                  className="btn btn-outline-primary"
                  to={`/product/${product.id}`}
                >
                  Xem chi tiết
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>

      {!loading && (
        <p className="text-secondary mt-4">
          Hiển thị {filteredProducts.length} / {products.length} món ăn
        </p>
      )}
    </section>
  )
}

export default MenuPage
