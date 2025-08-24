'use client'

import { useState } from 'react'
import { Download, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface ExportOptions {
  encoding: 'utf8' | 'sjis'
  includeDeleted: boolean
  dateFormat: 'iso' | 'japanese'
}

interface ExportButtonProps {
  customerIds?: string[]
  totalCount?: number
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

export function ExportButton({
  customerIds,
  totalCount,
  variant = 'default',
  size = 'default'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    encoding: 'utf8',
    includeDeleted: false,
    dateFormat: 'japanese'
  })

  const isSelectiveExport = customerIds && customerIds.length > 0

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let response: Response

      if (isSelectiveExport) {
        // 選択された顧客のみエクスポート
        response = await fetch('/api/customers/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerIds,
            options
          })
        })
      } else {
        // 全顧客エクスポート
        const params = new URLSearchParams({
          encoding: options.encoding,
          includeDeleted: options.includeDeleted.toString(),
          dateFormat: options.dateFormat
        })
        
        response = await fetch(`/api/customers/export?${params}`)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'エクスポートに失敗しました')
      }

      // ファイルをダウンロード
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // ファイル名をレスポンスヘッダーから取得
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'customers_export.csv'
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) {
          fileName = fileNameMatch[1]
        }
      }

      // ダウンロードリンクを作成してクリック
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // メモリリークを防ぐ
      URL.revokeObjectURL(url)

      const exportCount = isSelectiveExport ? customerIds!.length : totalCount || 0
      toast.success(`${exportCount}件の顧客データをエクスポートしました`)

      setIsDialogOpen(false)

    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonText = () => {
    if (isExporting) return 'エクスポート中...'
    if (isSelectiveExport) return `選択した${customerIds!.length}件をエクスポート`
    return '全顧客をエクスポート'
  }

  const getDialogTitle = () => {
    if (isSelectiveExport) {
      return `選択した顧客のエクスポート (${customerIds!.length}件)`
    }
    return `全顧客のエクスポート${totalCount ? ` (${totalCount}件)` : ''}`
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            エクスポートするCSVファイルの設定を選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文字コード設定 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">文字コード</Label>
            <RadioGroup
              value={options.encoding}
              onValueChange={(value) => setOptions(prev => ({ ...prev, encoding: value as 'utf8' | 'sjis' }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="utf8" id="utf8" />
                <Label htmlFor="utf8" className="text-foreground cursor-pointer font-medium">
                  UTF-8 (推奨)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sjis" id="sjis" />
                <Label htmlFor="sjis" className="text-foreground cursor-pointer font-medium">
                  Shift-JIS (Excel用)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 日付形式設定 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">日付形式</Label>
            <RadioGroup
              value={options.dateFormat}
              onValueChange={(value) => setOptions(prev => ({ ...prev, dateFormat: value as 'iso' | 'japanese' }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="japanese" id="japanese" />
                <Label htmlFor="japanese" className="text-foreground cursor-pointer font-medium">
                  日本語形式 (2024/1/1)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iso" id="iso" />
                <Label htmlFor="iso" className="text-foreground cursor-pointer font-medium">
                  ISO形式 (2024-01-01)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 削除済み顧客を含める */}
          {!isSelectiveExport && (
            <div className="flex items-center justify-between">
              <Label htmlFor="include-deleted" className="text-sm font-medium text-foreground">
                削除済み顧客を含める
              </Label>
              <Switch
                id="include-deleted"
                checked={options.includeDeleted}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeDeleted: checked }))}
              />
            </div>
          )}

          {/* エクスポートボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'エクスポート中...' : 'エクスポート'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}