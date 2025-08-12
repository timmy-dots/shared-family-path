export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      charter_comments: {
        Row: {
          author_id: string
          charter_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          resolved: boolean
          section_id: string | null
          selection: Json
          updated_at: string
        }
        Insert: {
          author_id: string
          charter_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          resolved?: boolean
          section_id?: string | null
          selection?: Json
          updated_at?: string
        }
        Update: {
          author_id?: string
          charter_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          resolved?: boolean
          section_id?: string | null
          selection?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charter_comments_charter_id_fkey"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "charters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charter_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "charter_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charter_comments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "charter_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      charter_notes: {
        Row: {
          author_id: string
          charter_id: string
          content: string
          created_at: string
          id: string
          section_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          charter_id: string
          content: string
          created_at?: string
          id?: string
          section_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          charter_id?: string
          content?: string
          created_at?: string
          id?: string
          section_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charter_notes_charter_id_fkey"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "charters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charter_notes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "charter_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      charter_permissions: {
        Row: {
          created_at: string
          family_id: string
          id: string
          permission: Database["public"]["Enums"]["charter_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          permission?: Database["public"]["Enums"]["charter_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          permission?: Database["public"]["Enums"]["charter_permission"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charter_permissions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      charter_sections: {
        Row: {
          charter_id: string
          content: string
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          charter_id: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          charter_id?: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charter_sections_charter_id_fkey"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "charters"
            referencedColumns: ["id"]
          },
        ]
      }
      charters: {
        Row: {
          created_at: string
          created_by: string
          family_id: string
          id: string
          status: string
          template_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id: string
          id?: string
          status?: string
          template_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string
          id?: string
          status?: string
          template_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charters_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string | null
          owner_id: string
          referral_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id: string
          referral_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string
          referral_code?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_tree: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          label: string
          metadata: Json
          parent_id: string | null
          relation: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          label: string
          metadata?: Json
          parent_id?: string | null
          relation?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          label?: string
          metadata?: Json
          parent_id?: string | null
          relation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_tree_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_tree_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "family_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          assets: Json
          created_at: string
          id: string
          income: number
          liabilities: Json
          user_id: string
        }
        Insert: {
          assets?: Json
          created_at?: string
          id?: string
          income?: number
          liabilities?: Json
          user_id: string
        }
        Update: {
          assets?: Json
          created_at?: string
          id?: string
          income?: number
          liabilities?: Json
          user_id?: string
        }
        Relationships: []
      }
      governance_answers: {
        Row: {
          conflict_prefs: string | null
          created_at: string
          decision_style: string | null
          id: string
          user_id: string
          values_answers: Json
        }
        Insert: {
          conflict_prefs?: string | null
          created_at?: string
          decision_style?: string | null
          id?: string
          user_id: string
          values_answers?: Json
        }
        Update: {
          conflict_prefs?: string | null
          created_at?: string
          decision_style?: string | null
          id?: string
          user_id?: string
          values_answers?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          family_id: string | null
          full_name: string | null
          id: string
          marital_status: string | null
          relationship_role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          family_id?: string | null
          full_name?: string | null
          id: string
          marital_status?: string | null
          relationship_role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          family_id?: string | null
          full_name?: string | null
          id?: string
          marital_status?: string | null
          relationship_role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      values_questionnaire: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          responses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          responses?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          responses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "values_questionnaire_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_charter_permission: {
        Args: {
          _user_id: string
          _family_id: string
          _min: Database["public"]["Enums"]["charter_permission"]
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _user_id: string; _family_id: string }
        Returns: boolean
      }
      is_family_owner: {
        Args: { _user_id: string; _family_id: string }
        Returns: boolean
      }
    }
    Enums: {
      charter_permission: "view" | "edit"
      family_role: "head" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      charter_permission: ["view", "edit"],
      family_role: ["head", "member"],
    },
  },
} as const
