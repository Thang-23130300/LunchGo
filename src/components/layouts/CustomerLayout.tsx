import { Outlet } from 'react-router'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'

function CustomerLayout() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default CustomerLayout
