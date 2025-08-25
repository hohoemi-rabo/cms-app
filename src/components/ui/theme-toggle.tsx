'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '../providers/theme-provider'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('ThemeToggle mounted')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('ThemeToggle ready. Current theme:', theme)
    }
  }, [mounted, theme])

  const toggleTheme = () => {
    console.log('Toggle clicked! Current theme:', theme)
    // 3段階循環: light → dark → system → light...
    if (theme === 'light') {
      console.log('Switching to dark mode')
      setTheme('dark')
    } else if (theme === 'dark') {
      console.log('Switching to system mode')
      setTheme('system')
    } else {
      console.log('Switching to light mode')
      setTheme('light')
    }
  }

  // hydration問題を防ぐためマウント前は何も表示しない
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">テーマを切り替え</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="h-9 w-9"
      title={
        theme === 'light' ? 'ダークモードに切り替え' :
        theme === 'dark' ? 'システム設定に切り替え' :
        'ライトモードに切り替え'
      }
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4 transition-all duration-200" />
      ) : theme === 'dark' ? (
        <Moon className="h-4 w-4 transition-all duration-200" />
      ) : (
        <Monitor className="h-4 w-4 transition-all duration-200" />
      )}
      <span className="sr-only">テーマを切り替え</span>
    </Button>
  )
}