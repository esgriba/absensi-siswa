import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          student_id: string
          name: string
          class: string
          qr_code: string
          email?: string
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          class: string
          qr_code: string
          email?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          class?: string
          qr_code?: string
          email?: string
          phone?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          time: string
          status: 'present' | 'late' | 'absent'
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          time: string
          status: 'present' | 'late' | 'absent'
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          time?: string
          status?: 'present' | 'late' | 'absent'
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          teacher: string
          schedule: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          teacher: string
          schedule: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          teacher?: string
          schedule?: string
        }
      }
    }
  }
}
