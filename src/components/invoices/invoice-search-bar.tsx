'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'

interface InvoiceSearchBarProps {
  onSearch: (query: string) => void
  onToggleAdvanced: () => void
  placeholder?: string
  defaultValue?: string
}

export function InvoiceSearchBar({
  onSearch,
  onToggleAdvanced,
  placeholder = '請求書番号、請求先名、備考で検索...',
  defaultValue = ''
}: InvoiceSearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
  }, [onSearch])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }, [query, onSearch])

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onToggleAdvanced}
        className="shrink-0"
      >
        <Filter className="mr-2 h-4 w-4" />
        詳細検索
      </Button>
    </form>
  )
}