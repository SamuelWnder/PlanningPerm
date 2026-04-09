CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text        NOT NULL,
  feature     text        NOT NULL,   -- 'documents' | 'tracker' | 'appeals' | 'marketplace'
  project_id  uuid        REFERENCES projects(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, feature, project_id)
);
