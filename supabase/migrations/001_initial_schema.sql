-- Enable pgvector for similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROJECTS
-- =============================================
CREATE TYPE project_type AS ENUM (
  'rear_extension', 'side_extension', 'loft_conversion',
  'garage_conversion', 'outbuilding', 'new_dwelling',
  'change_of_use', 'other'
);

CREATE TYPE property_type AS ENUM (
  'detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'commercial'
);

CREATE TYPE project_status AS ENUM (
  'draft', 'feasibility_complete', 'documents_ready', 'submitted',
  'under_review', 'approved', 'refused', 'appeal_lodged', 'appeal_decided'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,                  -- Clerk user ID
  address TEXT NOT NULL,
  uprn TEXT,
  lpa_code TEXT,
  lpa_name TEXT,
  project_type project_type NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  property_type property_type NOT NULL DEFAULT 'detached',
  is_listed BOOLEAN NOT NULL DEFAULT false,
  is_conservation_area BOOLEAN NOT NULL DEFAULT false,
  status project_status NOT NULL DEFAULT 'draft',
  feasibility_score NUMERIC(5,2),
  feasibility_report JSONB,
  application_reference TEXT
);

CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_lpa_code_idx ON projects(lpa_code);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- PLANNING DECISIONS (historical data)
-- =============================================
CREATE TYPE planning_decision AS ENUM ('approved', 'refused', 'withdrawn', 'split');

CREATE TABLE planning_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  lpa_code TEXT NOT NULL,
  lpa_name TEXT NOT NULL,
  reference TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  application_type TEXT NOT NULL,
  decision planning_decision NOT NULL,
  decision_date DATE NOT NULL,
  conditions TEXT[],
  officer_name TEXT,
  appeal_lodged BOOLEAN NOT NULL DEFAULT false,
  appeal_decision TEXT,
  raw_data JSONB,
  UNIQUE(lpa_code, reference)
);

CREATE INDEX decisions_lpa_code_idx ON planning_decisions(lpa_code);
CREATE INDEX decisions_decision_date_idx ON planning_decisions(decision_date);
CREATE INDEX decisions_application_type_idx ON planning_decisions(application_type);
CREATE INDEX decisions_decision_idx ON planning_decisions(decision);

-- =============================================
-- DECISION EMBEDDINGS (for vector similarity search)
-- =============================================
CREATE TABLE decision_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id UUID NOT NULL REFERENCES planning_decisions(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,       -- OpenAI text-embedding-3-small
  content TEXT NOT NULL,                 -- The text that was embedded
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX decision_embeddings_decision_id_idx ON decision_embeddings(decision_id);
-- IVFFlat index for approximate nearest neighbour search
CREATE INDEX decision_embeddings_vector_idx ON decision_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- POLICY CHUNKS (local plan / NPPF embeddings)
-- =============================================
CREATE TABLE policy_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lpa_code TEXT,                         -- NULL = national policy (NPPF)
  document_name TEXT NOT NULL,
  section TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX policy_chunks_lpa_code_idx ON policy_chunks(lpa_code);
CREATE INDEX policy_chunks_vector_idx ON policy_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- =============================================
-- DOCUMENTS
-- =============================================
CREATE TYPE document_type AS ENUM (
  'design_access_statement', 'planning_statement',
  'cover_letter', 'appeal_statement'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  is_final BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX documents_project_id_idx ON documents(project_id);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- APPLICATION TRACKERS
-- =============================================
CREATE TABLE application_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  lpa_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  officer_assigned TEXT,
  consultation_end_date DATE,
  decision_due_date DATE,
  objections_count INTEGER NOT NULL DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT now(),
  last_event TEXT,
  UNIQUE(project_id)
);

CREATE TRIGGER application_trackers_updated_at
  BEFORE UPDATE ON application_trackers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ALERTS
-- =============================================
CREATE TYPE alert_type AS ENUM (
  'status_change', 'objection_received', 'officer_assigned',
  'decision_due', 'decision_made', 'condition_attached'
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  sent_email BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX alerts_user_id_idx ON alerts(user_id);
CREATE INDEX alerts_project_id_idx ON alerts(project_id);
CREATE INDEX alerts_read_idx ON alerts(read) WHERE read = false;

-- =============================================
-- LPA REFERENCE TABLE
-- =============================================
CREATE TABLE lpas (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  portal_url TEXT NOT NULL,
  portal_type TEXT NOT NULL DEFAULT 'idox',
  data_coverage_from DATE,
  applications_scraped INTEGER NOT NULL DEFAULT 0,
  last_scraped TIMESTAMPTZ
);

-- =============================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION search_similar_decisions(
  query_embedding vector(1536),
  filter_lpa_code TEXT,
  filter_application_type TEXT DEFAULT NULL,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  decision_id UUID,
  reference TEXT,
  address TEXT,
  description TEXT,
  decision planning_decision,
  decision_date DATE,
  lpa_name TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    pd.id AS decision_id,
    pd.reference,
    pd.address,
    pd.description,
    pd.decision,
    pd.decision_date,
    pd.lpa_name,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM decision_embeddings de
  JOIN planning_decisions pd ON pd.id = de.decision_id
  WHERE pd.lpa_code = filter_lpa_code
    AND (filter_application_type IS NULL OR pd.application_type = filter_application_type)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION search_policy_chunks(
  query_embedding vector(1536),
  filter_lpa_code TEXT DEFAULT NULL,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  lpa_code TEXT,
  document_name TEXT,
  section TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    pc.id AS chunk_id,
    pc.lpa_code,
    pc.document_name,
    pc.section,
    pc.content,
    1 - (pc.embedding <=> query_embedding) AS similarity
  FROM policy_chunks pc
  WHERE (filter_lpa_code IS NULL OR pc.lpa_code = filter_lpa_code OR pc.lpa_code IS NULL)
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own projects
CREATE POLICY "Users own their projects"
  ON projects FOR ALL
  USING (auth.jwt() ->> 'sub' = user_id);

-- Documents are accessible via project ownership
CREATE POLICY "Users own their documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users own their trackers"
  ON application_trackers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = application_trackers.project_id
        AND projects.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users own their alerts"
  ON alerts FOR ALL
  USING (auth.jwt() ->> 'sub' = user_id);

-- Planning decisions and LPAs are publicly readable
ALTER TABLE planning_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planning decisions are public"
  ON planning_decisions FOR SELECT USING (true);

ALTER TABLE lpas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LPAs are public"
  ON lpas FOR SELECT USING (true);
