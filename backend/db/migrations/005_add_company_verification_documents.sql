CREATE TABLE IF NOT EXISTS company_verification_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    file_path text NOT NULL,
    file_name text NOT NULL DEFAULT '',
    document_type text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
