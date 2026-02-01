/**
 * Types générés pour la base de données Supabase
 * À régénérer avec: npm run db:generate
 *
 * Pour le moment, types manuels basés sur le schéma
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'manager'
          full_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'manager'
          full_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'manager'
          full_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_managers: {
        Row: {
          id: string
          user_id: string
          company_name: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      buildings: {
        Row: {
          id: string
          manager_id: string
          address: string
          city: string
          postal_code: string | null
          unit_count: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          address: string
          city?: string
          postal_code?: string | null
          unit_count?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          address?: string
          city?: string
          postal_code?: string | null
          unit_count?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_requests: {
        Row: {
          id: string
          request_number: string
          manager_id: string | null
          building_id: string | null
          unit_numbers: string[]
          work_type: string
          work_category: string
          priority: 'normal' | 'prioritaire' | 'urgent'
          description: string
          access_info: string | null
          status: 'nouveau' | 'en_evaluation' | 'soumission_envoyee' | 'approuve' | 'en_cours' | 'complete' | 'facture'
          assigned_to: string | null
          contact_email: boolean
          contact_phone: boolean
          contact_sms: boolean
          contact_portal: boolean
          trello_card_id: string | null
          trello_url: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          estimated_cost: number | null
          final_cost: number | null
        }
        Insert: {
          id?: string
          request_number: string
          manager_id?: string | null
          building_id?: string | null
          unit_numbers: string[]
          work_type: string
          work_category: string
          priority: 'normal' | 'prioritaire' | 'urgent'
          description: string
          access_info?: string | null
          status?: 'nouveau' | 'en_evaluation' | 'soumission_envoyee' | 'approuve' | 'en_cours' | 'complete' | 'facture'
          assigned_to?: string | null
          contact_email?: boolean
          contact_phone?: boolean
          contact_sms?: boolean
          contact_portal?: boolean
          trello_card_id?: string | null
          trello_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
        }
        Update: {
          id?: string
          request_number?: string
          manager_id?: string | null
          building_id?: string | null
          unit_numbers?: string[]
          work_type?: string
          work_category?: string
          priority?: 'normal' | 'prioritaire' | 'urgent'
          description?: string
          access_info?: string | null
          status?: 'nouveau' | 'en_evaluation' | 'soumission_envoyee' | 'approuve' | 'en_cours' | 'complete' | 'facture'
          assigned_to?: string | null
          contact_email?: boolean
          contact_phone?: boolean
          contact_sms?: boolean
          contact_portal?: boolean
          trello_card_id?: string | null
          trello_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
        }
      }
      messages: {
        Row: {
          id: string
          work_request_id: string
          sender_id: string | null
          sender_type: 'admin' | 'manager'
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          work_request_id: string
          sender_id?: string | null
          sender_type: 'admin' | 'manager'
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          work_request_id?: string
          sender_id?: string | null
          sender_type?: 'admin' | 'manager'
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          work_request_id: string
          uploaded_by: string | null
          file_path: string
          file_name: string
          file_size: number | null
          photo_type: 'initial' | 'progress' | 'completion' | null
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          work_request_id: string
          uploaded_by?: string | null
          file_path: string
          file_name: string
          file_size?: number | null
          photo_type?: 'initial' | 'progress' | 'completion' | null
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          work_request_id?: string
          uploaded_by?: string | null
          file_path?: string
          file_name?: string
          file_size?: number | null
          photo_type?: 'initial' | 'progress' | 'completion' | null
          caption?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          work_request_id: string
          uploaded_by: string | null
          file_path: string
          file_name: string
          file_size: number | null
          document_type: 'quote' | 'invoice' | 'contract' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          work_request_id: string
          uploaded_by?: string | null
          file_path: string
          file_name: string
          file_size?: number | null
          document_type: 'quote' | 'invoice' | 'contract' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          work_request_id?: string
          uploaded_by?: string | null
          file_path?: string
          file_name?: string
          file_size?: number | null
          document_type?: 'quote' | 'invoice' | 'contract' | 'other'
          created_at?: string
        }
      }
      status_history: {
        Row: {
          id: string
          work_request_id: string
          old_status: string | null
          new_status: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          work_request_id: string
          old_status?: string | null
          new_status: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          work_request_id?: string
          old_status?: string | null
          new_status?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          work_request_id: string
          description: string
          item_order: number
          is_completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_request_id: string
          description: string
          item_order?: number
          is_completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_request_id?: string
          description?: string
          item_order?: number
          is_completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Types helper pour faciliter l'utilisation
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Types spécifiques pour l'application
export type User = Tables<'users'>
export type PropertyManager = Tables<'property_managers'>
export type Building = Tables<'buildings'>
export type WorkRequest = Tables<'work_requests'>
export type Message = Tables<'messages'>
export type Photo = Tables<'photos'>
export type Document = Tables<'documents'>
export type StatusHistory = Tables<'status_history'>
export type ChecklistItem = Tables<'checklist_items'>

// Types pour les statuts
export type WorkRequestStatus = WorkRequest['status']
export type Priority = WorkRequest['priority']
export type UserRole = User['role']
