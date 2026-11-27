import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchUserProfile, selectProfileError, selectProfileStatus } from '@/features/auth/authSlice'
import { getAccountContact, saveProfileExtras, validateProfileExtras, type ProfileFieldErrors } from '@/features/account/accountProfile'
import type { AccountContext } from '@/components/layouts/AccountLayout'
import type { UserProfile } from '@/models/auth'

function AccountAvatar({ user }: { user: UserProfile }) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || user.username.charAt(0).toUpperCase()
  return user.image && failedSource !== user.image
    ? <img className="account-avatar" src={user.image} alt="" width="64" height="64" onError={() => setFailedSource(user.image)} />
    : <span className="account-avatar account-avatar--fallback" aria-hidden="true">{initials}</span>
}

function ProfileDetails({ user, menuHref }: AccountContext) {
  const [saved, setSaved] = useState(() => getAccountContact(user))
  const [values, setValues] = useState(saved)
  const [errors, setErrors] = useState<ProfileFieldErrors>({})
  const [result, setResult] = useState<'saved' | 'failed' | null>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateProfileExtras(values)
    setErrors(validation)
    setResult(null)
    if (validation.phone || validation.address) {
      if (validation.phone) phoneRef.current?.focus()
      else addressRef.current?.focus()
      return
    }
    const next = { phone: values.phone.trim(), address: values.address.trim() }
    if (saveProfileExtras(user.id, next)) {
      setSaved(next)
      setValues(next)
      setResult('saved')
    } else setResult('failed')
  }

  return (
    <>
      <article className="account-card" aria-labelledby="profile-name">
        <div className="account-profile__identity">
          <AccountAvatar user={user} />
          <div><h2 id="profile-name">{user.firstName} {user.lastName}</h2><p>@{user.username}</p></div>
        </div>
        <dl className="account-profile__details">
          <dt>Email</dt><dd>{user.email || 'Chưa bổ sung'}</dd>
          <dt>Điện thoại</dt><dd>{saved.phone || 'Chưa bổ sung'}</dd>
          <dt>Địa chỉ mặc định</dt><dd>{saved.address || 'Chưa bổ sung'}</dd>
        </dl>
      </article>
      <section className="account-card account-profile__edit" aria-labelledby="profile-edit-title">
        <h2 id="profile-edit-title">Thông tin bổ sung</h2>
        <p>Cập nhật thông tin liên hệ và địa chỉ nhận hàng của bạn.</p>
        <form aria-label="Cập nhật thông tin bổ sung" noValidate onSubmit={save}>
          <div className="account-form__field">
            <label htmlFor="account-phone">Số điện thoại</label>
            <input id="account-phone" ref={phoneRef} name="phone" type="tel" autoComplete="tel" value={values.phone}
              aria-invalid={!!errors.phone || undefined} aria-describedby={errors.phone ? 'account-phone-error' : undefined}
              onChange={(event) => { setValues({ ...values, phone: event.target.value }); setErrors({ ...errors, phone: undefined }); setResult(null) }} />
            {errors.phone && <p id="account-phone-error" className="account-form__error">{errors.phone}</p>}
          </div>
          <div className="account-form__field">
            <label htmlFor="account-address">Địa chỉ mặc định</label>
            <textarea id="account-address" ref={addressRef} name="address" autoComplete="street-address" rows={3} value={values.address}
              aria-invalid={!!errors.address || undefined} aria-describedby={errors.address ? 'account-address-error' : undefined}
              onChange={(event) => { setValues({ ...values, address: event.target.value }); setErrors({ ...errors, address: undefined }); setResult(null) }} />
            {errors.address && <p id="account-address-error" className="account-form__error">{errors.address}</p>}
          </div>
          <p className="account-form__note">Thông tin được lưu trên trình duyệt này cho tài khoản @{user.username}.</p>
          <button className="site-button site-button--primary" type="submit">Lưu thay đổi</button>
          {result === 'saved' && <p className="account-form__success" role="status">Đã lưu thông tin bổ sung.</p>}
          {result === 'failed' && <p className="account-form__error" role="alert">Không thể lưu thông tin trên thiết bị này. Vui lòng thử lại.</p>}
        </form>
      </section>
      <div className="account-actions">
        <Link className="site-button" to="/account/orders" state={{ fromMenu: menuHref }}>Xem đơn hàng</Link>
        <Link className="site-button" to="/account/favorites" state={{ fromMenu: menuHref }}>Xem món yêu thích</Link>
      </div>
    </>
  )
}

function AccountProfilePage() {
  const { user, menuHref } = useOutletContext<AccountContext>()
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectProfileStatus)
  const error = useAppSelector(selectProfileError)
  useEffect(() => { if (status === 'idle') void dispatch(fetchUserProfile()) }, [dispatch, status])

  if (status === 'idle' || status === 'loading') return <div className="account-card" aria-busy="true"><p role="status">Đang tải hồ sơ tài khoản…</p></div>
  if (status === 'error') return (
    <div className="account-card">
      <p role="alert">{error?.message ?? 'Không thể tải hồ sơ tài khoản.'}</p>
      <button className="site-button" type="button" onClick={() => void dispatch(fetchUserProfile())}>Thử lại hồ sơ</button>
    </div>
  )
  return <ProfileDetails key={user.id} user={user} menuHref={menuHref} />
}

export default AccountProfilePage
