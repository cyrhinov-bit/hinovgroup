/**
 * HINOV Group - TypeScript Definitions & Data Models
 */

export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'CATALOG_MANAGER';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  created_at: string;
}

export type PublicationStatus = 'draft' | 'published' | 'archived';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  filename: string;
  file_name?: string;
  url: string;
  storage_path?: string;
  mime_type: string;
  media_type?: MediaType;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  poster_url?: string;
  alt_text?: string;
  title: string;
  description?: string;
  category?: string;
  folder?: string;
  created_at: string;
  uploaded_by?: string;
  used_in?: Array<{
    type: 'page' | 'service' | 'product' | 'project' | 'settings';
    name: string;
    location: string;
  }>;
}

export type SectionType =
  | 'hero'
  | 'presentation'
  | 'video_spotlight'
  | 'services_grid'
  | 'why_us'
  | 'featured_products'
  | 'projects_grid'
  | 'cta'
  | 'contact_quick'
  | 'rich_text'
  | 'kpi_stats'
  | 'gallery'
  | 'faq';

export interface PageSection {
  id: string;
  page_id: string;
  section_type: SectionType;
  title: string;
  subtitle?: string;
  content: string;
  // Media configuration: static image or short video
  media_type?: 'image' | 'video';
  image_url?: string;
  image_alt?: string;
  image_media_id?: string;
  video_url?: string;
  video_poster_url?: string;
  video_autoplay?: boolean;
  video_loop?: boolean;
  video_muted?: boolean;
  video_controls?: boolean;
  cta_label?: string;
  cta_link?: string;
  secondary_cta_label?: string;
  secondary_cta_link?: string;
  settings?: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export interface PageVersion {
  id: string;
  page_id: string;
  version_number: number;
  title: string;
  sections_snapshot: PageSection[];
  created_at: string;
  author_name: string;
  note?: string;
}

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: PublicationStatus;
  template: 'standard' | 'fullwidth' | 'blank';
  seo_title: string;
  seo_description: string;
  og_image_url?: string;
  sections: PageSection[];
  updated_at: string;
  created_at: string;
  updated_by?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  icon_name: string;
  accent_color: 'blue' | 'green' | 'orange' | 'magenta';
  featured_image_url: string;
  gallery_urls?: string[];
  prestations: string[];
  advantages?: string[];
  status: PublicationStatus;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
}

export type PriceDisplayMode = 'show' | 'hide' | 'on_demand';

export interface ProductItem {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  reference: string;
  short_description: string;
  description: string;
  price?: number;
  currency: string;
  unit?: string;
  price_display_mode: PriceDisplayMode;
  availability: 'in_stock' | 'on_order' | 'out_of_stock';
  is_featured: boolean;
  status: PublicationStatus;
  primary_image_url: string;
  gallery_urls?: string[];
  specifications?: Array<{ key: string; value: string }>;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  featured_image_url: string;
  gallery_urls?: string[];
  client_name?: string;
  completion_date?: string;
  status: PublicationStatus;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export type QuoteStatus = 'nouveau' | 'en_cours' | 'en_traitement' | 'repondu' | 'traite' | 'cloture' | 'archive';

// Aliases for developer convenience
export type Page = PageItem;
export type Service = ServiceItem;
export type Product = ProductItem;
export type Project = ProjectItem;
export type NavItem = NavigationItem;

export interface QuoteRequest {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  service_id?: string;
  service_name?: string;
  message: string;
  budget?: string;
  attachment_url?: string;
  attachment_name?: string;
  status: QuoteStatus;
  handled_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  company_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  whatsapp: string;
  whatsapp_enabled: boolean;
  logo_url?: string;
  favicon_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  default_seo_title: string;
  default_seo_description: string;
  quote_notification_email: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  sort_order: number;
  is_visible: boolean;
  children?: Array<{
    label: string;
    path: string;
  }>;
}

export interface FooterSection {
  id: string;
  title: string;
  sort_order: number;
  is_visible: boolean;
  links: Array<{
    label: string;
    path: string;
    is_external?: boolean;
  }>;
}

export interface AuditLogItem {
  id: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  timestamp: string;
  details?: string;
}
