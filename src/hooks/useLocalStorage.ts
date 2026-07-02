import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const loadValue = (): T => {
        try {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : defaultValue
        } catch {
            return defaultValue
        }
    }

    const [value, setValue] = useState<T>(loadValue)

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    const setValueWithFn = (
        newValue: T | ((prev: T) => T)
    ) => {
        if (typeof newValue === 'function') {
            setValue((prev) => (newValue as (prev: T) => T)(prev))
        } else {
            setValue(newValue)
        }
    }

    return [value, setValueWithFn]
}

