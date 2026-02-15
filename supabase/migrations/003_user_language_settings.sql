-- Migration: Create user_language_settings table
-- Stores per-language level and stats for each user

create table user_language_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  language text not null,
  level text not null default 'A1',
  words_learned int default 0,
  grammar_topics_completed int default 0,
  conversations_count int default 0,
  exercises_solved int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, language),

  constraint valid_language check (language in ('fr', 'en', 'es', 'de', 'pt')),
  constraint valid_level check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

-- Enable RLS
alter table user_language_settings enable row level security;

-- RLS policies
create policy "Users can view own language settings"
  on user_language_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own language settings"
  on user_language_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own language settings"
  on user_language_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own language settings"
  on user_language_settings for delete
  using (auth.uid() = user_id);

-- Index for fast lookups
create index idx_user_language_settings_user_id on user_language_settings(user_id);

-- Auto-update updated_at
create trigger update_user_language_settings_updated_at
  before update on user_language_settings
  for each row execute function update_updated_at();

-- Migrate existing data: create entry from french_level for each onboarded user
insert into user_language_settings (user_id, language, level)
select
  id as user_id,
  'fr' as language,
  coalesce(french_level, 'A1') as level
from user_profiles
where is_onboarded = true
on conflict (user_id, language) do nothing;

-- If languages column exists, also create settings for additional languages
-- (column added by migration 002, may not be present on all environments)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'user_profiles' and column_name = 'languages'
  ) then
    execute '
      insert into user_language_settings (user_id, language, level)
      select
        up.id as user_id,
        unnest(up.languages) as language,
        ''A1'' as level
      from user_profiles up
      where up.is_onboarded = true
        and array_length(up.languages, 1) > 0
      on conflict (user_id, language) do nothing
    ';
  end if;
end $$;
