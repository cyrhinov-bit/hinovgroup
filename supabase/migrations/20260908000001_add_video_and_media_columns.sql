-- Migration: Add video and rich media support to page_sections and media tables
-- Fixes issue where uploaded videos in sections or media library are not persisted in Supabase

-- 1. Add video columns to page_sections
ALTER TABLE page_sections 
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS image_media_id TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_poster_url TEXT,
  ADD COLUMN IF NOT EXISTS video_autoplay BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS video_loop BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS video_muted BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS video_controls BOOLEAN DEFAULT TRUE;

-- 2. Add video and categorization columns to media
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS poster_url TEXT,
  ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'Général',
  ADD COLUMN IF NOT EXISTS duration NUMERIC;
