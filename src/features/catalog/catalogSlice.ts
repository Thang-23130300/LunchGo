import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LunchProduct } from '@/models/product'

type CatalogState = {
  products: LunchProduct[]
  status: 'idle' | 'ready' | 'error'
}

const initialState: CatalogState = { products: [], status: 'idle' }

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
  },
  selectors: {
    selectCatalog: (state) => state,
  },
})

export const { catalogLoaded, catalogLoadFailed } = catalogSlice.actions
export const { selectCatalog } = catalogSlice.selectors
export default catalogSlice.reducer
