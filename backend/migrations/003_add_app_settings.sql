CREATE TABLE IF NOT EXISTS app_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES (
    'email',
    '{"smtp_host":"","encryption":"tls","smtp_port":587,"smtp_user":"","from_email":"","smtp_pass":""}'::jsonb
) ON CONFLICT (key) DO NOTHING;
