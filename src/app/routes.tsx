import { Route, Routes } from 'react-router'
import AdminLayout from '@/components/layouts/AdminLayout'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import AdminPage from '@/pages/AdminPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import HomePage from '@/pages/HomePage'
import MenuPage from '@/pages/MenuPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductPage from '@/pages/ProductPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
        <Route
          path="*"
          element={<NotFoundPage returnTo="/admin" returnLabel="Về trang quản trị" />}
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes
