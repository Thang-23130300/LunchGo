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
      <div className="site-container site-header__inner">
        <Link className="site-brand" to="/" state={navigationState} aria-label="LunchGo">
          <span className="site-brand__mark" aria-hidden="true">↗</span>
          <span>Lunch <span className="site-brand__accent">Go.</span></span>
        </Link>
        <nav className="site-nav" aria-label="Điều hướng chính">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to === '/menu' ? menuHref : to}
              state={navigationState}
              end
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link
          className="site-cart-link"
          to="/cart"
          state={navigationState}
          aria-label={cartQuantity > 0 ? `Giỏ hàng (${cartQuantity} món)` : undefined}
        >
          <span aria-hidden="true">▣</span> Giỏ hàng
          {cartQuantity > 0 && <span className="site-cart-link__quantity" aria-hidden="true">{cartQuantity}</span>}
        </Link>
      </div>
    </header>
  )
}

export default SiteHeader
