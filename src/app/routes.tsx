import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { store } from '@/app/store'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import { createCatalogLoader } from '@/features/catalog/catalogLoader'
import { MenuPage, ProductPage } from '@/features/discovery'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'

const catalogLoader = createCatalogLoader(store)

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
      <Route path="orders" element={<OrdersPage />} />
      <Route path="orders/:orderId" element={<OrderDetailPage />} />
      <Route path="*" element={<NotFoundPage />} loader={catalogLoader} />
    </Route>,
  ),
)

function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
