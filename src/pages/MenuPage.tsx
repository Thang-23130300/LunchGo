import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import type { AppDispatch } from '@/app/store'
import Breadcrumb from '@/components/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import { addToCart } from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { useLocation, useRevalidator, useSearchParams } from 'react-router'
import type { LunchProduct } from '@/models/product'
import '@/styles/menu.scss'
import { useFavorites } from '@/features/favorites/useFavorites'

const ALL_CATEGORIES = 'Tất cả'
const CATEGORY_LABELS: Record<string, string> = {
  Com: 'Cơm',
  Bun: 'Bún',
  PhoHuTieu: 'Phở / Hủ tiếu',
  Mi: 'Mì',
  BanhMi: 'Bánh mì',
  Cuon: 'Cuốn',
  Banh: 'Bánh',
  Chao: 'Cháo',
  Salad: 'Salad',
  DoUong: 'Đồ uống',
}
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
  usePageTitle('Thực đơn')
  const dispatch = useDispatch<AppDispatch>()
  const { isFavorite, toggleFavorite, authLoading } = useFavorites()
  const {
    products,
    status,
    categories: catalogCategories,
    categoriesStatus,
  } = useAppSelector(selectCatalog)
  const cartItems = useAppSelector((state) => state.cart.items)
  const loading = status === 'idle'
  const apiError = status === 'error'
  const { state: revalidationState, revalidate } = useRevalidator()

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputDraft, setInputDraft] = useState<{ key: string; text: string } | null>(null)
  const [addedProduct, setAddedProduct] = useState<{ id: string; count: number }>()
  const searchInput = useRef<HTMLInputElement>(null)
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
  const rawCategory = searchParams.get('category')

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...new Set(
        categoriesStatus === 'ready'
          ? catalogCategories.map((category) => category.name)
          : [
            ...products.map((product) => product.category),
            ...(rawCategory && rawCategory !== ALL_CATEGORIES ? [rawCategory] : []),
          ],
      ),
    ],
    [catalogCategories, categoriesStatus, products, rawCategory],
  )
  const categoryNamesById = useMemo(
    () => new Map(catalogCategories.map((category) => [category.id, category.name])),
    [catalogCategories],
  )
  const selectedCategory = categories.find((category) => category === rawCategory) ?? ALL_CATEGORIES

  const filteredProducts = useMemo(() => {
    const kw = keyword.toLowerCase()
    return products.filter((p) => {
      const matchesKeyword =
        !kw ||
        normalizeKeyword(p.name).toLowerCase().includes(kw) ||
        p.ingredients.some((ing) => normalizeKeyword(ing).toLowerCase().includes(kw))
      const categoryName = categoryNamesById.get(p.categoryId ?? '') ?? p.category
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || categoryName === selectedCategory
      return matchesKeyword && matchesCategory
    })
  }, [products, keyword, selectedCategory, categoryNamesById])

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  )

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const query: MenuQuery = { q: keyword, category: selectedCategory, sort, page: safePage, pageSize }
  const canonicalSearch = buildSearch(query)
  const hasActiveFilters =
  keyword !== '' ||
  selectedCategory !== ALL_CATEGORIES ||
  sort !== 'default' ||
  pageSize !== DEFAULT_PAGE_SIZE

  useEffect(() => {
    pendingSearch.current = null
  }, [location.key])

  useEffect(() => {
    // Kiểm tra danh mục và số trang sau khi catalog đã tải xong.
    if (!loading && !apiError && revalidationState !== 'loading' && location.search !== canonicalSearch) {
      setSearchParams(canonicalSearch, { replace: true })
    }
  }, [loading, apiError, revalidationState, location.search, canonicalSearch, setSearchParams])

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

  function clearFilters() {
    setInputDraft(null)
    updateParams({ q: '', category: ALL_CATEGORIES, sort: 'default', page: 1, pageSize: DEFAULT_PAGE_SIZE })
    searchInput.current?.focus()
  }

  function handleAddToCart(productId: string) {
    dispatch(addToCart(productId))
    const previousQuantity = cartItems.reduce(
      (sum, item) => item.productId === productId ? sum + item.quantity : sum,
      0,
    )
    setAddedProduct({ id: productId, count: previousQuantity + 1 })
  }

  return (
    <section className="menu-page">
      <Breadcrumb items={[{ label: 'Thực đơn' }]} />
      <header className="menu-page__heading">
        <p className="menu-page__eyebrow">Thực đơn LunchGo</p>
        <h1>Chọn món ngon cho hôm nay</h1>
        <p>Tìm kiếm, lọc và chọn những món ăn quen thuộc cho bữa trưa của bạn.</p>
      </header>

      {apiError && (
        <div className="alert alert-warning" role="alert">
          <p>Không thể tải thực đơn.</p>
          <button type="button" className="btn btn-outline-primary" disabled={revalidationState === 'loading'} onClick={() => void revalidate()}>
            {revalidationState === 'loading' ? 'Đang tải lại...' : 'Thử lại'}
          </button>
        </div>
      )}

      {!apiError && categoriesStatus === 'error' && (
        <div className="alert alert-warning">
          <p role="alert">Không thể tải danh mục. Bạn vẫn có thể tìm kiếm và chọn món trong thực đơn.</p>
          <button type="button" className="btn btn-outline-primary" disabled={revalidationState === 'loading'} onClick={() => void revalidate()}>
            {revalidationState === 'loading' ? 'Đang tải lại...' : 'Thử lại danh mục'}
          </button>
        </div>
      )}

      {revalidationState === 'loading' && (
        <p className="text-secondary" role="status">Đang tải lại dữ liệu...</p>
      )}


<div className="menu-page__filters">
  <div>
    <label htmlFor="menu-search">
      Tìm món ăn hoặc nguyên liệu
    </label>

    <div className="menu-search__input">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </svg>

      <input
        ref={searchInput}
        id="menu-search"
        type="search"
        className="form-control"
        placeholder="Tìm cơm, phở, bún, nguyên liệu..."
        value={inputValue}
        onChange={(e) => handleKeywordChange(e.target.value)}
        onCompositionStart={() => {
          composing.current = true
        }}
        onCompositionEnd={(e) => {
          composing.current = false
          handleKeywordChange(e.currentTarget.value)
        }}
      />
    </div>
  </div>

  <div>
    <label htmlFor="menu-category">Danh mục</label>

    <select
      id="menu-category"
      className="form-select"
      value={selectedCategory}
      onChange={(e) => handleCategoryChange(e.target.value)}
    >
      {categories.map((cat) => (
  <option key={cat} value={cat}>
    {CATEGORY_LABELS[cat] ?? cat}
  </option>
))}
    </select>
  </div>

  <div>
    <label htmlFor="menu-sort">Sắp xếp</label>

    <select
      id="menu-sort"
      className="form-select"
      value={sort}
      onChange={(e) => handleSortChange(e.target.value as SortOption)}
    >
      {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
        <option key={key} value={key}>
          {SORT_LABELS[key]}
        </option>
      ))}
    </select>
  </div>
