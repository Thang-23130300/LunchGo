import { Link, NavLink } from 'react-router'

const customerLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/cart', label: 'Giỏ hàng' },
  { to: '/checkout', label: 'Thanh toán' },
  { to: '/admin', label: 'Quản trị' },
]

const adminLinks = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/', label: 'Về cửa hàng' },
]

type SiteHeaderProps = {
  variant?: 'customer' | 'admin'
}

function SiteHeader({ variant = 'customer' }: SiteHeaderProps) {
  const isAdmin = variant === 'admin'
  const links = isAdmin ? adminLinks : customerLinks

  return (
    <header className="site-header">
      <Link className="site-brand" to={isAdmin ? '/admin' : '/'}>
        {isAdmin ? 'LunchGo Admin' : 'LunchGo'}
      </Link>
      <nav className="site-nav" aria-label={isAdmin ? 'Điều hướng quản trị' : 'Điều hướng chính'}>
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
