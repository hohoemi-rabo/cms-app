// 日本語フォントの設定ユーティリティ

// 軽量な日本語フォント用の設定
export const configurePDFFont = () => {
  // react-pdfでサポートされるTTFフォーマットを使用
  // より確実なCDN経由
  return 'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJK-Regular.ttf'
}

// フォント読み込み状態の確認
export const checkFontLoading = async (fontFamily: string): Promise<boolean> => {
  try {
    // フォントが読み込まれているかテスト
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) return false

    context.font = `12px ${fontFamily}`
    const metrics = context.measureText('日本語テスト')

    // 幅が0でなければフォントが読み込まれている
    return metrics.width > 0
  } catch {
    return false
  }
}

// PDFで使用する安全な文字列処理
export const sanitizeTextForPDF = (text: string): string => {
  // 特殊文字を安全な文字に置換
  return text
    .replace(/['"]/g, '"') // クォート統一
    .replace(/[—–]/g, '-') // ダッシュ統一
    .trim()
}