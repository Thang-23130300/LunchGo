import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

function createMemoryStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
  }
}

let server, createAppStore, clearCart, cartKey, catalog
before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null } })
  const storeModule = await server.ssrLoadModule('/src/app/store.ts')
  const cartModule = await server.ssrLoadModule('/src/features/cart/cartSlice.ts')
  const storageModule = await server.ssrLoadModule('/src/features/cart/cartStorage.ts')
  createAppStore = storeModule.createAppStore
  clearCart = cartModule.clearCart
  cartKey = storageModule.CART_STORAGE_KEY
  catalog = await server.ssrLoadModule('/src/services/catalogService.ts')
})
after(async () => { await server?.close() })

const productId = 'local:550e8400-e29b-41d4-a716-446655440001'
const cart = { version: 1, items: [{ productId, quantity: 2 }] }

test('cart is restored on a fresh store, and clearing persists', () => {
  const storage = createMemoryStorage()
  storage.setItem(cartKey, JSON.stringify(cart))
  const first = createAppStore(storage)
  assert.deepEqual(first.getState().cart.items, cart.items)
  assert.deepEqual(createAppStore(storage).getState().cart.items, cart.items)
  first.dispatch(clearCart())
  assert.deepEqual(createAppStore(storage).getState().cart.items, [])
})

test('invalid cart payloads reset to a usable empty cart', () => {
  const storage = createMemoryStorage()
  assert.deepEqual(createAppStore(storage).getState().cart.items, [])
  const invalidCarts = [
    '{broken', 'null', JSON.stringify({ ...cart, version: 2 }),
    JSON.stringify({ ...cart, items: [...cart.items, ...cart.items] }),
    JSON.stringify({ ...cart, items: [{ productId, quantity: 0 }] }),
  ]
  for (const raw of invalidCarts) {
    storage.setItem(cartKey, raw)
    assert.deepEqual(createAppStore(storage).getState().cart.items, [])
    assert.deepEqual(JSON.parse(storage.getItem(cartKey)), { version: 1, items: [] })
  }
})

test('blocked storage leaves Redux and the catalog usable', async () => {
  const blocked = {
    getItem() { throw new Error('access denied') },
    setItem() { throw new Error('quota exceeded') },
  }
  const store = createAppStore(blocked)
  store.dispatch(clearCart())
  assert.deepEqual(store.getState().cart.items, [])
  assert.equal((await catalog.getCatalog(blocked)).length, 20)
})

test('bad, stale or edited caches are rebuilt from the authoritative seed', async () => {
  const storage = createMemoryStorage()
  const key = catalog.CATALOG_CACHE_KEY
  const products = await catalog.getCatalog(storage)
  const edited = structuredClone(products)
  edited[0].price = 1
  const invalidCaches = [
    '{broken', JSON.stringify({ version: 'old', products }),
    JSON.stringify({ version: catalog.CATALOG_VERSION, products: [] }),
    JSON.stringify({ version: catalog.CATALOG_VERSION, products: edited }),
  ]
  for (const raw of invalidCaches) {
    storage.setItem(key, raw)
    assert.deepEqual(await catalog.getCatalog(storage), products)
    assert.deepEqual(JSON.parse(storage.getItem(key)), { version: catalog.CATALOG_VERSION, products })
  }
  const cached = await catalog.getCatalog(storage)
  cached[0].ingredients.push('new ingredient')
  assert.deepEqual(await catalog.getCatalog(storage), products)
})

test('independent storage keeps carts separate and catalog data identical', async () => {
  const left = createMemoryStorage()
  const right = createMemoryStorage()
  left.setItem(cartKey, JSON.stringify(cart))
  assert.deepEqual(createAppStore(left).getState().cart.items, cart.items)
  assert.deepEqual(createAppStore(right).getState().cart.items, [])
  assert.deepEqual(await catalog.getCatalog(left), await catalog.getCatalog(right))
})
