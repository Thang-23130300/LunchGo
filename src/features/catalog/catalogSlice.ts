import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Category, LunchProduct } from '@/models/product'

type CatalogState = {
  products: LunchProduct[]
  status: 'idle' | 'ready' | 'error'
  categories: Category[]
  categoriesStatus: 'idle' | 'ready' | 'error'
}

const initialState: CatalogState = {
  products: [],
  status: 'idle',
  categories: [],
  categoriesStatus: 'idle',
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    catalogLoaded(state, action: PayloadAction<LunchProduct[]>) {
      state.products = action.payload
      state.status = 'ready'
    },
    catalogLoadFailed(state) {
      state.status = 'error'
    },
    categoriesLoaded(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload
      state.categoriesStatus = 'ready'
    },
    categoriesLoadFailed(state) {
      state.categoriesStatus = 'error'
    },
  },
  selectors: {
    selectCatalog: (state) => state,
  },
})

export const { catalogLoaded, catalogLoadFailed, categoriesLoaded, categoriesLoadFailed } = catalogSlice.actions
export const { selectCatalog } = catalogSlice.selectors
export default catalogSlice.reducer
