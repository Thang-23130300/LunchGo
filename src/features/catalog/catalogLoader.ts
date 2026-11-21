import type { AppStore } from '@/app/store'
import type { Category } from '@/models'
import { getCategories } from '@/api/categories'
import { catalogLoaded, catalogLoadFailed, categoriesLoaded, categoriesLoadFailed, selectCatalog } from '@/features/catalog/catalogSlice'
import { getCatalog, type CatalogSource } from '@/services/catalogService'

export function createCatalogLoader(
  appStore: AppStore,
  source: CatalogSource = getCatalog,
  categoriesSource: () => Promise<Category[]> = getCategories,
) {
  let pending: Promise<null> | undefined

  async function loadProducts() {
    if (selectCatalog(appStore.getState()).status === 'ready') return

    try {
      appStore.dispatch(catalogLoaded(await source()))
    } catch {
      appStore.dispatch(catalogLoadFailed())
    }
  }

  async function loadCategories() {
    if (selectCatalog(appStore.getState()).categoriesStatus === 'ready') return

    try {
      appStore.dispatch(categoriesLoaded(await categoriesSource()))
    } catch {
      appStore.dispatch(categoriesLoadFailed())
    }
  }

  return function catalogLoader() {
    const catalog = selectCatalog(appStore.getState())
    if (catalog.status === 'ready' && catalog.categoriesStatus === 'ready') return null

    pending ??= Promise.all([loadProducts(), loadCategories()])
      .then(() => null)
      .finally(() => { pending = undefined })
    return pending
  }
}
