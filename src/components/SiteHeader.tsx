import { Link, NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Trang chủ' },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/cart', label: 'Giỏ hàng' },
  { to: '/checkout', label: 'Thanh toán' },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/">
        LunchGo
      </Link>
      <nav className="site-nav" aria-label="Điều hướng chính">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default SiteHeader
