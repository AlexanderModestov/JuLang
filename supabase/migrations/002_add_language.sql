-- Migration: Add language support to all relevant tables
-- All existing data defaults to 'fr' for backward compatibility

-- Add language column to vocabulary_progress
ALTER TABLE vocabulary_progress
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fr';

-- Add language column to grammar_cards
ALTER TABLE grammar_cards
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fr';

-- Add language column to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fr';

-- Add language column to user_progress (for per-language stats)
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fr';

-- Add active_language to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS active_language TEXT DEFAULT 'fr';

-- Add languages array to user_profiles (languages user is learning)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr']::TEXT[];

-- Create indexes for efficient language filtering
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_language
ON vocabulary_progress(user_id, language);

CREATE INDEX IF NOT EXISTS idx_grammar_cards_language
ON grammar_cards(user_id, language);

CREATE INDEX IF NOT EXISTS idx_conversations_language
ON conversations(user_id, language);

CREATE INDEX IF NOT EXISTS idx_user_progress_language
ON user_progress(user_id, language);

-- Add check constraint for valid languages
ALTER TABLE vocabulary_progress
ADD CONSTRAINT valid_language_vocab
CHECK (language IN ('fr', 'en', 'es', 'de', 'pt'));

ALTER TABLE grammar_cards
ADD CONSTRAINT valid_language_grammar
CHECK (language IN ('fr', 'en', 'es', 'de', 'pt'));

ALTER TABLE conversations
ADD CONSTRAINT valid_language_conv
CHECK (language IN ('fr', 'en', 'es', 'de', 'pt'));

ALTER TABLE user_profiles
ADD CONSTRAINT valid_active_language
CHECK (active_language IS NULL OR active_language IN ('fr', 'en', 'es', 'de', 'pt'));