</div>


      {loading && (
        <p className="text-secondary" role="status">Đang tải thực đơn...</p>
      )}

      {!loading && !apiError && sortedProducts.length === 0 && (
        <div className="menu-page__empty">

<span className="menu-page__empty-icon" aria-hidden="true">
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 5 5" />
  </svg>
</span>

          <div role="status">
            <h2>{products.length === 0 ? 'Thực đơn hiện chưa có món ăn.' : 'Không tìm thấy món ăn phù hợp.'}</h2>
            <p>{products.length === 0 ? 'Bạn vui lòng quay lại sau.' : 'Thử tìm tên món khác hoặc thay đổi danh mục.'}</p>
          </div>
           {hasActiveFilters && (
            <button type="button" className="site-button site-button--primary" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {!loading && !apiError && pagedProducts.length > 0 && (
        <>

<div className="menu-page__results">
  <div>
    <p className="menu-page__count" role="status">
      Tìm thấy {sortedProducts.length} món ăn
    </p>

    <p className="menu-page__result-description">
      {selectedCategory === ALL_CATEGORIES
  ? 'Tất cả danh mục'
  : CATEGORY_LABELS[selectedCategory] ?? selectedCategory}

      {keyword && ` · Từ khóa: "${keyword}"`}
    </p>
  </div>

  {hasActiveFilters && (
    <button
      type="button"
      className="menu-page__reset"
      onClick={clearFilters}
    >
      × Xóa bộ lọc
    </button>
  )}
</div>



          <div className="menu-page__grid">
            {pagedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={
                  categoryNamesById.get(product.categoryId ?? '') ??
                  product.category
                }
                menuHref={`/menu${canonicalSearch}`}
                onAddToCart={handleAddToCart}
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={authLoading ? undefined : toggleFavorite}
                statusMessage={
                  addedProduct?.id === product.id
                    ? `Đã thêm · ${addedProduct.count} phần ${product.name} trong giỏ.`
                    : undefined
                }
              />
            ))}
          </div>


        </>
      )}

      {!loading && !apiError && (
        <div className="menu-page__pagination">
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

         <div className="menu-page__page-size">
            <label htmlFor="page-size-select" className="text-secondary small mb-0">
              Mỗi trang:
            </label>
            <select
              id="page-size-select"
              className="form-select form-select-sm"
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
