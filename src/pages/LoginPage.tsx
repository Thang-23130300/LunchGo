import { Navigate, useOutletContext, useSearchParams } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import Breadcrumb from '@/components/Breadcrumb'
import { selectIsAuthenticated, selectIsRestoringSession } from '@/features/auth/authSlice'
import { getLoginDestination } from '@/features/auth/loginForm'
import { useLoginForm } from '@/features/auth/useLoginForm'
import '@/styles/login.scss'

function LoginPage() {
  usePageTitle('Đăng nhập')
  const [searchParams] = useSearchParams()
  const menuHref = useOutletContext<string>()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const restoring = useAppSelector(selectIsRestoringSession)
  const {
    fields, fieldErrors, loading, error, showPassword, setShowPassword,
    usernameRef, passwordRef, errorRef, changeField, blurField, fillDemoCredentials, submit,
  } = useLoginForm()
  const destination = getLoginDestination(searchParams.get('returnTo'))
  const invalidCredentials = error?.code === 'INVALID_CREDENTIALS'

  if (isAuthenticated) return <Navigate to={destination} replace state={{ fromMenu: menuHref }} />

  return (
    <section className="login-page" aria-labelledby="login-title">
      <Breadcrumb items={[{ label: 'Đăng nhập' }]} />
      <div className="login-page__content">
        <h1 id="login-title">Đăng nhập</h1>
        {loading && <p className="visually-hidden" role="status">{restoring ? 'Đang khôi phục phiên đăng nhập…' : 'Đang đăng nhập…'}</p>}
        <form className="login-form" aria-label="Đăng nhập LunchGo" aria-busy={loading} noValidate onSubmit={submit}>
          <div className="login-form__field">
            <label htmlFor="login-username">Tên đăng nhập</label>
            <input
              ref={usernameRef}
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={fields.username}
              disabled={loading}
              aria-invalid={!!fieldErrors.username || invalidCredentials || undefined}
              aria-describedby={fieldErrors.username ? 'login-username-error' : invalidCredentials ? 'login-api-error' : undefined}
              onChange={(event) => changeField('username', event.target.value)}
              onBlur={() => blurField('username')}
            />
            {fieldErrors.username && <p className="login-form__field-error" id="login-username-error">{fieldErrors.username}</p>}
          </div>
          <div className="login-form__field">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="login-form__password">
              <input
                ref={passwordRef}
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={fields.password}
                disabled={loading}
                aria-invalid={!!fieldErrors.password || invalidCredentials || undefined}
                aria-describedby={fieldErrors.password ? 'login-password-error' : invalidCredentials ? 'login-api-error' : undefined}
                onChange={(event) => changeField('password', event.target.value)}
                onBlur={() => blurField('password')}
              />
              <button
                className="login-form__toggle"
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                aria-controls="login-password"
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="2.5" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
            {fieldErrors.password && <p className="login-form__field-error" id="login-password-error">{fieldErrors.password}</p>}
          </div>
          <button className="site-button site-button--primary login-form__submit" type="submit" disabled={loading}>
            {restoring ? 'Đang khôi phục phiên…' : loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
          {error ? (
            <div ref={errorRef} className="login-form__error" id="login-api-error" role="alert" tabIndex={-1}>
              <p>{error.message}</p>
              <button className="site-button" type="submit" disabled={loading}>Thử lại</button>
            </div>
          ) : (
            <>
              <p className="login-form__demo">Tài khoản demo: <strong>emilys</strong><br />Mật khẩu: <strong>emilyspass</strong></p>
              <button className="site-button login-form__demo-button" type="button" disabled={loading} onClick={fillDemoCredentials}>
                Dùng tài khoản demo
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

export default LoginPage

