ALTER TABLE jobs ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_count integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_jobs_view_count ON jobs (view_count DESC);
