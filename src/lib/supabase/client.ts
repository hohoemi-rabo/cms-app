import { createClient } from '@supabase/supabase-js'

/**
 * Client Component用のSupabaseクライアント
 * 'use client'が指定されたコンポーネントで使用
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 互換性のため、既存のエクスポートも維持
export const supabase = supabaseClient