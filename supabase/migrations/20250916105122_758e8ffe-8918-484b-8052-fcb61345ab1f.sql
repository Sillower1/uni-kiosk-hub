-- Enable necessary extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run photo cleanup every minute
SELECT cron.schedule(
  'cleanup-expired-photos',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://mzjzkscqnnhxwlnpgbdr.supabase.co/functions/v1/cleanup-expired-photos',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16anprc2Nxbm5oeHdsbnBnYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzkzOTAsImV4cCI6MjA3MjIxNTM5MH0.PsB_zatjbFCPW603uqGxAKSGi_w0vB4bm8_JKMCzL1Q"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);