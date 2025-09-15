/**
 * 検索文字列を正規化（日本語対応）
 * ひらがな・カタカナの相互変換、全角・半角の統一
 */
export function normalizeSearchQuery(query: string): string {
  // 全角英数字を半角に変換
  let normalized = query.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  })

  // 全角スペースを半角スペースに変換
  normalized = normalized.replace(/　/g, ' ')

  // 連続するスペースを単一スペースに
  normalized = normalized.replace(/\s+/g, ' ')

  return normalized.trim()
}

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60
    return String.fromCharCode(chr)
  })
}

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

/**
 * 検索パターンを生成（ひらがな・カタカナ両対応）
 */
export function generateSearchPatterns(query: string): string[] {
  const normalized = normalizeSearchQuery(query)
  const patterns = new Set<string>()

  // 元の検索語
  patterns.add(normalized)

  // ひらがな・カタカナの相互変換パターンを追加
  const hiragana = katakanaToHiragana(normalized)
  const katakana = hiraganaToKatakana(normalized)

  if (hiragana !== normalized) patterns.add(hiragana)
  if (katakana !== normalized) patterns.add(katakana)

  return Array.from(patterns)
}

/**
 * 検索スコアを計算（関連度計算用）
 */
export function calculateSearchScore(text: string, query: string): number {
  if (!text || !query) return 0

  const normalizedText = normalizeSearchQuery(text.toLowerCase())
  const normalizedQuery = normalizeSearchQuery(query.toLowerCase())

  // 完全一致
  if (normalizedText === normalizedQuery) return 100

  // 部分一致
  if (normalizedText.includes(normalizedQuery)) return 80

  // 各単語での一致をチェック
  const queryWords = normalizedQuery.split(' ')
  const textWords = normalizedText.split(' ')

  let score = 0
  for (const queryWord of queryWords) {
    if (textWords.some(textWord => textWord.includes(queryWord))) {
      score += 50 / queryWords.length
    }
  }

  return Math.min(score, 70)
}