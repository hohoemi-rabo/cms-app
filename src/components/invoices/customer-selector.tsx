'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, User, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

interface Customer {
  id: string
  customer_type: 'company' | 'personal'
  company_name?: string | null
  name: string
  name_kana?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  prefecture?: string | null
  city?: string | null
}

interface CustomerSelectorProps {
  customerId?: string | null
  billingName: string
  billingAddress?: string
  billingHonorific?: string
  onCustomerChange: (customer: Customer | null) => void
  onDirectInputChange: (data: {
    billingName: string
    billingAddress?: string
    billingHonorific?: string
  }) => void
}

export function CustomerSelector({
  customerId,
  billingName,
  billingAddress,
  billingHonorific = '様',
  onCustomerChange,
  onDirectInputChange,
}: CustomerSelectorProps) {
  const [inputMode, setInputMode] = useState<'customer' | 'direct'>(
    customerId ? 'customer' : 'direct'
  )
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 顧客検索
  const searchCustomers = useCallback(async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // 顧客IDから顧客情報を取得
  useEffect(() => {
    if (customerId && inputMode === 'customer') {
      fetch(`/api/customers/${customerId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setSelectedCustomer(data)
          }
        })
        .catch(console.error)
    }
  }, [customerId, inputMode])

  // 検索クエリ変更時
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchCustomers(searchQuery)
      } else {
        searchCustomers('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchCustomers])

  // 顧客選択時
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    const fullAddress = [customer.prefecture, customer.city, customer.address]
      .filter(Boolean)
      .join('')

    onCustomerChange(customer)
    onDirectInputChange({
      billingName: customer.company_name || customer.name,
      billingAddress: fullAddress,
      billingHonorific: customer.customer_type === 'company' ? '御中' : '様',
    })
    setIsDialogOpen(false)
  }

  // 顧客選択解除
  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    onCustomerChange(null)
  }

  // 入力モード切り替え
  const handleModeChange = (mode: 'customer' | 'direct') => {
    if (mode !== inputMode) {
      const confirm = window.confirm(
        '入力モードを切り替えると、現在の入力内容がリセットされます。よろしいですか？'
      )
      if (confirm) {
        setInputMode(mode)
        if (mode === 'direct') {
          handleClearCustomer()
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>請求先入力方法</Label>
        <RadioGroup
          value={inputMode}
          onValueChange={(value) => handleModeChange(value as 'customer' | 'direct')}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="customer" id="customer" />
            <Label htmlFor="customer">顧客を選択</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct">直接入力</Label>
          </div>
        </RadioGroup>
      </div>

      {inputMode === 'customer' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer-select">顧客選択</Label>
            {selectedCustomer ? (
              <Card className="p-4 mt-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {selectedCustomer.customer_type === 'company' ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {selectedCustomer.company_name || selectedCustomer.name}
                      </span>
                    </div>
                    {selectedCustomer.company_name && (
                      <p className="text-sm text-muted-foreground">
                        担当者: {selectedCustomer.name}
                      </p>
                    )}
                    {(selectedCustomer.prefecture || selectedCustomer.city || selectedCustomer.address) && (
                      <p className="text-sm text-muted-foreground">
                        {[selectedCustomer.prefecture, selectedCustomer.city, selectedCustomer.address]
                          .filter(Boolean)
                          .join('')}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCustomer}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full mt-2 justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    顧客を検索して選択
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>顧客検索</DialogTitle>
                    <DialogDescription>
                      請求先となる顧客を検索して選択してください
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="顧客名または会社名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Separator />
                    <ScrollArea className="h-[400px]">
                      {isSearching ? (
                        <div className="text-center py-8 text-muted-foreground">
                          検索中...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((customer) => (
                            <Card
                              key={customer.id}
                              className="p-3 cursor-pointer hover:bg-accent"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="flex items-start gap-3">
                                {customer.customer_type === 'company' ? (
                                  <Building2 className="h-4 w-4 mt-0.5" />
                                ) : (
                                  <User className="h-4 w-4 mt-0.5" />
                                )}
                                <div className="flex-1 space-y-1">
                                  <div className="font-medium">
                                    {customer.company_name || customer.name}
                                  </div>
                                  {customer.company_name && (
                                    <div className="text-sm text-muted-foreground">
                                      担当者: {customer.name}
                                    </div>
                                  )}
                                  {(customer.prefecture || customer.city || customer.address) && (
                                    <div className="text-sm text-muted-foreground">
                                      {[customer.prefecture, customer.city, customer.address]
                                        .filter(Boolean)
                                        .join('')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? '検索結果がありません'
                            : '検索キーワードを入力してください'}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="billing-name">請求先名 *</Label>
            <Input
              id="billing-name"
              type="text"
              value={billingName}
              onChange={(e) =>
                onDirectInputChange({
                  billingName: e.target.value,
                  billingAddress,
                  billingHonorific,
                })
              }
              placeholder="株式会社サンプル"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="billing-address">請求先住所</Label>
            <Input
              id="billing-address"
              type="text"
              value={billingAddress || ''}
              onChange={(e) =>
                onDirectInputChange({
                  billingName,
                  billingAddress: e.target.value,
                  billingHonorific,
                })
              }
              placeholder="東京都千代田区..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="billing-honorific">敬称</Label>
            <RadioGroup
              value={billingHonorific}
              onValueChange={(value) =>
                onDirectInputChange({
                  billingName,
                  billingAddress,
                  billingHonorific: value,
                })
              }
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="様" id="sama" />
                <Label htmlFor="sama">様</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="御中" id="onchu" />
                <Label htmlFor="onchu">御中</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}
    </div>
  )
}