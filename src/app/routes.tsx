import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { store } from '@/app/store'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import { createCatalogLoader } from '@/features/catalog/catalogLoader'
import { MenuPage, ProductPage } from '@/features/discovery'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<CustomerLayout />}
      loader={createCatalogLoader(store)}
      hydrateFallbackElement={<p role="status">Đang tải dữ liệu...</p>}
    >
      <Route index element={<HomePage />} />
      <Route path="menu" element={<MenuPage />} />
      <Route path="product/:id" element={<ProductPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
)

function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
