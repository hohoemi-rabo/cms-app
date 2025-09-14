'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Copy, GripVertical, Search, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Product {
  id: string
  name: string
  default_price: number
  unit: string
  description?: string | null
}

export interface InvoiceItem {
  product_id?: string | null
  item_name: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  description?: string
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[]
  onItemsChange: (items: InvoiceItem[]) => void
  readOnly?: boolean
}

export function InvoiceItemsTable({
  items,
  onItemsChange,
  readOnly = false,
}: InvoiceItemsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 商品検索
  const searchProducts = useCallback(async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=20`)
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

  // 検索クエリ変更時
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchProducts])

  // 金額計算
  const calculateAmount = (quantity: number, unitPrice: number) => {
    return Math.floor(quantity * unitPrice)
  }

  // 小計計算
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  // 消費税計算（10%、端数切り捨て）
  const calculateTax = (subtotal: number) => {
    return Math.floor(subtotal * 0.1)
  }

  // 合計計算
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  // 商品選択
  const handleSelectProduct = (product: Product) => {
    if (selectedItemIndex === null) return

    const updatedItems = [...items]
    updatedItems[selectedItemIndex] = {
      ...updatedItems[selectedItemIndex],
      product_id: product.id,
      item_name: product.name,
      unit: product.unit,
      unit_price: product.default_price,
      amount: calculateAmount(
        updatedItems[selectedItemIndex].quantity || 1,
        product.default_price
      ),
      description: product.description || '',
    }

    onItemsChange(updatedItems)
    setIsDialogOpen(false)
    setSelectedItemIndex(null)
    setSearchQuery('')
  }

  // 明細更新
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items]
    const item = { ...updatedItems[index] }

    if (field === 'quantity' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
      item[field] = numValue
      item.amount = calculateAmount(
        field === 'quantity' ? numValue : item.quantity,
        field === 'unit_price' ? numValue : item.unit_price
      )
    } else {
      item[field] = value
    }

    updatedItems[index] = item
    onItemsChange(updatedItems)
  }

  // 行追加
  const addItem = () => {
    if (items.length >= 10) return

    const newItem: InvoiceItem = {
      product_id: null,
      item_name: '',
      quantity: 1,
      unit: '個',
      unit_price: 0,
      amount: 0,
      description: '',
    }

    onItemsChange([...items, newItem])
  }

  // 行削除
  const removeItem = (index: number) => {
    if (items.length <= 1) return
    const updatedItems = items.filter((_, i) => i !== index)
    onItemsChange(updatedItems)
  }

  // 行複製
  const duplicateItem = (index: number) => {
    if (items.length >= 10) return
    const itemToDuplicate = { ...items[index] }
    const updatedItems = [...items]
    updatedItems.splice(index + 1, 0, itemToDuplicate)
    onItemsChange(updatedItems)
  }

  // ドラッグ開始
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updatedItems = [...items]
    const draggedItem = updatedItems[draggedIndex]
    updatedItems.splice(draggedIndex, 1)
    updatedItems.splice(index, 0, draggedItem)

    onItemsChange(updatedItems)
    setDraggedIndex(index)
  }

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 金額フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {!readOnly && <TableHead className="w-[40px]"></TableHead>}
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>品目名</TableHead>
              <TableHead className="w-[100px]">数量</TableHead>
              <TableHead className="w-[80px]">単位</TableHead>
              <TableHead className="w-[120px]">単価</TableHead>
              <TableHead className="w-[120px] text-right">金額</TableHead>
              {!readOnly && <TableHead className="w-[120px]">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={index}
                draggable={!readOnly}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={draggedIndex === index ? 'opacity-50' : ''}
              >
                {!readOnly && (
                  <TableCell className="cursor-move">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                )}
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="商品・サービス名"
                      value={item.item_name}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      disabled={readOnly}
                      className="min-w-[200px]"
                      aria-label={`明細 ${index + 1} の品目名`}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                          // Tabで次のフィールド（数量）に移動
                        } else if (e.key === 'Enter') {
                          e.preventDefault()
                          // Enterで次の行の品目名に移動
                          const nextRowInput = document.querySelector(
                            `input[aria-label="明細 ${index + 2} の品目名"]`
                          ) as HTMLInputElement
                          if (nextRowInput) {
                            nextRowInput.focus()
                          } else if (!readOnly && items.length < 10) {
                            // 最後の行でEnterを押したら新しい行を追加
                            addItem()
                          }
                        }
                      }}
                    />
                    {!readOnly && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItemIndex(index)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>商品を検索</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    disabled={readOnly}
                    aria-label={`明細 ${index + 1} の数量`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    disabled={readOnly}
                    placeholder="個"
                    aria-label={`明細 ${index + 1} の単位`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.unit_price || ''}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    disabled={readOnly}
                    aria-label={`明細 ${index + 1} の単価`}
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.amount)}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateItem(index)}
                              disabled={items.length >= 10}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>複製</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={items.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>削除</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 合計表示 */}
      <div className="flex justify-between items-start">
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            disabled={items.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            行を追加 ({items.length}/10)
          </Button>
        )}
        <Card className="p-4 min-w-[300px]">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>小計:</span>
              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>消費税 (10%):</span>
              <span className="font-medium">{formatCurrency(calculateTax(calculateSubtotal()))}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>合計:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 商品検索ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>商品検索</DialogTitle>
            <DialogDescription>
              商品マスタから選択して明細に追加します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="商品名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && searchResults.length > 0) {
                    e.preventDefault()
                    const firstCard = document.querySelector('[data-product-card]') as HTMLElement
                    firstCard?.focus()
                  } else if (e.key === 'Escape') {
                    setIsDialogOpen(false)
                  }
                }}
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
                  {searchResults.map((product) => (
                    <Card
                      key={product.id}
                      className="p-3 cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none"
                      onClick={() => handleSelectProduct(product)}
                      data-product-card
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelectProduct(product)
                        } else if (e.key === 'Escape') {
                          setIsDialogOpen(false)
                        }
                      }}
                      role="button"
                      aria-label={`商品を選択: ${product.name}`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          単価: {formatCurrency(product.default_price)} / {product.unit}
                        </div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? '検索結果がありません'
                    : '商品名を入力して検索してください'}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}