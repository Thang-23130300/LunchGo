import { useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectCurrentUser } from '@/features/auth/authSlice'

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
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const { pathname, search, hash } = useLocation()
  const accountMenu = useRef<HTMLDetailsElement>(null)
  const navigationState = { fromMenu: menuHref }
  const loginHref = /^\/login\/?$/i.test(pathname)
    ? '/login'
    : `/login?${new URLSearchParams({ returnTo: pathname + search + hash })}`
  const accountIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </svg>
  )

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
        <div className="site-header__actions">
          <Link
            className="site-cart-link"
            to="/cart"
            state={navigationState}
            aria-label={cartQuantity > 0 ? `Giỏ hàng (${cartQuantity} món)` : 'Giỏ hàng'}
          >
            <span aria-hidden="true">▣</span> <span className="site-cart-link__label">Giỏ hàng</span>
            {cartQuantity > 0 && <span className="site-cart-link__quantity" aria-hidden="true">{cartQuantity}</span>}
          </Link>
          {user ? (
            <details className="site-account-menu" ref={accountMenu} onKeyDown={(event) => {
              if (event.key === 'Escape' && accountMenu.current) {
                accountMenu.current.open = false
                accountMenu.current.querySelector('summary')?.focus()
              }
            }}>
              <summary className="site-account-link" aria-label={`Tài khoản ${user.username}`}>
                {accountIcon}<span className="site-account-link__label">Tài khoản</span>
              </summary>
              <div className="site-account-menu__panel">
                <strong>{user.firstName} {user.lastName}</strong>
                <p>@{user.username}</p>
                <Link
                  to="/orders"
                  className="site-button"
                  style={{ display: 'block', marginBottom: 8, textAlign: 'center', textDecoration: 'none' }}
                  onClick={() => { if (accountMenu.current) accountMenu.current.open = false }}
                >
                  Lịch sử mua hàng
                </Link>
                <button className="site-button" type="button" onClick={() => dispatch(logout())}>Đăng xuất</button>
              </div>
            </details>
          ) : (
            <Link className="site-account-link" to={loginHref} state={navigationState} aria-label="Tài khoản">
              {accountIcon}<span className="site-account-link__label">Tài khoản</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
