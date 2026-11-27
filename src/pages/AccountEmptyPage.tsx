import { Link, useOutletContext } from 'react-router'
import type { AccountContext } from '@/components/layouts/AccountLayout'

function AccountEmptyPage({ section }: { section: 'orders' | 'favorites' }) {
  const { menuHref } = useOutletContext<AccountContext>()
  const orders = section === 'orders'
  return (
    <div className="account-card account-empty" role="status">
      <h2>{orders ? 'Chưa có đơn hàng' : 'Chưa có món yêu thích'}</h2>
      <p>{orders ? 'Các đơn bạn đặt sẽ xuất hiện tại đây.' : 'Những món bạn lưu sẽ xuất hiện tại đây.'}</p>
      <Link className="site-button site-button--primary" to={menuHref}>{orders ? 'Đặt bữa trưa ngay' : 'Khám phá thực đơn'}</Link>
    </div>
  )
}

export default AccountEmptyPage
