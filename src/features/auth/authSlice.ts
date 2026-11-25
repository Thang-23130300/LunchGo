import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { authService, AuthError } from '@/services/authService'
import type { AuthFailure, AuthSession, AuthStatus, AuthTokens, LoginCredentials, UserProfile } from '@/models/auth'

export interface AuthState {
  user: UserProfile | null
  tokens: AuthTokens | null
  status: AuthStatus
  error: AuthFailure | null
  currentRequestId: string | null
  requestKind: 'login' | 'restore' | null
}

export function createInitialAuthState(tokens: AuthTokens | null = null): AuthState {
  return {
    user: null,
    tokens,
    status: tokens ? 'idle' : 'unauthenticated',
    error: null,
    currentRequestId: null,
    requestKind: null,
  }
}

type AuthRejection = { error: AuthFailure; tokens: AuthTokens | null }
const createAuthThunk = createAsyncThunk.withTypes<{
  state: { auth: AuthState }
  rejectValue: AuthRejection
}>()

function toAuthFailure(error: unknown): AuthFailure {
  if (error instanceof AuthError) {
    return { code: error.code, message: error.message, ...(error.status !== undefined ? { status: error.status } : {}) }
  }
  return { code: 'NETWORK_ERROR', message: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.' }
}

export const login = createAuthThunk<AuthSession, LoginCredentials>(
  'auth/login',
  async (credentials, { signal, rejectWithValue }) => {
    try {
      return await authService.login(credentials, signal)
    } catch (error) {
      return rejectWithValue({ error: toAuthFailure(error), tokens: null })
    }
  },
  { condition: (_, { getState }) => !getState().auth.currentRequestId },
)

export const restoreSession = createAuthThunk<AuthSession | null, void>(
  'auth/restoreSession',
  async (_, { signal, getState, requestId, rejectWithValue }) => {
    let tokens = getState().auth.tokens
    if (!tokens) return null
    try {
      let user: UserProfile
      try {
        user = await authService.getMe(tokens.accessToken, signal)
      } catch (error) {
        if (!(error instanceof AuthError) || error.code !== 'UNAUTHORIZED') throw error
        if (getState().auth.currentRequestId !== requestId) return null
        // Only an invalid access token triggers one refresh attempt.
        tokens = await authService.refresh({ refreshToken: tokens.refreshToken }, signal)
        user = await authService.getMe(tokens.accessToken, signal)
      }
      return { user, tokens }
    } catch (error) {
      const failure = toAuthFailure(error)
      const invalidSession = failure.code === 'UNAUTHORIZED' || failure.code === 'INVALID_RESPONSE'
      return rejectWithValue({ error: failure, tokens: invalidSession ? null : tokens })
    }
  },
  {
    condition: (_, { getState }) => {
      const auth = getState().auth
      return !!auth.tokens && auth.status !== 'authenticated' && !auth.currentRequestId
    },
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: createInitialAuthState(),
  reducers: {
    logout: () => createInitialAuthState(),
    clearAuthError(state) {
      state.error = null
      if (state.status === 'error') state.status = state.tokens ? 'idle' : 'unauthenticated'
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(login.pending, restoreSession.pending), (state, action) => {
        state.currentRequestId = action.meta.requestId
        state.requestKind = login.pending.match(action) ? 'login' : 'restore'
        state.status = 'loading'
        state.error = null
        state.user = null
        if (state.requestKind === 'login') state.tokens = null
      })
      .addMatcher(isAnyOf(login.fulfilled, restoreSession.fulfilled), (state, action) => {
        // Ignore responses from a request that was superseded by logout.
        if (state.currentRequestId !== action.meta.requestId) return
        state.user = action.payload?.user ?? null
        state.tokens = action.payload?.tokens ?? null
        state.status = action.payload ? 'authenticated' : 'unauthenticated'
        state.error = null
        state.currentRequestId = null
        state.requestKind = null
      })
      .addMatcher(isAnyOf(login.rejected, restoreSession.rejected), (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return
        state.user = null
        if (action.meta.aborted) {
          state.status = state.tokens ? 'idle' : 'unauthenticated'
          state.error = null
        } else {
          state.tokens = action.payload?.tokens ?? null
          state.error = action.payload?.error ?? toAuthFailure(null)
          state.status = state.tokens ? 'error' : 'unauthenticated'
        }
        state.currentRequestId = null
        state.requestKind = null
      })
  },
  selectors: {
    selectAuth: (state) => state,
    selectCurrentUser: (state) => state.user,
    selectCurrentUserId: (state) => state.user?.id ?? null,
    selectIsAuthenticated: (state) => state.status === 'authenticated' && state.user !== null,
    selectAuthLoading: (state) => state.status === 'loading',
    selectAuthError: (state) => state.error,
    selectIsRestoringSession: (state) => state.requestKind === 'restore',
  },
})

export const { logout, clearAuthError } = authSlice.actions
export const {
  selectAuth, selectCurrentUser, selectCurrentUserId, selectIsAuthenticated,
  selectAuthLoading, selectAuthError, selectIsRestoringSession,
} = authSlice.selectors
export default authSlice.reducer
