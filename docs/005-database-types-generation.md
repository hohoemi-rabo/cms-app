# 005 - データベース型定義生成

## 概要
SupabaseのデータベーススキーマからTypeScript型定義を自動生成

## 対象範囲
- Supabase CLIのセットアップ
- 型定義の自動生成
- 型定義ファイルの配置
- 型の使用方法の確立

## 実装タスク

### TODO
- [ ] Supabase CLIのインストール
- [ ] プロジェクトのリンク設定
- [ ] 型定義生成スクリプトの作成
- [ ] package.jsonへのスクリプト追加
- [ ] types/supabase.tsファイルの生成
- [ ] 生成された型の動作確認

## 技術仕様
```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts"
  }
}
```

```typescript
// 使用例
import { Database } from '@/types/supabase'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']
```

## 依存関係
- 002-database-schema-creation.md が完了していること
- 004-supabase-client-setup.md が完了していること

## 動作確認項目
- [ ] 型定義ファイルが正常に生成される
- [ ] 全テーブルの型が含まれている
- [ ] TypeScriptの型チェックが通る
- [ ] IDEの自動補完が機能する

## 注意事項
- スキーマ変更時は型定義を再生成する必要がある
- 生成された型ファイルは直接編集しない
- CI/CDパイプラインに型生成を組み込むことを検討