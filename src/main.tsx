import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import '@/styles/main.scss'
import { store } from '@/app/store'
import App from '@/App.tsx'
import { restoreSession } from '@/features/auth/authSlice'

void store.dispatch(restoreSession())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
