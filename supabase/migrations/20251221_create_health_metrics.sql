-- Create the health_metrics table
create table if not exists health_metrics (
  id uuid default gen_random_uuid() primary key,
  metric_name text not null,
  value numeric not null,
  unit text not null,
  source text not null,
  recorded_at timestamptz not null,
  created_at timestamptz default now()
);

-- Index for faster time-range queries
create index if not exists health_metrics_recorded_at_idx on health_metrics (recorded_at);

-- Combined index for querying specific metrics over time
create index if not exists health_metrics_name_time_idx on health_metrics (metric_name, recorded_at);

-- RLS Policies (Enable if RLS is on, but keeping open for anon ingest for now as per plan implies)
alter table health_metrics enable row level security;

-- Allow public read access (for the dashboard)
create policy "Allow public read access"
  on health_metrics for select
  using (true);

-- Allow authenticated/anon insert access (for the edge function/local script)
create policy "Allow public insert access"
  on health_metrics for insert
  with check (true);
