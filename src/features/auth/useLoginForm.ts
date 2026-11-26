import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuthError, login, selectAuthError, selectAuthLoading } from './authSlice'
import { validateLoginFields, type LoginFieldErrors, type LoginFields } from './loginForm'

type LoginTask = ReturnType<ReturnType<typeof login>>

export function useLoginForm() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const [fields, setFields] = useState<LoginFields>({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const submitted = useRef(false)
  const request = useRef<LoginTask | null>(null)

  useEffect(() => {
    dispatch(clearAuthError())
    return () => { request.current?.abort() }
  }, [dispatch])

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  function changeField(field: keyof LoginFields, value: string) {
    const nextFields = { ...fields, [field]: value }
    setFields(nextFields)
    if (submitted.current || fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: validateLoginFields(nextFields)[field] }))
    }
    if (error) dispatch(clearAuthError())
  }

  function blurField(field: keyof LoginFields) {
    setFieldErrors((current) => ({ ...current, [field]: validateLoginFields(fields)[field] }))
  }

  function fillDemoCredentials() {
    setFields({ username: 'emilys', password: 'emilyspass' })
    setFieldErrors({})
    setShowPassword(false)
    submitted.current = false
    dispatch(clearAuthError())
    usernameRef.current?.focus()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || request.current) return
    submitted.current = true
    const errors = validateLoginFields(fields)
    setFieldErrors(errors)
    if (errors.username || errors.password) {
      if (errors.username) usernameRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    const task = dispatch(login({ username: fields.username.trim(), password: fields.password }))
    request.current = task
    await task
    if (request.current === task) request.current = null
  }

  return {
    fields, fieldErrors, loading, error, showPassword, setShowPassword,
    usernameRef, passwordRef, errorRef, changeField, blurField, fillDemoCredentials, submit,
  }
}
