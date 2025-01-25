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
      Policies: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      project_submissions: {
        Row: {
          audio_path: string | null
          city: string
          company_name: string
          created_at: string
          department: string | null
          description: string
          id: number
          photo_paths: string[] | null
        }
        Insert: {
          audio_path?: string | null
          city: string
          company_name: string
          created_at?: string
          department?: string | null
          description: string
          id?: number
          photo_paths?: string[] | null
        }
        Update: {
          audio_path?: string | null
          city?: string
          company_name?: string
          created_at?: string
          department?: string | null
          description?: string
          id?: number
          photo_paths?: string[] | null
        }
        Relationships: []
      }
      seo_analyses: {
        Row: {
          archived: boolean | null
          broken_links: string[] | null
          canonical_url: string | null
          company: string | null
          content_context: string | null
          content_length: number | null
          content_structure: Json | null
          content_suggestions: string | null
          created_at: string | null
          current_description: string | null
          current_h1: string | null
          current_h2s: string[] | null
          current_h3s: string[] | null
          current_h4s: string[] | null
          current_title: string | null
          description_context: string | null
          external_links: string[] | null
          h1_context: string | null
          h2s_context: string[] | null
          h3s_context: string[] | null
          h4s_context: string[] | null
          id: number
          image_alts: Json | null
          internal_links: string[] | null
          keyword_density: Json | null
          keyword_suggestions: string[] | null
          meta_robots: string | null
          mobile_friendly: boolean | null
          page_load_speed: number | null
          readability_score: number | null
          semantic_keywords: string[] | null
          suggested_description: string | null
          suggested_h1: string | null
          suggested_h2s: string[] | null
          suggested_h3s: string[] | null
          suggested_h4s: string[] | null
          suggested_title: string | null
          title_context: string | null
          url: string
          visible_text: string[] | null
        }
        Insert: {
          archived?: boolean | null
          broken_links?: string[] | null
          canonical_url?: string | null
          company?: string | null
          content_context?: string | null
          content_length?: number | null
          content_structure?: Json | null
          content_suggestions?: string | null
          created_at?: string | null
          current_description?: string | null
          current_h1?: string | null
          current_h2s?: string[] | null
          current_h3s?: string[] | null
          current_h4s?: string[] | null
          current_title?: string | null
          description_context?: string | null
          external_links?: string[] | null
          h1_context?: string | null
          h2s_context?: string[] | null
          h3s_context?: string[] | null
          h4s_context?: string[] | null
          id?: number
          image_alts?: Json | null
          internal_links?: string[] | null
          keyword_density?: Json | null
          keyword_suggestions?: string[] | null
          meta_robots?: string | null
          mobile_friendly?: boolean | null
          page_load_speed?: number | null
          readability_score?: number | null
          semantic_keywords?: string[] | null
          suggested_description?: string | null
          suggested_h1?: string | null
          suggested_h2s?: string[] | null
          suggested_h3s?: string[] | null
          suggested_h4s?: string[] | null
          suggested_title?: string | null
          title_context?: string | null
          url: string
          visible_text?: string[] | null
        }
        Update: {
          archived?: boolean | null
          broken_links?: string[] | null
          canonical_url?: string | null
          company?: string | null
          content_context?: string | null
          content_length?: number | null
          content_structure?: Json | null
          content_suggestions?: string | null
          created_at?: string | null
          current_description?: string | null
          current_h1?: string | null
          current_h2s?: string[] | null
          current_h3s?: string[] | null
          current_h4s?: string[] | null
          current_title?: string | null
          description_context?: string | null
          external_links?: string[] | null
          h1_context?: string | null
          h2s_context?: string[] | null
          h3s_context?: string[] | null
          h4s_context?: string[] | null
          id?: number
          image_alts?: Json | null
          internal_links?: string[] | null
          keyword_density?: Json | null
          keyword_suggestions?: string[] | null
          meta_robots?: string | null
          mobile_friendly?: boolean | null
          page_load_speed?: number | null
          readability_score?: number | null
          semantic_keywords?: string[] | null
          suggested_description?: string | null
          suggested_h1?: string | null
          suggested_h2s?: string[] | null
          suggested_h3s?: string[] | null
          suggested_h4s?: string[] | null
          suggested_title?: string | null
          title_context?: string | null
          url?: string
          visible_text?: string[] | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
