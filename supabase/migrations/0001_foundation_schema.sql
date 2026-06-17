-- 4UFitness Foundation schema draft
-- Apply only after review.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age int,
  height_cm int,
  weight_kg numeric,
  goal text check (goal in ('FIT', 'LEAN', 'BULK')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  body_type text,
  estimated_fat_ratio numeric,
  recommended_goal text,
  raw_result jsonb,
  created_at timestamptz default now()
);
