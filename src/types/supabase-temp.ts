// 一時的な型定義ファイル
// Supabaseダッシュボードから正式な型定義をダウンロード後、置き換えてください

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          customer_type: 'company' | 'personal'
          company_name: string | null
          name: string
          name_kana: string | null
          class: string | null
          birth_date: string | null
          postal_code: string | null
          prefecture: string | null
          city: string | null
          address: string | null
          phone: string | null
          email: string | null
          contract_start_date: string | null
          invoice_method: 'mail' | 'email' | null
          payment_terms: string | null
          memo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          customer_type: 'company' | 'personal'
          company_name?: string | null
          name: string
          name_kana?: string | null
          class?: string | null
          birth_date?: string | null
          postal_code?: string | null
          prefecture?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          contract_start_date?: string | null
          invoice_method?: 'mail' | 'email' | null
          payment_terms?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          customer_type?: 'company' | 'personal'
          company_name?: string | null
          name?: string
          name_kana?: string | null
          class?: string | null
          birth_date?: string | null
          postal_code?: string | null
          prefecture?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          contract_start_date?: string | null
          invoice_method?: 'mail' | 'email' | null
          payment_terms?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      customer_tags: {
        Row: {
          id: string
          customer_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
  }
}

// 便利な型エイリアス
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

export type CustomerTag = Database['public']['Tables']['customer_tags']['Row']
export type CustomerTagInsert = Database['public']['Tables']['customer_tags']['Insert']
export type CustomerTagUpdate = Database['public']['Tables']['customer_tags']['Update']