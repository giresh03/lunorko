create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null default 'Lunor.AI',
  location text not null default 'Global',
  mode text not null default 'online',
  start_date date not null,
  end_date date not null,
  registration_deadline date,
  prize_pool text,
  website_url text not null default '',
  banner_url text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hackathon_projects (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid references public.hackathons(id) on delete set null,
  title text not null,
  summary text,
  winner_name text,
  tech_stack text[] not null default '{}',
  team_size integer not null default 1,
  max_buyers integer not null default 0,
  buyers_count integer not null default 0,
  price integer not null default 0,
  preview_url text,
  repository_url text,
  thumbnail_url text,
  deliverable_url text,
  access_instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hackathon_project_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid not null references public.hackathon_projects(id) on delete cascade,
  amount integer not null default 0,
  currency text not null default 'INR',
  status text not null default 'paid',
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  created_at timestamptz not null default now()
);

grant select on public.hackathons to anon, authenticated;
grant select on public.hackathon_projects to anon, authenticated;
grant select on public.hackathon_project_purchases to authenticated;
grant all on public.hackathons to service_role;
grant all on public.hackathon_projects to service_role;
grant all on public.hackathon_project_purchases to service_role;

alter table public.hackathons enable row level security;
alter table public.hackathon_projects enable row level security;
alter table public.hackathon_project_purchases enable row level security;

create policy "Public can view hackathons"
  on public.hackathons for select using (true);
create policy "Public can view hackathon projects"
  on public.hackathon_projects for select using (true);
create policy "Buyers can view own purchases"
  on public.hackathon_project_purchases for select to authenticated
  using (user_id = auth.uid());

create or replace function public.bump_hackathon_buyers()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.hackathon_projects
    set buyers_count = buyers_count + 1
    where id = new.project_id;
  return new;
end $$;

drop trigger if exists hackathon_purchase_count on public.hackathon_project_purchases;
create trigger hackathon_purchase_count
after insert on public.hackathon_project_purchases
for each row execute function public.bump_hackathon_buyers();