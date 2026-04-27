import { useState, useCallback } from 'react'

export function useForm(initial) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const set = (k, v) => {
    setValues((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: "" }))
  }
  const reset = () => {
    setValues(initial)
    setErrors({})
  }
  const patch = useCallback((obj) => setValues((p) => ({ ...p, ...obj })), [])
  return { values, errors, setErrors, set, reset, patch, setValues }
}

export function useSubmit(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const submit = async (...args) => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const msg = await fn(...args)
      setSuccess(msg || "")
    } catch (e) {
      setError(e.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }
  return { loading, error, success, submit, setError, setSuccess }
}
