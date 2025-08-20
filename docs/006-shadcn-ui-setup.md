# 006 - shadcn/ui セットアップ

## 概要
UIコンポーネントライブラリshadcn/uiの初期設定

## 対象範囲
- shadcn/uiのインストール
- 基本設定
- テーマ設定
- 必要なコンポーネントのインストール

## 実装タスク

### TODO
- [ ] shadcn/ui CLIのインストール
- [ ] initコマンドの実行
- [ ] tailwind.config.tsの設定確認
- [ ] globals.cssの設定確認
- [ ] 基本コンポーネントのインストール
  - [ ] Button
  - [ ] Input
  - [ ] Label
  - [ ] Card
  - [ ] Table
  - [ ] Dialog
  - [ ] Form
  - [ ] Select
  - [ ] Textarea
  - [ ] Toast

## 技術仕様
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card table dialog form select textarea toast
```

## 依存関係
- Next.jsプロジェクトの基本設定が完了していること

## 動作確認項目
- [ ] コンポーネントが正常にインポートできる
- [ ] スタイルが正しく適用される
- [ ] ダークモード切り替えが機能する（必要に応じて）
- [ ] TypeScript型定義が正しく機能する

## 注意事項
- Tailwind CSS v4との互換性を確認
- カスタムテーマが必要な場合は早期に設定
- コンポーネントは必要に応じて追加インストール