'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function TestShadcnPage() {
  const handleToast = () => {
    toast.success('shadcn/uiが正常に動作しています！')
  }

  const sampleData = [
    { id: 1, name: '山田太郎', email: 'yamada@example.com', class: '月-AM' },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', class: '火-PM' },
  ]

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui コンポーネントテスト</h1>

      {/* Card with Form */}
      <Card>
        <CardHeader>
          <CardTitle>フォームコンポーネント</CardTitle>
          <CardDescription>各種入力コンポーネントのテスト</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input id="name" placeholder="名前を入力" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">クラス</Label>
            <Select>
              <SelectTrigger id="class">
                <SelectValue placeholder="クラスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mon-am">月-AM</SelectItem>
                <SelectItem value="mon-pm">月-PM</SelectItem>
                <SelectItem value="tue-am">火-AM</SelectItem>
                <SelectItem value="tue-pm">火-PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">備考</Label>
            <Textarea id="memo" placeholder="備考を入力" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleToast}>保存</Button>
            <Button variant="outline">キャンセル</Button>
            <Button variant="destructive">削除</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>テーブルコンポーネント</CardTitle>
          <CardDescription>顧客一覧のサンプル表示</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>クラス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.class}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">詳細</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>顧客詳細</DialogTitle>
                          <DialogDescription>
                            {item.name}さんの詳細情報
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <p>ID: {item.id}</p>
                          <p>名前: {item.name}</p>
                          <p>メール: {item.email}</p>
                          <p>クラス: {item.class}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>✅ セットアップ完了</CardTitle>
          <CardDescription>
            shadcn/uiのインストールと設定が完了しました。
            すべてのコンポーネントが正常に動作しています。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}