
import { Link, useOutletContext, useRevalidator } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { addToCart } from '@/features/cart/cartSlice'
import { useFavorites } from '@/features/favorites/useFavorites'
import Breadcrumb from '@/components/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import '@/styles/favorites.scss'

function FavoritesPage() {
  usePageTitle('Món yêu thích')

  const dispatch = useAppDispatch()
  const menuHref = useOutletContext<string>()
  const { products, categories, status } = useAppSelector(selectCatalog)
  const { revalidate, state } = useRevalidator()

  const {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isAuthenticated,
    authLoading,
  } = useFavorites()

  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(product.id),
  )

  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name]),
  )

  return (
    <section className="favorites-page">
      <Breadcrumb items={[{ label: 'Món yêu thích' }]} />

      <div className="favorites-page__header">
        <h1>Món yêu thích</h1>
        <p>Lưu giữ những món ăn bạn yêu thích tại LunchGo.</p>
      </div>

      {authLoading ? (
        <p role="status">Đang kiểm tra tài khoản...</p>
      ) : !isAuthenticated ? (
        <div className="favorites-empty">
          <span className="favorites-empty__icon">♡</span>

          <h2>Bạn chưa đăng nhập</h2>

          <p>Vui lòng đăng nhập để xem danh sách yêu thích.</p>

          <Link
            to="/login?returnTo=%2Ffavorites"
            className="site-button site-button--primary"
          >
            Đăng nhập
          </Link>
        </div>
      ) : status === 'error' ? (
        <div className="favorites-empty">
          <h2>Không thể tải danh sách món ăn</h2>

          <button
            type="button"
            className="site-button"
            disabled={state === 'loading'}
            onClick={() => void revalidate()}
          >
            {state === 'loading' ? 'Đang tải lại...' : 'Thử lại'}
          </button>
        </div>
      ) : status === 'idle' || state === 'loading' ? (
        <p role="status">Đang tải danh sách món ăn...</p>
      ) : favoriteProducts.length === 0 ? (
        <div className="favorites-empty">
          <span className="favorites-empty__icon">♡</span>

          <h2>Chưa có món yêu thích</h2>

          <p>
            Hãy khám phá thực đơn và lưu lại những món
            ăn mà bạn yêu thích.
          </p>

          <Link
            to={menuHref}
            className="site-button site-button--primary"
          >
            Khám phá thực đơn →
          </Link>
        </div>
      ) : (
        <>
          <p className="favorites-page__count">
            {favoriteProducts.length} món yêu thích
          </p>

          <div className="favorites-page__grid">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={
                  categoryNamesById.get(product.categoryId ?? '') ??
                  product.category
                }
                menuHref={menuHref}
                onAddToCart={(productId) =>
                  dispatch(addToCart(productId))
                }
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default FavoritesPage