import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // SSR対応のための初期値設定
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // 値を保存する関数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  // クリア関数
  const clearValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error)
    }
  }

  return [storedValue, setValue, clearValue] as const
}