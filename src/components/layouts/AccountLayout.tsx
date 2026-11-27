import { Navigate, NavLink, Outlet, Link, useLocation, useMatch, useNavigate, useOutletContext } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import Breadcrumb from '@/components/Breadcrumb'
import { logout, restoreSession, selectAuth } from '@/features/auth/authSlice'
import { accountLinks } from '@/features/account/accountNavigation'
import type { UserProfile } from '@/models/auth'
import '@/styles/account.scss'

export type AccountContext = { user: UserProfile; menuHref: string }

function AccountLayout() {
  const auth = useAppSelector(selectAuth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const menuHref = useOutletContext<string>()
  const isOrders = useMatch('/account/orders') !== null
  const isFavorites = useMatch('/account/favorites') !== null
  const title = isOrders ? 'Đơn hàng của tôi' : isFavorites ? 'Món yêu thích' : 'Tài khoản của tôi'
  usePageTitle(title)
  const loginHref = `/login?${new URLSearchParams({ returnTo: location.pathname + location.search + location.hash })}`

  if (auth.status === 'idle' || auth.status === 'loading') {
    return <p role="status">Đang khôi phục phiên đăng nhập…</p>
  }
  if (!auth.user && auth.tokens && auth.error) {
    return (
      <section className="account-state">
        <h1>Chưa thể tải tài khoản</h1>
        <p role="alert">{auth.error.message}</p>
        <div className="account-actions">
          <button className="site-button site-button--primary" type="button" onClick={() => void dispatch(restoreSession())}>Thử lại</button>
          <Link className="site-button" to={loginHref} state={{ fromMenu: menuHref }}>Đăng nhập lại</Link>
        </div>
      </section>
    )
  }
  if (!auth.user || auth.status !== 'authenticated') {
    return <Navigate to={loginHref} replace state={{ fromMenu: menuHref }} />
  }

  const section = isOrders ? 'Đơn hàng' : isFavorites ? 'Yêu thích' : null
  return (
    <section className="account-page" aria-labelledby="account-title">
      <Breadcrumb items={section ? [{ label: 'Tài khoản', to: '/account' }, { label: section }] : [{ label: 'Tài khoản' }]} />
      <header className="account-page__heading">
        <h1 id="account-title">{title}</h1>
        <p>{isOrders ? 'Lịch sử đơn hàng của tài khoản của bạn.' : isFavorites ? 'Các món bạn đã lưu để đặt lại khi cần.' : 'Thông tin dùng để đặt món và nhận hàng.'}</p>
      </header>
      <div className="account-page__grid">
        <aside className="account-sidebar">
          <h2>Tài khoản</h2>
          <nav aria-label="Điều hướng tài khoản">
            {accountLinks.map((item) => <NavLink key={item.to} {...item} state={{ fromMenu: menuHref }}>{item.label}</NavLink>)}
            <button type="button" onClick={() => {
              dispatch(logout())
              navigate('/login', { replace: true, state: { fromMenu: menuHref } })
            }}>Đăng xuất</button>
          </nav>
        </aside>
        <div className="account-page__main" key={auth.user.id}>
          <Outlet context={{ user: auth.user, menuHref } satisfies AccountContext} />
        </div>
      </div>
    </section>
  )
}

export default AccountLayout
