import { useEffect, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import type { LunchProduct } from '@/models/product'
import bunBoImage from '@/assets/home/bunbo.webp'
import '@/styles/home.scss'

const categoryOrder = ['Cơm', 'Món nước', 'Món bún', 'Bánh mì']
const featuredCategories = ['Món nước', 'Cơm', 'Món bún', 'Bánh mì']
const priceFormatter = new Intl.NumberFormat('vi-VN')

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

function SuggestedDish({ product, menuHref }: { product: LunchProduct; menuHref: string }) {
  const catalogHasPhoto = product.image && !product.image.startsWith('https://placehold.co/')
  const image = catalogHasPhoto ? product.image : bunBoImage

  return (
    <article className="home-dish">
      <div className="home-dish__art">
        <img src={image} alt="" width="500" height="360" loading="lazy" />
      </div>
      <div className="home-dish__body">
        <p className="home-eyebrow">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="home-dish__ingredients">{product.ingredients.join(', ')}</p>
        <div className="home-dish__bottom">
          <strong>{priceFormatter.format(product.price)}đ</strong>
          <Link
            to={`/product/${encodeURIComponent(product.id)}`}
            state={{ fromMenu: menuHref }}
            aria-label={`Xem chi tiết ${product.name}`}
          >
            Xem chi tiết <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

function HomePage() {
  const { products, status } = useAppSelector(selectCatalog)
  const navigate = useNavigate()
  const { hash, key } = useLocation()
  const menuHref = useOutletContext<string>()

  const catalogCategories = new Set(products.map(({ category }) => category))
  const categories = [...new Set([...categoryOrder, ...catalogCategories])]
    .filter((category) => catalogCategories.has(category))
    .slice(0, 4)
  const availableProducts = products.filter(({ isAvailable }) => isAvailable)
  const featured = featuredCategories
    .map((category) => availableProducts.find((product) => product.category === category))
    .filter((product) => product !== undefined)
  const suggestions = [...new Set([...featured, ...availableProducts])].slice(0, 4)

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
              {products.length > 0 && `${products.length} món demo · `}Chọn món theo danh mục và mức giá
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
                <input id="home-search" name="q" type="search" placeholder="Bạn muốn ăn gì hôm nay?" />
                <button className="home-button home-button--primary" type="submit">Tìm món</button>
              </div>
            </form>
            <Link className="home-text-link" to="/menu">Xem toàn bộ thực đơn <span aria-hidden="true">↗</span></Link>
          </div>
          {categories.length > 0 && (
            <ul className="home-grid home-categories">
              {categories.map((category) => (
                <li key={category}>
                  <Link className="home-category" to={`/menu?${new URLSearchParams({ category })}`}>
                    <strong>{category}</strong>
                    <span aria-hidden="true">↗</span>
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
              <h2 id="home-featured-title">Món ngon bạn có thể chọn</h2>
              <p className="home-section-description">Một vài món ăn có sẵn trong thực đơn LunchGo.</p>
            </div>
            <Link className="home-text-link" to="/menu">Xem tất cả món <span aria-hidden="true">↗</span></Link>
          </div>
          {status === 'idle' && <p role="status">Đang tải món gợi ý...</p>}
          {status === 'error' && <p role="status">Không thể tải món gợi ý.</p>}
          {status === 'ready' && suggestions.length === 0 && <p>Hiện chưa có món gợi ý.</p>}
          {suggestions.length > 0 && (
            <div className="home-grid">
              {suggestions.map((product) => <SuggestedDish key={product.id} product={product} menuHref={menuHref} />)}
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
