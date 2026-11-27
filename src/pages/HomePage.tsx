import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useRevalidator } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import ProductCard from '@/components/ProductCard'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store'
import { addToCart } from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import bunBoImage from '@/assets/home/bunbo.webp'
import '@/styles/home.scss'
import { useFavorites } from '@/features/favorites/useFavorites'

const benefits = [
  { icon: '☷', title: 'Thực đơn dễ tìm', description: 'Tìm kiếm, lọc và sắp xếp' },
  { icon: '▣', title: 'Giỏ hàng tiện lợi', description: 'Tăng, giảm hoặc xóa món' },
  { icon: '✓', title: 'Thanh toán COD', description: 'Xác nhận đơn hàng mô phỏng' },
]

const orderSteps = [
  { title: 'Chọn món yêu thích', description: 'Vào thực đơn, lọc danh mục, xem chi tiết rồi chọn món phù hợp cho bữa trưa.' },
  { title: 'Kiểm tra giỏ hàng', description: 'Xem những món đã chọn, thay đổi số lượng và kiểm tra tổng tiền trước khi đặt hàng.' },
  { title: 'Xác nhận đơn COD', description: 'Điền thông tin người nhận, chọn COD mô phỏng và xác nhận để nhận mã đơn.' },
]

function HomePage() {
  usePageTitle()
  const dispatch = useDispatch<AppDispatch>()
  const { isFavorite, toggleFavorite, authLoading } = useFavorites()
  const { products, status, categories, categoriesStatus } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()
  const navigate = useNavigate()
  const { hash, key } = useLocation()
  const menuHref = useOutletContext<string>()
  const cartItems = useAppSelector((state) => state.cart.items)

  const [addedProduct, setAddedProduct] = useState<{
    id: string
    count: number
  } | null>(null)

  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name]),
  )

  function handleAddToCart(productId: string) {
    const previousQuantity = cartItems
      .filter((item) => item.productId === productId)
      .reduce((total, item) => total + item.quantity, 0)

    dispatch(addToCart(productId))

    setAddedProduct({
      id: productId,
      count: previousQuantity + 1,
    })
  }

  const featuredProducts = products.filter((product) => product.isFeatured && product.isAvailable).slice(0, 4)

  useEffect(() => {
    if (hash === '#cach-dat-mon' || hash === '#mon-goi-y') {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    }
  }, [hash, key])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const q = String(formData.get('q') ?? '').normalize('NFC').trim()
    navigate(q ? `/menu?${new URLSearchParams({ q })}` : '/menu')
  }

  return (
    <div className="home-page">
      <div className="site-container">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
            <p className="home-eyebrow home-hero__eyebrow">Bữa trưa dành cho bạn</p>
            <h1 id="home-title">Bữa trưa ngon,<br /><span>chọn món thật dễ.</span></h1>
            <p className="home-hero__description">
              Từ món cơm quen thuộc đến tô phở nóng hổi, LunchGo giúp bạn tìm và đặt món ăn trưa chỉ trong vài bước đơn giản.
            </p>
            <div className="home-hero__actions">
              <Link className="home-button home-button--primary" to="/menu">
                Khám phá thực đơn <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-button" to="#cach-dat-mon" state={{ fromMenu: menuHref }}>
                Cách đặt món <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="home-hero__fact">
              {status === 'ready' && `${products.length} món trong thực đơn · `}Chọn món theo danh mục và mức giá
            </p>
          </div>
          <div className="home-hero__art">
            <img src={bunBoImage} alt="" width="600" height="563" />
            <p className="home-hero__note"><small>Món quen mỗi ngày</small><strong>Ăn ngon, dễ chọn</strong></p>
          </div>
        </section>

        <ul className="home-benefits">
          {benefits.map(({ icon, title, description }) => (
            <li key={title}>
              <span className="home-benefits__icon" aria-hidden="true">{icon}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ul>

        <section className="home-discover" aria-labelledby="home-discover-title">
          <p className="home-eyebrow">Khám phá danh mục</p>
          <h2 id="home-discover-title">Hôm nay bạn muốn ăn gì?</h2>
          <p className="home-section-description">Bắt đầu từ những món quen thuộc trong thực đơn LunchGo.</p>
          <div className="home-discover__actions">
            <form className="home-search" role="search" onSubmit={handleSearch}>
              <label htmlFor="home-search">Tìm món ăn yêu thích</label>
              <div className="home-search__fields">

                <div className="home-search__input">
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
                    id="home-search"
                    name="q"
                    type="search"
                    placeholder="Tìm cơm, phở, bún, đồ uống..."
                    autoComplete="off"
                  />
                </div>

                <button className="home-button home-button--primary" type="submit">Tìm món</button>
              </div>
            </form>
            <Link className="home-text-link" to="/menu">Xem toàn bộ thực đơn <span aria-hidden="true">↗</span></Link>
          </div>
          {categoriesStatus === 'idle' && <p role="status">Đang tải danh mục...</p>}
          {categoriesStatus === 'error' && (
            <div className="home-data-error">
              <p role="alert">Không thể tải danh mục.</p>
              <button className="home-button" type="button" disabled={revalidationState === 'loading'} onClick={() => void revalidate()}>
                {revalidationState === 'loading' ? 'Đang tải lại...' : 'Thử lại danh mục'}
              </button>
            </div>
          )}
          {revalidationState === 'loading' && categoriesStatus === 'error' && <p role="status">Đang tải lại danh mục...</p>}
          {categoriesStatus === 'ready' && categories.length === 0 && <p role="status">Hiện chưa có danh mục.</p>}
          {categoriesStatus === 'ready' && categories.length > 0 && (
            <ul className="home-grid home-categories">
              {categories.map((category) => (
                <li key={category.id}>

                  <Link
                    className="home-category"
                    to={`/menu?${new URLSearchParams({
                      category: category.name,
                    })}`}
                  >
                    <div className="home-category__content">
                      <strong>{category.name}</strong>
                      <small>Khám phá thực đơn</small>
                    </div>

                    <span className="home-category__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>

                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="home-featured" id="mon-goi-y" aria-labelledby="home-featured-title">
          <p className="home-eyebrow">Gợi ý cho bữa trưa</p>
          <div className="home-featured__heading">
            <div>
              <h2 id="home-featured-title">Sản phẩm nổi bật</h2>
              <p className="home-section-description">Những món ăn nổi bật có sẵn trong thực đơn LunchGo.</p>
            </div>
            <Link className="home-text-link" to="/menu">Xem tất cả món <span aria-hidden="true">↗</span></Link>
          </div>
          {status === 'idle' && <p role="status">Đang tải sản phẩm nổi bật...</p>}
          {status === 'error' && (
            <div className="home-data-error">
              <p role="alert">Không thể tải sản phẩm nổi bật.</p>
              <button className="home-button" type="button" disabled={revalidationState === 'loading'} onClick={() => void revalidate()}>
                {revalidationState === 'loading' ? 'Đang tải lại...' : 'Thử lại sản phẩm'}
              </button>
            </div>
          )}
          {revalidationState === 'loading' && status === 'error' && <p role="status">Đang tải lại sản phẩm nổi bật...</p>}
          {status === 'ready' && featuredProducts.length === 0 && (
            <p role="status">{products.length === 0 ? 'Thực đơn hiện chưa có món ăn.' : 'Hiện chưa có sản phẩm nổi bật.'}</p>
          )}
          {status === 'ready' && featuredProducts.length > 0 && (
            <div className="home-grid">

              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    categoryNamesById.get(product.categoryId ?? '') ??
                    product.category
                  }
                  menuHref={menuHref}
                  onAddToCart={handleAddToCart}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={authLoading ? undefined : toggleFavorite}
                  statusMessage={
                    addedProduct?.id === product.id
                      ? `Đã thêm · ${addedProduct.count} phần trong giỏ.`
                      : undefined
                  }
                />
              ))}

            </div>
          )}
          <Link className="home-button home-featured__more" to="/menu">
            Xem thêm trong thực đơn <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="home-order" id="cach-dat-mon" aria-labelledby="home-order-title">
          <p className="home-eyebrow">Quy trình đặt món</p>
          <h2 id="home-order-title">Chỉ với ba bước đơn giản</h2>
          <ol className="home-order__steps">
            {orderSteps.map(({ title, description }, index) => (
              <li key={title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-menu-cta" aria-labelledby="home-menu-cta-title">
          <div>
            <h2 id="home-menu-cta-title">Một bữa trưa ngon bắt đầu từ lựa chọn đơn giản.</h2>
            <p>Mở thực đơn và khám phá những món ăn quen thuộc của bạn.</p>
          </div>
          <Link className="home-button" to="/menu">Đến thực đơn <span aria-hidden="true">↗</span></Link>
        </section>
      </div>
    </div>
  )
}

export default HomePage
