-- HINOV GROUP - PostgreSQL Schema & RLS Migrations
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Roles
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'EDITOR', 'CATALOG_MANAGER');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'EDITOR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Publication Status
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE quote_status AS ENUM ('nouveau', 'en_traitement', 'repondu', 'cloture', 'archive');
CREATE TYPE price_mode AS ENUM ('show', 'hide', 'on_demand');

-- 3. Media Library
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INT,
  height INT,
  alt_text TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  folder TEXT DEFAULT 'Général',
  media_type TEXT DEFAULT 'image',
  poster_url TEXT,
  duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'Général';
ALTER TABLE media ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';
ALTER TABLE media ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS duration INT;

-- 4. Pages
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status publication_status DEFAULT 'draft',
  template TEXT DEFAULT 'standard',
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. Page Sections
CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  image_alt TEXT,
  cta_label TEXT,
  cta_link TEXT,
  secondary_cta_label TEXT,
  secondary_cta_link TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Page Versions (History)
CREATE TABLE IF NOT EXISTS page_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title TEXT NOT NULL,
  sections_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_name TEXT NOT NULL,
  note TEXT
);

-- 7. Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  accent_color TEXT DEFAULT 'blue',
  featured_image_url TEXT,
  gallery_urls TEXT[],
  prestations TEXT[] DEFAULT '{}',
  advantages TEXT[] DEFAULT '{}',
  status publication_status DEFAULT 'published',
  sort_order INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_name TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  reference TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'FCFA',
  unit TEXT DEFAULT 'pièce',
  price_display_mode price_mode DEFAULT 'show',
  availability TEXT DEFAULT 'in_stock',
  is_featured BOOLEAN DEFAULT FALSE,
  status publication_status DEFAULT 'published',
  primary_image_url TEXT NOT NULL,
  gallery_urls TEXT[],
  specifications JSONB DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Projects (Réalisations)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  featured_image_url TEXT NOT NULL,
  gallery_urls TEXT[],
  client_name TEXT,
  completion_date TEXT,
  status publication_status DEFAULT 'published',
  sort_order INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Quote Requests
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service_id TEXT REFERENCES services(id),
  service_name TEXT,
  message TEXT NOT NULL,
  budget TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  status quote_status DEFAULT 'nouveau',
  handled_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'HINOV Group',
  tagline TEXT DEFAULT 'Prestation de services & Solutions intégrées',
  phone TEXT DEFAULT '+225 07 19 54 95 82',
  email TEXT DEFAULT 'hinovgroup@hinovgroup.com',
  address TEXT DEFAULT 'Yopougon, Cité Verte',
  city TEXT DEFAULT 'Abidjan',
  country TEXT DEFAULT 'Côte d''Ivoire',
  whatsapp TEXT DEFAULT '+2250719549582',
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  logo_url TEXT,
  favicon_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  tiktok_url TEXT,
  default_seo_title TEXT DEFAULT 'HINOV Group — Prestation de services & Solutions intégrées',
  default_seo_description TEXT DEFAULT 'Site vitrine et catalogue officiel HINOV Group.',
  quote_notification_email TEXT DEFAULT 'hinovgroup@hinovgroup.com',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

-- 14. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read published content and site settings
CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read visible sections" ON page_sections FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Public read published services" ON services FOR SELECT USING (status = 'published');
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read published products" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public read media" ON media FOR SELECT USING (TRUE);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (TRUE);

-- Public can insert quotes
CREATE POLICY "Public create quotes" ON quotes FOR INSERT WITH CHECK (TRUE);

-- Authenticated Admin staff has full access
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access pages" ON pages FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access page_sections" ON page_sections FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access page_versions" ON page_versions FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access media" ON media FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access projects" ON projects FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access quotes" ON quotes FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admin full access audit_logs" ON audit_logs FOR ALL TO authenticated USING (TRUE);

-- 15. Storage Buckets & Policies for Public Media (Videos & Images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 104857600;

-- Storage RLS: Public read access to all media files
CREATE POLICY "Public Read Media Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Storage RLS: Authenticated & Admin write access
CREATE POLICY "Admin Upload Media Bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Admin Update Media Bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Admin Delete Media Bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

