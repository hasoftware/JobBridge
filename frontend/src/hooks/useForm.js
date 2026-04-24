import { useState, useCallback } from 'react'

export function useForm(initial = {}, validators = {}) {
    const [values, setValues] = useState(initial)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const setField = useCallback((field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }, [errors])

    const handleBlur = useCallback((field) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        const validator = validators[field]
        if (validator) {
            const error = validator(values[field], values)
            if (error) setErrors((prev) => ({ ...prev, [field]: error }))
        }
    }, [values, validators])

    const validate = useCallback(() => {
        const newErrors = {}
        for (const field in validators) {
            const error = validators[field](values[field], values)
            if (error) newErrors[field] = error
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [values, validators])

    const reset = useCallback(() => {
        setValues(initial)
        setErrors({})
        setTouched({})
    }, [initial])

    return { values, errors, touched, setField, handleBlur, validate, reset }
}
