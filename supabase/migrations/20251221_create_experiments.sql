-- Create experiments table
create table if not exists experiments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  hypothesis text,
  start_date timestamptz not null,
  end_date timestamptz, -- null means ongoing
  status text check (status in ('active', 'completed', 'cancelled')) default 'active',
  metrics text[] default '{}', -- Array of metric IDs to track
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table experiments enable row level security;

-- Policy: Allow all access for authenticated users (for now, assuming single user app)
create policy "Enable all access for authenticated users" on experiments
  for all using (auth.role() = 'authenticated');

-- Verify policy
select * from experiments;
