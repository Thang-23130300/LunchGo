import { Outlet, useLocation, useMatch } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'

function CustomerLayout() {
  const location = useLocation()
  const isHome = useMatch('/') !== null
  const isMenu = useMatch('/menu') !== null
  const cartQuantity = useAppSelector((state) =>
    state.cart.items.reduce((quantity, item) => quantity + item.quantity, 0),
  )

  const fromMenu: unknown = (location.state as { fromMenu?: unknown } | null)?.fromMenu
  const savedMenuHref = typeof fromMenu === 'string' && (fromMenu === '/menu' || fromMenu.startsWith('/menu?'))
    ? fromMenu
    : '/menu'
  const menuHref = isMenu ? `/menu${location.search}` : savedMenuHref

  return (
    <div className="site-shell">
      <SiteHeader menuHref={menuHref} cartQuantity={cartQuantity} />
      <main className={isHome ? 'page-content' : 'page-content page-content--inner'}>
        <Outlet context={menuHref} />
      </main>
      <SiteFooter menuHref={menuHref} />
    </div>
  )
}

export default CustomerLayout
