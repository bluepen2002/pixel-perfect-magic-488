export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assistance_requests: {
        Row: {
          amount_requested: number
          approved_amount: number | null
          category: string
          county: string | null
          created_at: string
          description: string
          id: string
          review_notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_requested: number
          approved_amount?: number | null
          category: string
          county?: string | null
          created_at?: string
          description: string
          id?: string
          review_notes?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_requested?: number
          approved_amount?: number | null
          category?: string
          county?: string | null
          created_at?: string
          description?: string
          id?: string
          review_notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount_kes: number
          created_at: string
          id: string
          method: string
          recurrence: string
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_kes: number
          created_at?: string
          id?: string
          method?: string
          recurrence?: string
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_kes?: number
          created_at?: string
          id?: string
          method?: string
          recurrence?: string
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_contributions: {
        Row: {
          amount_kes: number
          county: string
          created_at: string
          id: string
          member_name: string
          method: string
          reference: string | null
        }
        Insert: {
          amount_kes: number
          county: string
          created_at?: string
          id?: string
          member_name: string
          method?: string
          reference?: string | null
        }
        Update: {
          amount_kes?: number
          county?: string
          created_at?: string
          id?: string
          member_name?: string
          method?: string
          reference?: string | null
        }
        Relationships: []
      }
      demo_members: {
        Row: {
          county: string
          first_name: string
          id: string
          joined_at: string
          last_name: string
          phone: string
          subcounty: string
          verification_status: string
          village: string
          ward: string
        }
        Insert: {
          county: string
          first_name: string
          id?: string
          joined_at?: string
          last_name: string
          phone: string
          subcounty: string
          verification_status?: string
          village: string
          ward: string
        }
        Update: {
          county?: string
          first_name?: string
          id?: string
          joined_at?: string
          last_name?: string
          phone?: string
          subcounty?: string
          verification_status?: string
          village?: string
          ward?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          amount_requested: number
          approved_amount: number | null
          category: string
          county: string
          created_at: string
          description: string
          id: string
          member_name: string
          review_notes: string | null
          status: string
          subcounty: string | null
          title: string
          village: string | null
          ward: string | null
        }
        Insert: {
          amount_requested: number
          approved_amount?: number | null
          category: string
          county: string
          created_at?: string
          description: string
          id?: string
          member_name: string
          review_notes?: string | null
          status?: string
          subcounty?: string | null
          title: string
          village?: string | null
          ward?: string | null
        }
        Update: {
          amount_requested?: number
          approved_amount?: number | null
          category?: string
          county?: string
          created_at?: string
          description?: string
          id?: string
          member_name?: string
          review_notes?: string | null
          status?: string
          subcounty?: string | null
          title?: string
          village?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      home_media: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          kind: string
          published: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          kind: string
          published?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          published?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: []
      }
      impact_stories: {
        Row: {
          body: string
          county: string | null
          created_at: string
          id: string
          person_label: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          county?: string | null
          created_at?: string
          id?: string
          person_label?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          county?: string | null
          created_at?: string
          id?: string
          person_label?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kenya_locations: {
        Row: {
          county: string
          created_at: string
          id: string
          subcounty: string
          village: string
          ward: string
        }
        Insert: {
          county: string
          created_at?: string
          id?: string
          subcounty: string
          village: string
          ward: string
        }
        Update: {
          county?: string
          created_at?: string
          id?: string
          subcounty?: string
          village?: string
          ward?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          county: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          town: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          first_name?: string
          id: string
          last_name?: string
          phone?: string | null
          town?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          county?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          town?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      request_status_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          note: string | null
          request_id: string
          status: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
          status: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transparency_content: {
        Row: {
          body: string
          created_at: string
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "reviewer", "member"],
    },
  },
} as const
