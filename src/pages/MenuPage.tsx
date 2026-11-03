import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { LunchProduct } from '@/models/product'
import { getCatalog } from '@/services/catalogService'

const ALL_CATEGORIES = 'Tất cả'
const PAGE_SIZE_OPTIONS = [12, 24, 48]
const DEFAULT_PAGE_SIZE = 12

type SortOption = 'default' | 'price_asc' | 'price_desc'

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Mặc định',
  price_asc: 'Giá tăng dần',
  price_desc: 'Giá giảm dần',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function sortProducts(list: LunchProduct[], sort: SortOption): LunchProduct[] {
  if (sort === 'price_asc') return [...list].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return [...list].sort((a, b) => b.price - a.price)
  return list
}

function MenuPage() {
  const [products, setProducts] = useState<LunchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [sort, setSort] = useState<SortOption>('default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const result = await getCatalog()
        if (active) setProducts(result)
      } catch {
        if (active) setApiError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()
    return () => { active = false }
  }, [])

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...new Set(products.map((p) => p.category))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return products.filter((p) => {
      const matchesKeyword =
        !kw ||
        p.name.toLowerCase().includes(kw) ||
        p.ingredients.some((ing) => ing.toLowerCase().includes(kw))
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || p.category === selectedCategory
      return matchesKeyword && matchesCategory
    })
  }, [products, keyword, selectedCategory])

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  )

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, safePage, pageSize])

  function handleKeywordChange(value: string) {
    setKeyword(value)
    setPage(1)
  }

  function handleCategoryChange(value: string) {
    setSelectedCategory(value)
    setPage(1)
  }

  function handleSortChange(value: SortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value)
    setPage(1)
  }

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
          Không thể tải thực đơn. Vui lòng thử lại sau.
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-5">
          <input
            type="search"
            className="form-control"
            placeholder="Tìm món ăn hoặc nguyên liệu..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            aria-label="Tìm kiếm món ăn"
          />
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Lọc theo danh mục"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            aria-label="Sắp xếp theo giá"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-secondary" role="status">Đang tải thực đơn...</p>
      )}

      {!loading && !apiError && sortedProducts.length === 0 && (
        <div className="alert alert-info" role="status">
          Không tìm thấy món ăn phù hợp.
        </div>
      )}

      {!loading && pagedProducts.length > 0 && (
        <div className="row g-4">
          {pagedProducts.map((product) => (
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
                  <Link className="btn btn-outline-primary" to={`/product/${encodeURIComponent(product.id)}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {!loading && !apiError && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4">
          <p className="text-secondary mb-0">
            {sortedProducts.length === 0
              ? 'Hiển thị 0 / 0 món ăn'
              : `Hiển thị ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sortedProducts.length)} / ${sortedProducts.length} món ăn`}
          </p>

          {totalPages > 1 && (
            <nav aria-label="Phân trang thực đơn">
              <ul className="pagination mb-0">
                <li className={`page-item${safePage === 1 ? ' disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={safePage === 1}
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item${p === safePage ? ' active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(p)}
                      aria-current={p === safePage ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item${safePage === totalPages ? ' disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={safePage === totalPages}
                    aria-label="Trang sau"
                  >
                    ›
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <div className="d-flex align-items-center gap-2">
            <label htmlFor="page-size-select" className="text-secondary small mb-0">
              Mỗi trang:
            </label>
            <select
              id="page-size-select"
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  )
}

export default MenuPage
