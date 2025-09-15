'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, Filter, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

interface SearchHistory {
  query: string
  timestamp: number
  resultCount?: number
}

interface InvoiceSearchEnhancedProps {
  onSearch: (query: string) => void
  onToggleAdvanced: () => void
  placeholder?: string
  defaultValue?: string
  suggestions?: string[]
}

export function InvoiceSearchEnhanced({
  onSearch,
  onToggleAdvanced,
  placeholder = '請求書番号、請求先名、備考で検索...',
  defaultValue = '',
  suggestions = []
}: InvoiceSearchEnhancedProps) {
  const [query, setQuery] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 500)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 検索履歴の管理
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>(
    'invoice-search-history',
    []
  )

  // 検索履歴から候補を生成
  const historySuggestions = searchHistory
    .filter(item =>
      item.query.toLowerCase().includes(query.toLowerCase()) &&
      item.query !== query
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(item => item.query)

  // 全候補（履歴 + 提案）
  const allSuggestions = [...new Set([...historySuggestions, ...suggestions])]
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  // 検索履歴に追加
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const newHistory: SearchHistory = {
      query: searchQuery,
      timestamp: Date.now()
    }

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery)
      return [newHistory, ...filtered].slice(0, 20) // 最大20件保存
    })
  }, [setSearchHistory])

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
    setShowSuggestions(false)
  }, [onSearch])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addToHistory(query)
    }
    onSearch(query)
    setShowSuggestions(false)
  }, [query, onSearch, addToHistory])

  // サジェストを選択
  const selectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion)
    addToHistory(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [onSearch, addToHistory])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K で検索にフォーカス
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // ESCで検索クリア
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (showSuggestions) {
          setShowSuggestions(false)
        } else if (query) {
          handleClear()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [query, showSuggestions, handleClear])

  // 矢印キーでサジェスト選択
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || allSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        )
        break
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault()
          selectSuggestion(allSuggestions[selectedIndex])
        }
        break
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault()
          selectSuggestion(allSuggestions[selectedIndex])
        }
        break
    }
  }

  // 履歴クリア
  const clearHistory = () => {
    setSearchHistory([])
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // サジェストクリック時に閉じないよう遅延
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
            aria-label="検索"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions && allSuggestions.length > 0}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={handleClear}
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* サジェストリスト */}
          {showSuggestions && allSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="search-suggestions"
              className="absolute top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-50"
              role="listbox"
            >
              {allSuggestions.map((suggestion, index) => {
                const isHistory = historySuggestions.includes(suggestion)
                return (
                  <button
                    key={suggestion}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent",
                      selectedIndex === index && "bg-accent"
                    )}
                    onClick={() => selectSuggestion(suggestion)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {isHistory ? (
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="flex-1 text-left">{suggestion}</span>
                  </button>
                )
              })}
              {searchHistory.length > 0 && (
                <div className="border-t mt-1 pt-1">
                  <button
                    type="button"
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-1"
                    onClick={clearHistory}
                  >
                    検索履歴をクリア
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onToggleAdvanced}
          className="shrink-0"
          aria-label="詳細検索を開く"
        >
          <Filter className="mr-2 h-4 w-4" />
          詳細検索
        </Button>
      </form>

      {/* キーボードショートカットのヒント */}
      <div className="mt-1 text-xs text-muted-foreground">
        <kbd className="px-1 py-0.5 rounded border bg-muted">Ctrl+K</kbd> で検索にフォーカス
      </div>
    </div>
  )
}