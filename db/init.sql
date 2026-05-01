CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id serial PRIMARY KEY,
    public_id integer UNIQUE,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    full_name text,
    phone text,
    date_of_birth date,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    address jsonb,
    bio text,
    notification_settings jsonb,
    role text DEFAULT 'job_seeker' NOT NULL CHECK (role IN ('job_seeker', 'recruiter', 'admin')),
    is_verified boolean DEFAULT false,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    name text,
    description text,
    website text,
    logo_url text,
    location text,
    industry text,
    company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    founded_year integer,
    phone text,
    verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'unverified')),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    responsibilities text,
    required_qualifications text,
    salary_min numeric,
    salary_max numeric,
    currency text,
    location text,
    job_type text,
    publishing_date timestamp DEFAULT now(),
    application_deadline timestamp,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    created_by integer REFERENCES users(id),
    view_count integer DEFAULT 0,
    apply_count integer DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    cv_url text NOT NULL,
    status text DEFAULT 'submitted',
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE saved_jobs (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at timestamp DEFAULT now(),
    UNIQUE (user_id, job_id)
);

CREATE TABLE cvs (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    template text DEFAULT 'modern_clean',
    color text DEFAULT '#2563eb',
    is_default boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_jobs_company_id ON jobs (company_id);
CREATE INDEX idx_jobs_created_by ON jobs (created_by);
CREATE INDEX idx_jobs_dates ON jobs (publishing_date, application_deadline);
CREATE INDEX idx_applications_user_id ON applications (user_id);
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_saved_jobs_user_created ON saved_jobs (user_id, created_at DESC);
CREATE INDEX idx_cvs_user_updated ON cvs (user_id, updated_at DESC);
