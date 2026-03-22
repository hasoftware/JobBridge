CREATE INDEX IF NOT EXISTS idx_jobs_created_by        ON jobs           (created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_dates             ON jobs           (publishing_date, application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user_id   ON applications   (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id    ON applications   (job_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
