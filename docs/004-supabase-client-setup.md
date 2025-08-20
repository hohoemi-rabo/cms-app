# 004 - Supabaseクライアント設定

## 概要
Next.jsアプリケーションでSupabaseクライアントを使用するための設定

## 対象範囲
- Supabaseクライアントライブラリのインストール
- クライアントインスタンスの作成
- TypeScript型定義の生成
- エラーハンドリング設定

## 実装タスク

### TODO
- [ ] @supabase/supabase-jsパッケージのインストール
- [ ] lib/supabase/client.tsファイルの作成
- [ ] サーバーコンポーネント用クライアント作成
- [ ] クライアントコンポーネント用クライアント作成
- [ ] Database型定義の生成設定
- [ ] エラーハンドリングユーティリティ作成

## 技術仕様
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 依存関係
- 001-supabase-project-setup.md が完了していること
- 003-row-level-security-setup.md が完了していること

## 動作確認項目
- [ ] クライアントが正常にインポートできる
- [ ] 環境変数が正しく読み込まれる
- [ ] TypeScriptエラーが発生しない
- [ ] 簡単なクエリが実行できる

## 注意事項
- Server ComponentsとClient Componentsで異なるクライアント設定が必要な場合がある
- 型定義は定期的に更新する必要がある