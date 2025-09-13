'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Building2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CompanySettings, CompanySettingsInput, BankInfo } from '@/types/company'

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CompanySettingsInput>({
    company_name: '',
    postal_code: '',
    address: '',
    phone: '',
    email: '',
    fax: '',
    bank_info: {
      bank_name: '',
      branch_name: '',
      account_type: '普通',
      account_number: '',
      account_holder: ''
    }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CompanySettingsInput, string>>>({})

  // 自社情報取得
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/company-settings')
        const data = await response.json()

        if (data.success && data.data) {
          const settings: CompanySettings = data.data
          setForm({
            company_name: settings.company_name,
            postal_code: settings.postal_code || '',
            address: settings.address,
            phone: settings.phone,
            email: settings.email || '',
            fax: settings.fax || '',
            bank_info: settings.bank_info || {
              bank_name: '',
              branch_name: '',
              account_type: '普通',
              account_number: '',
              account_holder: ''
            }
          })
        }
      } catch (error) {
        console.error('自社情報取得エラー:', error)
        toast.error('自社情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanySettings()
  }, [])

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CompanySettingsInput, string>> = {}

    if (!form.company_name.trim()) {
      newErrors.company_name = '会社名は必須です'
    } else if (form.company_name.length > 255) {
      newErrors.company_name = '会社名は255文字以内で入力してください'
    }

    if (!form.address.trim()) {
      newErrors.address = '住所は必須です'
    }

    if (!form.phone.trim()) {
      newErrors.phone = '電話番号は必須です'
    } else if (form.phone.length > 50) {
      newErrors.phone = '電話番号は50文字以内で入力してください'
    }

    if (form.postal_code && form.postal_code.length > 20) {
      newErrors.postal_code = '郵便番号は20文字以内で入力してください'
    }

    if (form.email) {
      if (form.email.length > 255) {
        newErrors.email = 'メールアドレスは255文字以内で入力してください'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'メールアドレスの形式が正しくありません'
      }
    }

    if (form.fax && form.fax.length > 50) {
      newErrors.fax = 'FAX番号は50文字以内で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        toast.success('自社情報を保存しました')
      } else {
        const error = await response.json()
        toast.error(error.message || '保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 銀行情報の更新
  const updateBankInfo = (field: keyof BankInfo, value: string) => {
    setForm(prev => ({
      ...prev,
      bank_info: {
        ...prev.bank_info!,
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">自社情報設定</h1>
        <p className="text-muted-foreground mt-1">
          請求書に表示される自社情報を設定します
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 基本情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              基本情報
            </CardTitle>
            <CardDescription>
              会社の基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 会社名 */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                会社名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="株式会社サンプル"
                disabled={saving}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name}</p>
              )}
            </div>

            {/* 郵便番号と住所 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  placeholder="100-0001"
                  disabled={saving}
                />
                {errors.postal_code && (
                  <p className="text-sm text-destructive">{errors.postal_code}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  住所 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="東京都千代田区千代田1-1-1"
                  disabled={saving}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
            </div>

            {/* 連絡先 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  電話番号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03-1234-5678"
                  disabled={saving}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">FAX番号</Label>
                <Input
                  id="fax"
                  value={form.fax}
                  onChange={(e) => setForm({ ...form, fax: e.target.value })}
                  placeholder="03-1234-5679"
                  disabled={saving}
                />
                {errors.fax && (
                  <p className="text-sm text-destructive">{errors.fax}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@example.com"
                  disabled={saving}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 銀行情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>銀行口座情報</CardTitle>
            <CardDescription>
              振込先の銀行口座情報を入力してください（任意）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">銀行名</Label>
                <Input
                  id="bank_name"
                  value={form.bank_info?.bank_name || ''}
                  onChange={(e) => updateBankInfo('bank_name', e.target.value)}
                  placeholder="みずほ銀行"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch_name">支店名</Label>
                <Input
                  id="branch_name"
                  value={form.bank_info?.branch_name || ''}
                  onChange={(e) => updateBankInfo('branch_name', e.target.value)}
                  placeholder="東京営業部"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_type">口座種別</Label>
                <select
                  id="account_type"
                  value={form.bank_info?.account_type || '普通'}
                  onChange={(e) => updateBankInfo('account_type', e.target.value)}
                  disabled={saving}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                  <option value="貯蓄">貯蓄</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">口座番号</Label>
                <Input
                  id="account_number"
                  value={form.bank_info?.account_number || ''}
                  onChange={(e) => updateBankInfo('account_number', e.target.value)}
                  placeholder="1234567"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_holder">口座名義</Label>
                <Input
                  id="account_holder"
                  value={form.bank_info?.account_holder || ''}
                  onChange={(e) => updateBankInfo('account_holder', e.target.value)}
                  placeholder="カ）サンプル"
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}