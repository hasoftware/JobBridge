CREATE INDEX IF NOT EXISTS idx_jobs_location_lower ON jobs (LOWER(location));
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies (industry);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
