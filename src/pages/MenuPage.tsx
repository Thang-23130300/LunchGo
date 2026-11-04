import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import type { LunchProduct } from '@/models/product'
import { getCatalog } from '@/services/catalogService'

const ALL_CATEGORIES = 'Tất cả'
const PAGE_SIZE_OPTIONS = [12, 24, 48]
const DEFAULT_PAGE_SIZE = 12

type SortOption = 'default' | 'price_asc' | 'price_desc'
const VALID_SORTS: SortOption[] = ['default', 'price_asc', 'price_desc']

type MenuQuery = {
  q: string
  category: string
  sort: SortOption
  page: number
  pageSize: number
}

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

function normalizeKeyword(value: string): string {
  return value.normalize('NFC').trim()
}

function readPositiveInteger(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined

  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : undefined
}

function buildSearch(params: MenuQuery): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category !== ALL_CATEGORIES) sp.set('category', params.category)
  if (params.sort !== 'default') sp.set('sort', params.sort)
  if (params.page > 1) sp.set('page', String(params.page))
  if (params.pageSize !== DEFAULT_PAGE_SIZE) sp.set('pageSize', String(params.pageSize))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

function MenuPage() {
  const [products, setProducts] = useState<LunchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputDraft, setInputDraft] = useState<{ key: string; text: string } | null>(null)
  const composing = useRef(false)
  const pendingSearch = useRef<{ key: string; search: string } | null>(null)

  const keyword = normalizeKeyword(searchParams.get('q') ?? '')
  if (inputDraft && inputDraft.key !== location.key) setInputDraft(null)
  const inputValue = inputDraft?.key === location.key ? inputDraft.text : keyword
  const rawSort = searchParams.get('sort')
  const sort = VALID_SORTS.find((option) => option === rawSort) ?? 'default'
  const page = readPositiveInteger(searchParams.get('page')) ?? 1
  const rawPageSize = readPositiveInteger(searchParams.get('pageSize')) ?? DEFAULT_PAGE_SIZE
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE

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
  const rawCategory = searchParams.get('category')
  const selectedCategory = categories.find((category) => category === rawCategory) ?? ALL_CATEGORIES

  const filteredProducts = useMemo(() => {
    const kw = keyword.toLowerCase()
    return products.filter((p) => {
      const matchesKeyword =
        !kw ||
        normalizeKeyword(p.name).toLowerCase().includes(kw) ||
        p.ingredients.some((ing) => normalizeKeyword(ing).toLowerCase().includes(kw))
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
  const query: MenuQuery = { q: keyword, category: selectedCategory, sort, page: safePage, pageSize }
  const canonicalSearch = buildSearch(query)

  useEffect(() => {
    pendingSearch.current = null
  }, [location.key])

  useEffect(() => {
    // Kiểm tra danh mục và số trang sau khi catalog đã tải xong.
    if (!loading && !apiError && location.search !== canonicalSearch) {
      setSearchParams(canonicalSearch, { replace: true })
    }
  }, [loading, apiError, location.search, canonicalSearch, setSearchParams])

  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, safePage, pageSize])

  function updateParams(patch: Partial<MenuQuery>) {
    const search = buildSearch({ ...query, ...patch })
    if (search === location.search) return
    if (pendingSearch.current?.key === location.key && pendingSearch.current.search === search) return

    pendingSearch.current = { key: location.key, search }
    setSearchParams(search)
  }

  function handleKeywordChange(value: string) {
    // Giữ ký tự đang gõ, kể cả khoảng trắng, cho tới khi URL chuyển sang truy vấn mới.
    setInputDraft({ key: location.key, text: value })
    const q = normalizeKeyword(value)
    if (!composing.current && q !== keyword) updateParams({ q, page: 1 })
  }

  function handleCategoryChange(value: string) {
    updateParams({ category: value, page: 1 })
  }

  function handleSortChange(value: SortOption) {
    updateParams({ sort: value, page: 1 })
  }

  function handlePageSizeChange(value: number) {
    updateParams({ pageSize: value, page: 1 })
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
            value={inputValue}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onCompositionStart={() => { composing.current = true }}
            onCompositionEnd={(e) => {
              composing.current = false
              handleKeywordChange(e.currentTarget.value)
            }}
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
                  <Link
                    className="btn btn-outline-primary"
                    to={`/product/${encodeURIComponent(product.id)}`}
                    state={{ fromMenu: `/menu${canonicalSearch}` }}
                  >
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
                    onClick={() => updateParams({ page: safePage - 1 })}
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
                      onClick={() => updateParams({ page: p })}
                      aria-current={p === safePage ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item${safePage === totalPages ? ' disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => updateParams({ page: safePage + 1 })}
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
