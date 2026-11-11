import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let server, appStore, loaderModule, catalogModule, cartModule
before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  appStore = await server.ssrLoadModule('/src/app/store.ts')
  loaderModule = await server.ssrLoadModule('/src/features/catalog/catalogLoader.ts')
  catalogModule = await server.ssrLoadModule('/src/services/catalogService.ts')
  cartModule = await server.ssrLoadModule('/src/features/cart/cartSlice.ts')
})
after(async () => { await server?.close() })

test('concurrent loaders share one request and later navigations reuse the catalog', async () => {
  const store = appStore.createAppStore()
  const products = await catalogModule.getCatalog()
  const productId = products[0].id
  store.dispatch(cartModule.addToCart(productId))

  let calls = 0
  const load = loaderModule.createCatalogLoader(store, async () => {
    calls += 1
    return products
  })
  await Promise.all([load(), load()])
  await load()

  assert.equal(calls, 1)
  assert.equal(store.getState().catalog.status, 'ready')
  assert.equal(store.getState().catalog.products.length, 20)
  assert.deepEqual(store.getState().cart.items, [{ productId, quantity: 1 }])
})

test('catalog can retry after a source failure', async () => {
  const store = appStore.createAppStore()
  let shouldFail = true
  const load = loaderModule.createCatalogLoader(store, async () => {
    if (shouldFail) throw new Error('catalog unavailable')
    return catalogModule.getCatalog()
  })

  await load()
  assert.equal(store.getState().catalog.status, 'error')
  shouldFail = false
  await load()
  assert.equal(store.getState().catalog.status, 'ready')
  assert.equal(store.getState().catalog.products.length, 20)
})
