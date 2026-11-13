import { Link, NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Trang chủ' },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/cart', label: 'Giỏ hàng' },
  { to: '/checkout', label: 'Thanh toán' },
]

type SiteHeaderProps = {
  menuHref: string
  cartQuantity: number
}

function SiteHeader({ menuHref, cartQuantity }: SiteHeaderProps) {
  const navigationState = { fromMenu: menuHref }

  return (
    <header className="site-header">
      <Link className="site-brand" to="/" state={navigationState}>
        LunchGo
      </Link>
      <nav className="site-nav" aria-label="Điều hướng chính">
        {links.map(({ to, label }) => {
          const showCartQuantity = to === '/cart' && cartQuantity > 0

          return (
            <NavLink
              key={to}
              to={to === '/menu' ? menuHref : to}
              state={navigationState}
              aria-label={showCartQuantity ? `${label} (${cartQuantity} món)` : undefined}
              end
            >
              {label}
              {showCartQuantity && (
                <span className="badge text-bg-primary ms-1" aria-hidden="true">{cartQuantity}</span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}

export default SiteHeader
