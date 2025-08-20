# TypeScript型定義の生成方法

## 方法1: Supabaseダッシュボードから生成（推奨）

1. **Supabaseダッシュボード**にログイン
2. 左メニューの **Project Settings** → **API** を開く
3. 下部の **Generate Types** セクションを見つける
4. **TypeScript** を選択
5. **Generate and download TypeScript types** ボタンをクリック
6. ダウンロードしたファイルを `src/types/supabase.ts` として保存

## 方法2: Supabase CLIを使用（要ログイン）

1. Supabaseにログイン:
```bash
npx supabase login
```

2. ブラウザが開いたら認証を完了

3. 型定義を生成:
```bash
npm run db:types
```

## 方法3: 手動でアクセストークンを設定

1. https://app.supabase.com/account/tokens でアクセストークンを生成
2. 環境変数に設定:
```bash
export SUPABASE_ACCESS_TOKEN=your-token-here
npm run db:types
```

## 生成後の確認

`src/types/supabase.ts` ファイルが作成され、以下のような型定義が含まれます：

- `Database` - データベース全体の型
- `Tables` - 各テーブルの型
- `Row` - 行データの型
- `Insert` - 挿入時の型
- `Update` - 更新時の型