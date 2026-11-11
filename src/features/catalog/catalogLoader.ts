import type { AppStore } from '@/app/store'
import { catalogLoaded, catalogLoadFailed, selectCatalog } from '@/features/catalog/catalogSlice'
import { getCatalog, type CatalogSource } from '@/services/catalogService'

export function createCatalogLoader(appStore: AppStore, source: CatalogSource = getCatalog) {
  let pending: Promise<null> | undefined

  async function load() {
    try {
      appStore.dispatch(catalogLoaded(await source()))
    } catch {
      appStore.dispatch(catalogLoadFailed())
    }
    return null
  }

  return function catalogLoader() {
    if (selectCatalog(appStore.getState()).status === 'ready') return null

    pending ??= load().finally(() => { pending = undefined })
    return pending
  }
}
