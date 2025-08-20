import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

/**
 * Server Component用のSupabaseクライアント
 * Server Componentsで使用する際はこちらを使用
 */
export const createServerClient = cache(() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  })
})

// エクスポート用のインスタンス
export const supabaseServer = createServerClient()