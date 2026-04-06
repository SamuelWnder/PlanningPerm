export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectType =
  | "rear_extension"
  | "side_extension"
  | "loft_conversion"
  | "garage_conversion"
  | "outbuilding"
  | "new_dwelling"
  | "change_of_use"
  | "other";

export type PropertyType =
  | "detached"
  | "semi_detached"
  | "terraced"
  | "flat"
  | "bungalow"
  | "commercial";

export type ProjectStatus =
  | "draft"
  | "feasibility_complete"
  | "documents_ready"
  | "submitted"
  | "under_review"
  | "approved"
  | "refused"
  | "appeal_lodged"
  | "appeal_decided";

export type PlanningDecision = "approved" | "refused" | "withdrawn" | "split";

export type DocumentType =
  | "design_access_statement"
  | "planning_statement"
  | "cover_letter"
  | "appeal_statement";

export type AlertType =
  | "status_change"
  | "objection_received"
  | "officer_assigned"
  | "decision_due"
  | "decision_made"
  | "condition_attached";

// Required by @supabase/supabase-js v2 GenericTable
type EmptyRelationships = never[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          address: string;
          uprn: string | null;
          lpa_code: string | null;
          lpa_name: string | null;
          project_type: ProjectType;
          description: string;
          property_type: PropertyType;
          is_listed: boolean;
          is_conservation_area: boolean;
          status: ProjectStatus;
          feasibility_score: number | null;
          feasibility_report: Json | null;
          application_reference: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          address: string;
          uprn?: string | null;
          lpa_code?: string | null;
          lpa_name?: string | null;
          project_type: ProjectType;
          description: string;
          property_type: PropertyType;
          is_listed?: boolean;
          is_conservation_area?: boolean;
          status?: ProjectStatus;
          feasibility_score?: number | null;
          feasibility_report?: Json | null;
          application_reference?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          address?: string;
          uprn?: string | null;
          lpa_code?: string | null;
          lpa_name?: string | null;
          project_type?: ProjectType;
          description?: string;
          property_type?: PropertyType;
          is_listed?: boolean;
          is_conservation_area?: boolean;
          status?: ProjectStatus;
          feasibility_score?: number | null;
          feasibility_report?: Json | null;
          application_reference?: string | null;
        };
        Relationships: never[];
      };
      planning_decisions: {
        Row: {
          id: string;
          created_at: string;
          lpa_code: string;
          lpa_name: string;
          reference: string;
          address: string;
          description: string;
          application_type: string;
          decision: PlanningDecision;
          decision_date: string;
          conditions: string[] | null;
          officer_name: string | null;
          appeal_lodged: boolean;
          appeal_decision: string | null;
          raw_data: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          lpa_code: string;
          lpa_name: string;
          reference: string;
          address: string;
          description: string;
          application_type: string;
          decision: PlanningDecision;
          decision_date: string;
          conditions?: string[] | null;
          officer_name?: string | null;
          appeal_lodged?: boolean;
          appeal_decision?: string | null;
          raw_data?: Json | null;
        };
        Update: {
          id?: string;
          lpa_code?: string;
          lpa_name?: string;
          reference?: string;
          address?: string;
          description?: string;
          application_type?: string;
          decision?: PlanningDecision;
          decision_date?: string;
          conditions?: string[] | null;
          officer_name?: string | null;
          appeal_lodged?: boolean;
          appeal_decision?: string | null;
          raw_data?: Json | null;
        };
        Relationships: never[];
      };
      documents: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          project_id: string;
          document_type: DocumentType;
          title: string;
          content: string;
          version: number;
          is_final: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id: string;
          document_type: DocumentType;
          title: string;
          content: string;
          version?: number;
          is_final?: boolean;
        };
        Update: {
          id?: string;
          project_id?: string;
          document_type?: DocumentType;
          title?: string;
          content?: string;
          version?: number;
          is_final?: boolean;
        };
        Relationships: never[];
      };
      application_trackers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          project_id: string;
          reference: string;
          lpa_code: string;
          status: string;
          officer_assigned: string | null;
          consultation_end_date: string | null;
          decision_due_date: string | null;
          objections_count: number;
          last_checked: string;
          last_event: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id: string;
          reference: string;
          lpa_code: string;
          status?: string;
          officer_assigned?: string | null;
          consultation_end_date?: string | null;
          decision_due_date?: string | null;
          objections_count?: number;
          last_checked?: string;
          last_event?: string | null;
        };
        Update: {
          project_id?: string;
          reference?: string;
          lpa_code?: string;
          status?: string;
          officer_assigned?: string | null;
          consultation_end_date?: string | null;
          decision_due_date?: string | null;
          objections_count?: number;
          last_checked?: string;
          last_event?: string | null;
        };
        Relationships: never[];
      };
      alerts: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          user_id: string;
          type: AlertType;
          title: string;
          body: string;
          read: boolean;
          sent_email: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          user_id: string;
          type: AlertType;
          title: string;
          body: string;
          read?: boolean;
          sent_email?: boolean;
        };
        Update: {
          project_id?: string;
          user_id?: string;
          type?: AlertType;
          title?: string;
          body?: string;
          read?: boolean;
          sent_email?: boolean;
        };
        Relationships: never[];
      };
      lpas: {
        Row: {
          code: string;
          name: string;
          region: string;
          portal_url: string;
          portal_type: string;
          data_coverage_from: string | null;
          applications_scraped: number;
          last_scraped: string | null;
        };
        Insert: {
          code: string;
          name: string;
          region: string;
          portal_url: string;
          portal_type?: string;
          data_coverage_from?: string | null;
          applications_scraped?: number;
          last_scraped?: string | null;
        };
        Update: {
          name?: string;
          region?: string;
          portal_url?: string;
          portal_type?: string;
          data_coverage_from?: string | null;
          applications_scraped?: number;
          last_scraped?: string | null;
        };
        Relationships: never[];
      };
      policy_chunks: {
        Row: {
          id: string;
          lpa_code: string | null;
          document_name: string;
          section: string | null;
          content: string;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lpa_code?: string | null;
          document_name: string;
          section?: string | null;
          content: string;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: {
          lpa_code?: string | null;
          document_name?: string;
          section?: string | null;
          content?: string;
          embedding?: number[] | null;
        };
        Relationships: never[];
      };
      decision_embeddings: {
        Row: {
          id: string;
          decision_id: string;
          embedding: number[];
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          embedding: number[];
          content: string;
          created_at?: string;
        };
        Update: {
          embedding?: number[];
          content?: string;
        };
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_similar_decisions: {
        Args: {
          query_embedding: number[];
          filter_lpa_code: string;
          filter_application_type?: string | null;
          match_count?: number;
        };
        Returns: {
          decision_id: string;
          reference: string;
          address: string;
          description: string;
          decision: PlanningDecision;
          decision_date: string;
          lpa_name: string;
          similarity: number;
        }[];
      };
      search_policy_chunks: {
        Args: {
          query_embedding: number[];
          filter_lpa_code?: string | null;
          match_count?: number;
        };
        Returns: {
          chunk_id: string;
          lpa_code: string | null;
          document_name: string;
          section: string | null;
          content: string;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}

// Application-level types
export interface FeasibilityReport {
  score: number;
  confidence: "high" | "medium" | "low";
  summary: string;
  key_risks: Risk[];
  comparable_cases: ComparableCase[];
  policy_notes: string[];
  permitted_development: {
    likely_pd: boolean;
    pd_class: string | null;
    limitations: string[];
  };
  recommendation: string;
  generated_at: string;
}

export interface Risk {
  factor: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  mitigation?: string;
}

export interface ComparableCase {
  reference: string;
  address: string;
  description: string;
  decision: PlanningDecision;
  decision_date: string;
  similarity_score: number;
  notes?: string;
}

export interface LPA {
  code: string;
  name: string;
  region: string;
  portal_url: string;
  portal_type: string;
  data_coverage_from: string | null;
}
