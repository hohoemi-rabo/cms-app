# 015 - タグ管理API実装

## 概要
タグマスタの管理とタグ操作に関するAPIの実装

## 対象範囲
- タグ一覧取得
- タグ作成
- タグ更新
- タグ削除
- 顧客へのタグ付け/解除

## 実装タスク

### TODO
- [ ] lib/api/tags/get-tags.tsの作成
- [ ] lib/api/tags/create-tag.tsの作成
- [ ] lib/api/tags/update-tag.tsの作成
- [ ] lib/api/tags/delete-tag.tsの作成
- [ ] lib/api/tags/customer-tags.tsの作成
- [ ] タグ一覧取得
  - [ ] 全タグの取得
  - [ ] 使用頻度の集計
- [ ] タグ作成
  - [ ] 重複チェック
  - [ ] バリデーション
- [ ] タグ更新
- [ ] タグ削除
  - [ ] 使用中チェック
  - [ ] カスケード処理
- [ ] 顧客タグ操作
  - [ ] タグ付け
  - [ ] タグ解除
  - [ ] 一括更新

## 技術仕様
```typescript
// lib/api/tags/index.ts
export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function createTag(name: string): Promise<Tag> {
  // 重複チェック
  const existing = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .single()
  
  if (existing.data) {
    throw new Error('Tag already exists')
  }
  
  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 顧客へのタグ操作
export async function attachTagsToCustomer(
  customerId: string, 
  tagIds: string[]
): Promise<void> {
  const records = tagIds.map(tagId => ({
    customer_id: customerId,
    tag_id: tagId
  }))
  
  const { error } = await supabase
    .from('customer_tags')
    .upsert(records, { onConflict: 'customer_id,tag_id' })
  
  if (error) throw error
}
```

## 依存関係
- データベースにタグ関連テーブルが存在すること

## 動作確認項目
- [ ] タグ一覧が取得できる
- [ ] 新規タグが作成できる
- [ ] 重複タグでエラーになる
- [ ] タグ名が更新できる
- [ ] 使用中のタグ削除で適切な処理がされる
- [ ] 顧客へのタグ付けが機能する
- [ ] タグの一括更新が正しく動作する

## 注意事項
- タグ名の正規化（大文字小文字、空白処理）
- タグ数の上限設定
- タグの使用統計情報の管理
- パフォーマンスを考慮した実装