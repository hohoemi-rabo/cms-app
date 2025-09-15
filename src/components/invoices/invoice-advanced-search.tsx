'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Calendar, DollarSign, Users, SortAsc } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  amountMin?: string
  amountMax?: string
  customerIds?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

interface InvoiceAdvancedSearchProps {
  isOpen: boolean
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
  customers?: Array<{ id: string; name: string }>
}

export function InvoiceAdvancedSearch({
  isOpen,
  filters,
  onFiltersChange,
  onReset,
  customers = []
}: InvoiceAdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const quickDateOptions = [
    { label: '今日', value: () => {
      const today = new Date().toISOString().split('T')[0]
      handleFilterChange('dateFrom', today)
      handleFilterChange('dateTo', today)
    }},
    { label: '今週', value: () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      handleFilterChange('dateFrom', monday.toISOString().split('T')[0])
      handleFilterChange('dateTo', sunday.toISOString().split('T')[0])
    }},
    { label: '今月', value: () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      handleFilterChange('dateFrom', firstDay.toISOString().split('T')[0])
      handleFilterChange('dateTo', lastDay.toISOString().split('T')[0])
    }},
    { label: '前月', value: () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)

      handleFilterChange('dateFrom', firstDay.toISOString().split('T')[0])
      handleFilterChange('dateTo', lastDay.toISOString().split('T')[0])
    }},
    { label: '今年', value: () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), 0, 1)
      const lastDay = new Date(now.getFullYear(), 11, 31)

      handleFilterChange('dateFrom', firstDay.toISOString().split('T')[0])
      handleFilterChange('dateTo', lastDay.toISOString().split('T')[0])
    }}
  ]

  return (
    <Collapsible open={isOpen} className="mt-4">
      <CollapsibleContent>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 期間検索 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  期間検索
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {quickDateOptions.slice(0, 3).map((option) => (
                      <Button
                        key={option.label}
                        variant="outline"
                        size="sm"
                        onClick={option.value}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {quickDateOptions.slice(3).map((option) => (
                      <Button
                        key={option.label}
                        variant="outline"
                        size="sm"
                        onClick={option.value}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label htmlFor="date-from">開始日</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to">終了日</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={localFilters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 金額範囲 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  金額範囲
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label htmlFor="amount-min">最小金額</Label>
                    <Input
                      id="amount-min"
                      type="number"
                      placeholder="0"
                      value={localFilters.amountMin || ''}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount-max">最大金額</Label>
                    <Input
                      id="amount-max"
                      type="number"
                      placeholder="上限なし"
                      value={localFilters.amountMax || ''}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 並び替え・表示設定 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SortAsc className="h-4 w-4" />
                  並び替え・表示
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label htmlFor="sort-by">並び順</Label>
                    <Select
                      value={localFilters.sortBy || 'issue_date'}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger id="sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="issue_date">発行日</SelectItem>
                        <SelectItem value="invoice_number">請求書番号</SelectItem>
                        <SelectItem value="amount">金額</SelectItem>
                        <SelectItem value="billing_name">請求先名</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sort-order">順序</Label>
                    <Select
                      value={localFilters.sortOrder || 'desc'}
                      onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                    >
                      <SelectTrigger id="sort-order">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">降順（新しい順）</SelectItem>
                        <SelectItem value="asc">昇順（古い順）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="limit">表示件数</Label>
                    <Select
                      value={String(localFilters.limit || 20)}
                      onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                    >
                      <SelectTrigger id="limit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20件</SelectItem>
                        <SelectItem value="50">50件</SelectItem>
                        <SelectItem value="100">100件</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={onReset}>
                条件をクリア
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}