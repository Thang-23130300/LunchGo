import { Outlet } from 'react-router'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'

function AdminLayout() {
  return (
    <div className="site-shell">
      <SiteHeader variant="admin" />
      <main className="page-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default AdminLayout
