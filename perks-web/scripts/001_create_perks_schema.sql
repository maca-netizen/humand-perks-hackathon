-- Humand Perks Database Schema
-- Tables: profiles (employees), wallets, benefits, transactions, redemptions

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  company_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- 2. Wallets table (one per user)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  balance integer not null default 0,
  monthly_allowance integer not null default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wallets enable row level security;

create policy "wallets_select_own" on public.wallets for select using (auth.uid() = user_id);
create policy "wallets_update_own" on public.wallets for update using (auth.uid() = user_id);

-- 3. Benefits table (catalog of available perks)
create table if not exists public.benefits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  price integer not null,
  image_url text,
  merchant text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.benefits enable row level security;

-- Benefits are readable by all authenticated users
create policy "benefits_select_all" on public.benefits for select to authenticated using (true);

-- 4. Transactions table (credit/debit history)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount integer not null,
  description text not null,
  benefit_id uuid references public.benefits(id),
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);

-- 5. Redemptions table (benefit redemptions with voucher codes)
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  benefit_id uuid not null references public.benefits(id),
  transaction_id uuid references public.transactions(id),
  voucher_code text not null unique,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz default now()
);

alter table public.redemptions enable row level security;

create policy "redemptions_select_own" on public.redemptions for select using (auth.uid() = user_id);
create policy "redemptions_insert_own" on public.redemptions for insert with check (auth.uid() = user_id);
create policy "redemptions_update_own" on public.redemptions for update using (auth.uid() = user_id);

-- 6. Trigger to auto-create wallet and profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  
  -- Create wallet with initial balance
  insert into public.wallets (user_id, balance, monthly_allowance)
  values (new.id, 20, 20)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 7. Indexes for performance
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_redemptions_user_id on public.redemptions(user_id);
create index if not exists idx_redemptions_voucher_code on public.redemptions(voucher_code);
create index if not exists idx_benefits_category on public.benefits(category);
create index if not exists idx_benefits_is_active on public.benefits(is_active);
