import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from env or local storage configuration
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const LOCAL_STORAGE_KEY_URL = 'notionmap_supabase_url';
const LOCAL_STORAGE_KEY_ANON = 'notionmap_supabase_anon';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL) || ENV_URL;
  const anonKey = localStorage.getItem(LOCAL_STORAGE_KEY_ANON) || ENV_ANON_KEY;
  return { url, anonKey };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
  else localStorage.removeItem(LOCAL_STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(LOCAL_STORAGE_KEY_ANON, anonKey);
  else localStorage.removeItem(LOCAL_STORAGE_KEY_ANON);

  reinitializeSupabase();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function reinitializeSupabase() {
  supabaseInstance = null;
  return getSupabase();
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export const SUPABASE_SQL_MIGRATION = `-- ====================================================================
-- NOTIONMAP FULL DATABASE SCHEMA FOR SUPABASE & VERCEL
-- ====================================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Open your project > SQL Editor (in the left sidebar)
-- 3. Click "New query", paste this entire script, and click "Run"
-- ====================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique,
  password_hash text,
  full_name text default '',
  avatar_url text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

insert into public.accounts (email, username, password_hash, full_name)
values (
  'novalpriya@gmail.com',
  'novalpriya',
  'pass123',
  'Noval Priya'
)
on conflict (email) do nothing;

create table if not exists public.workspaces (
  id text primary key,
  user_email text not null,
  name text not null,
  icon text default '⚡',
  description text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.nodes (
  id text primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.connections (
  id text primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_workspaces_user on public.workspaces(user_email);
create index if not exists idx_nodes_workspace on public.nodes(workspace_id);
create index if not exists idx_connections_workspace on public.connections(workspace_id);
create index if not exists idx_accounts_email on public.accounts(email);
create index if not exists idx_accounts_username on public.accounts(username);

alter table public.accounts enable row level security;
alter table public.workspaces enable row level security;
alter table public.nodes enable row level security;
alter table public.connections enable row level security;

create policy "Accounts open access" on public.accounts for all using (true) with check (true);
create policy "Workspaces open access" on public.workspaces for all using (true) with check (true);
create policy "Nodes open access" on public.nodes for all using (true) with check (true);
create policy "Connections open access" on public.connections for all using (true) with check (true);
`;
