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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id: string
          name: string
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          detail: string | null
          domain_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          detail?: string | null
          domain_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          detail?: string | null
          domain_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_resources: {
        Row: {
          created_at: string
          description: string | null
          domain_id: string
          duration: string | null
          id: string
          is_active: boolean
          resource_type: string
          sort_order: number
          source: string | null
          thumbnail: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_id: string
          duration?: string | null
          id?: string
          is_active?: boolean
          resource_type?: string
          sort_order?: number
          source?: string | null
          thumbnail?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_id?: string
          duration?: string | null
          id?: string
          is_active?: boolean
          resource_type?: string
          sort_order?: number
          source?: string | null
          thumbnail?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      ai_credit_usage: {
        Row: {
          amount: number
          created_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          feature?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_credits: {
        Row: {
          created_at: string
          id: string
          period_start: string
          plan_credits: number
          plan_id: string
          topup_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_start?: string
          plan_credits?: number
          plan_id?: string
          topup_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_start?: string
          plan_credits?: number
          plan_id?: string
          topup_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "assistant_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          domain_id: string
          id: string
          meeting_link: string | null
          mentor_id: string
          notes: string | null
          slot_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          id?: string
          meeting_link?: string | null
          mentor_id: string
          notes?: string | null
          slot_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          id?: string
          meeting_link?: string | null
          mentor_id?: string
          notes?: string | null
          slot_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "mentor_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          domain_id: string
          id: string
          resource_id: string
          resource_title: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          id?: string
          resource_id: string
          resource_title: string
          resource_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          id?: string
          resource_id?: string
          resource_title?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          code: string
          id: string
          is_correct: boolean | null
          submitted_at: string
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          code: string
          id?: string
          is_correct?: boolean | null
          submitted_at?: string
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          code?: string
          id?: string
          is_correct?: boolean | null
          submitted_at?: string
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          code_snippet: string | null
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          code_snippet?: string | null
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          code_snippet?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          code_language: string | null
          code_snippet: string | null
          content: string
          created_at: string
          domain_id: string
          file_url: string | null
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          code_language?: string | null
          code_snippet?: string | null
          content: string
          created_at?: string
          domain_id: string
          file_url?: string | null
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          code_language?: string | null
          code_snippet?: string | null
          content?: string
          created_at?: string
          domain_id?: string
          file_url?: string | null
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          code_language: string | null
          code_snippet: string | null
          comments_count: number
          content: string
          created_at: string
          domain_id: string
          id: string
          image_url: string | null
          is_pinned: boolean
          likes_count: number
          post_type: string
          project_link: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code_language?: string | null
          code_snippet?: string | null
          comments_count?: number
          content: string
          created_at?: string
          domain_id: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          likes_count?: number
          post_type?: string
          project_link?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code_language?: string | null
          code_snippet?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          domain_id?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          likes_count?: number
          post_type?: string
          project_link?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string
          id: string
          kind: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          created_at?: string
          description?: string
          id?: string
          kind: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string
          id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          created_at: string
          description: string
          difficulty: string
          domain_id: string
          hints: string[] | null
          id: string
          solution_code: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          challenge_date?: string
          created_at?: string
          description: string
          difficulty?: string
          domain_id: string
          hints?: string[] | null
          id?: string
          solution_code?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          created_at?: string
          description?: string
          difficulty?: string
          domain_id?: string
          hints?: string[] | null
          id?: string
          solution_code?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      design_projects: {
        Row: {
          canvas_data: Json
          created_at: string
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data?: Json
          created_at?: string
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_progress: {
        Row: {
          completed_topics: string[]
          created_at: string
          domain_id: string
          id: string
          last_accessed_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_topics?: string[]
          created_at?: string
          domain_id: string
          id?: string
          last_accessed_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_topics?: string[]
          created_at?: string
          domain_id?: string
          id?: string
          last_accessed_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_locks: {
        Row: {
          category: string
          key: string
          label: string
          locked: boolean
          message: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          key: string
          label: string
          locked?: boolean
          message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          key?: string
          label?: string
          locked?: boolean
          message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          rating: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          rating?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      github_connections: {
        Row: {
          access_token: string
          auth_type: string
          created_at: string
          github_login: string | null
          id: string
          last_repo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          auth_type: string
          created_at?: string
          github_login?: string | null
          id?: string
          last_repo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          auth_type?: string
          created_at?: string
          github_login?: string | null
          id?: string
          last_repo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          admin_notes: string | null
          college: string | null
          created_at: string
          email: string
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          resume_filename: string | null
          resume_url: string | null
          role: string
          skills: string | null
          status: string
          updated_at: string
          user_id: string | null
          why_join: string | null
          year_of_study: string | null
        }
        Insert: {
          admin_notes?: string | null
          college?: string | null
          created_at?: string
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          role: string
          skills?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          why_join?: string | null
          year_of_study?: string | null
        }
        Update: {
          admin_notes?: string | null
          college?: string | null
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          role?: string
          skills?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          why_join?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      media_generations: {
        Row: {
          asset_path: string | null
          created_at: string
          id: string
          kind: string
          meta: Json
          prompt: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_path?: string | null
          created_at?: string
          id?: string
          kind: string
          meta?: Json
          prompt: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_path?: string | null
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
          prompt?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_booked: boolean
          mentor_id: string
          slot_date: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_booked?: boolean
          mentor_id: string
          slot_date: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          mentor_id?: string
          slot_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_slots_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_tips: string | null
          college_preparation: string | null
          company: string
          created_at: string
          domain_id: string
          email: string
          id: string
          is_active: boolean
          journey_summary: string | null
          meeting_link: string | null
          name: string
          role: string
          tech_stack: string[] | null
          years_experience: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_tips?: string | null
          college_preparation?: string | null
          company: string
          created_at?: string
          domain_id: string
          email: string
          id?: string
          is_active?: boolean
          journey_summary?: string | null
          meeting_link?: string | null
          name: string
          role: string
          tech_stack?: string[] | null
          years_experience?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_tips?: string | null
          college_preparation?: string | null
          company?: string
          created_at?: string
          domain_id?: string
          email?: string
          id?: string
          is_active?: boolean
          journey_summary?: string | null
          meeting_link?: string | null
          name?: string
          role?: string
          tech_stack?: string[] | null
          years_experience?: number
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          domain_id: string
          id: string
          plan_id: string
          reviewed_at: string | null
          status: string
          user_id: string
          utr_number: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          domain_id: string
          id?: string
          plan_id: string
          reviewed_at?: string | null
          status?: string
          user_id: string
          utr_number: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          domain_id?: string
          id?: string
          plan_id?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
          utr_number?: string
        }
        Relationships: []
      }
      pop_ads: {
        Row: {
          created_at: string
          end_date: string
          festival_name: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          sort_order: number
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          end_date: string
          festival_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          end_date?: string
          festival_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          dob: string | null
          id: string
          interests: string[]
          onboarded_at: string | null
          resume_filename: string | null
          resume_url: string | null
          stream: string | null
          updated_at: string
          user_id: string
          username: string | null
          wants_to_join_team: boolean
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          dob?: string | null
          id?: string
          interests?: string[]
          onboarded_at?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          stream?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          wants_to_join_team?: boolean
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          dob?: string | null
          id?: string
          interests?: string[]
          onboarded_at?: string | null
          resume_filename?: string | null
          resume_url?: string | null
          stream?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wants_to_join_team?: boolean
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          id: string
          page_path: string | null
          user_agent: string | null
          visited_at: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          page_path?: string | null
          user_agent?: string | null
          visited_at?: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          page_path?: string | null
          user_agent?: string | null
          visited_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          assessed_at: string
          domain_id: string
          id: string
          score: number
          topic: string
          user_id: string
        }
        Insert: {
          assessed_at?: string
          domain_id: string
          id?: string
          score?: number
          topic: string
          user_id: string
        }
        Update: {
          assessed_at?: string
          domain_id?: string
          id?: string
          score?: number
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id: string
          interval?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          domain_id: string | null
          expires_at: string
          id: string
          plan_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          domain_id?: string | null
          expires_at: string
          id?: string
          plan_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          domain_id?: string | null
          expires_at?: string
          id?: string
          plan_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_files: {
        Row: {
          content: string | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          language: string | null
          last_edited_by: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name: string
          file_path?: string
          id?: string
          language?: string | null
          last_edited_by?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          language?: string | null
          last_edited_by?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "team_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "team_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "team_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          code_snippet: string | null
          content: string
          created_at: string
          id: string
          message_type: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          code_snippet?: string | null
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          code_snippet?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "team_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_projects: {
        Row: {
          created_at: string
          description: string
          difficulty: string | null
          domain_id: string
          id: string
          max_members: number | null
          owner_id: string
          status: string
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty?: string | null
          domain_id: string
          id?: string
          max_members?: number | null
          owner_id: string
          status?: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string | null
          domain_id?: string
          id?: string
          max_members?: number | null
          owner_id?: string
          status?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
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
      user_xp: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_topup_credits: {
        Args: { _credits: number; _user_id: string }
        Returns: Json
      }
      admin_list_profiles: {
        Args: never
        Returns: {
          age: number | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          dob: string | null
          id: string
          interests: string[]
          onboarded_at: string | null
          resume_filename: string | null
          resume_url: string | null
          stream: string | null
          updated_at: string
          user_id: string
          username: string | null
          wants_to_join_team: boolean
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      consume_ai_credit: {
        Args: { _amount?: number; _feature?: string; _user_id: string }
        Returns: Json
      }
      count_unique_visitors: { Args: never; Returns: number }
      generate_username: { Args: { _seed: string }; Returns: string }
      get_my_profile: {
        Args: never
        Returns: {
          age: number | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          dob: string | null
          id: string
          interests: string[]
          onboarded_at: string | null
          resume_filename: string | null
          resume_url: string | null
          stream: string | null
          updated_at: string
          user_id: string
          username: string | null
          wants_to_join_team: boolean
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_plan: { Args: { _user_id: string }; Returns: string }
      get_visitor_trends: {
        Args: never
        Returns: {
          visit_date: string
          visitor_count: number
        }[]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      plan_credit_allowance: { Args: { _plan_id: string }; Returns: number }
      sync_ai_credits: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          id: string
          period_start: string
          plan_credits: number
          plan_id: string
          topup_credits: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ai_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      team_member_counts: {
        Args: never
        Returns: {
          member_count: number
          project_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
