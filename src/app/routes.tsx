import { createBrowserRouter, createRoutesFromElements, Navigate, Route, useLocation, useOutletContext } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { store } from '@/app/store'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import { createCatalogLoader } from '@/features/catalog/catalogLoader'
import { MenuPage, ProductPage } from '@/features/discovery'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import LoginPage from '@/pages/LoginPage'
import AccountLayout, { type AccountContext } from '@/components/layouts/AccountLayout'
import AccountProfilePage from '@/pages/AccountProfilePage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import FavoritesPage from '@/pages/FavoritesPage'

const catalogLoader = createCatalogLoader(store)

function AccountSectionRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation()
  const { menuHref } = useOutletContext<AccountContext>()
  return <Navigate to={`${to}${search}${hash}`} replace state={{ fromMenu: menuHref }} />
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<CustomerLayout />}
      hydrateFallbackElement={
        <main className="site-shell">
          <div className="page-content page-content--inner" aria-busy="true">
            <p role="status">Đang tải dữ liệu LunchGo...</p>
          </div>
        </main>
      }
    >
      <Route index element={<HomePage />} loader={catalogLoader} />
      <Route path="menu" element={<MenuPage />} loader={catalogLoader} />
      <Route path="product/:id" element={<ProductPage />} loader={catalogLoader} />
      <Route path="cart" element={<CartPage />} loader={catalogLoader} />
      <Route path="checkout" element={<CheckoutPage />} loader={catalogLoader} />
      <Route path="login" element={<LoginPage />} />
      <Route path="account" element={<AccountLayout />}>
        <Route index element={<AccountProfilePage />} />
        <Route path="orders" element={<AccountSectionRedirect to="/orders" />} />
        <Route path="favorites" element={<AccountSectionRedirect to="/favorites" />} />
      </Route>
      <Route path="orders" element={<OrdersPage />} />
      <Route path="orders/:orderId" element={<OrderDetailPage />} />
      <Route path="favorites" element={<FavoritesPage />} loader={catalogLoader} />
      <Route path="*" element={<NotFoundPage />} loader={catalogLoader} />
    </Route>,
  ),
)

function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
