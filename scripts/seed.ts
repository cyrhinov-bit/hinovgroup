import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cqhikivkqxzbiuhmrfyo.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY non défini dans les variables d\'environnement.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

import {
  INITIAL_SETTINGS,
  INITIAL_MEDIA,
  INITIAL_SERVICES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_PAGES,
} from '../src/lib/initialData';

async function seed() {
  console.log('🚀 Démarrage du Seeding Supabase pour HINOV Group...');

  // 1. Site Settings
  console.log('📦 Insertion des paramètres du site...');
  const { error: settingsError } = await supabase.from('site_settings').upsert({
    id: 'default',
    company_name: INITIAL_SETTINGS.company_name,
    tagline: INITIAL_SETTINGS.tagline,
    phone: INITIAL_SETTINGS.phone,
    email: INITIAL_SETTINGS.email,
    address: INITIAL_SETTINGS.address,
    city: INITIAL_SETTINGS.city,
    country: INITIAL_SETTINGS.country,
    whatsapp: INITIAL_SETTINGS.whatsapp,
    whatsapp_enabled: INITIAL_SETTINGS.whatsapp_enabled,
    logo_url: INITIAL_SETTINGS.logo_url,
    favicon_url: INITIAL_SETTINGS.favicon_url,
    facebook_url: INITIAL_SETTINGS.facebook_url,
    instagram_url: INITIAL_SETTINGS.instagram_url,
    linkedin_url: INITIAL_SETTINGS.linkedin_url,
    tiktok_url: INITIAL_SETTINGS.tiktok_url,
    default_seo_title: INITIAL_SETTINGS.default_seo_title,
    default_seo_description: INITIAL_SETTINGS.default_seo_description,
    quote_notification_email: INITIAL_SETTINGS.quote_notification_email,
  });
  if (settingsError) console.error('Erreur settings:', settingsError);

  // 2. Services
  console.log('📦 Insertion des services...');
  for (const s of INITIAL_SERVICES) {
    const { error } = await supabase.from('services').upsert({
      id: s.id,
      name: s.name,
      slug: s.slug,
      short_description: s.short_description,
      description: s.description,
      icon_name: s.icon_name,
      accent_color: s.accent_color,
      featured_image_url: s.featured_image_url,
      gallery_urls: s.gallery_urls || [],
      prestations: s.prestations,
      advantages: s.advantages || [],
      status: s.status,
      sort_order: s.sort_order,
      seo_title: s.seo_title,
      seo_description: s.seo_description,
    });
    if (error) console.error(`Erreur service ${s.name}:`, error);
  }

  // 3. Categories
  console.log('📦 Insertion des catégories...');
  for (const c of INITIAL_CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url,
      icon_name: c.icon_name,
      sort_order: c.sort_order,
      is_active: c.is_active,
      seo_title: c.seo_title,
      seo_description: c.seo_description,
    });
    if (error) console.error(`Erreur catégorie ${c.name}:`, error);
  }

  // 4. Products
  console.log('📦 Insertion des produits...');
  for (const p of INITIAL_PRODUCTS) {
    const { error } = await supabase.from('products').upsert({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      reference: p.reference,
      short_description: p.short_description,
      description: p.description,
      price: p.price,
      currency: p.currency,
      unit: p.unit,
      price_display_mode: p.price_display_mode,
      availability: p.availability,
      is_featured: p.is_featured,
      status: p.status,
      primary_image_url: p.primary_image_url,
      gallery_urls: p.gallery_urls || [],
      specifications: p.specifications || [],
      sort_order: p.sort_order,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
    });
    if (error) console.error(`Erreur produit ${p.name}:`, error);
  }

  // 5. Projects
  console.log('📦 Insertion des réalisations...');
  for (const proj of INITIAL_PROJECTS) {
    const { error } = await supabase.from('projects').upsert({
      id: proj.id,
      title: proj.title,
      slug: proj.slug,
      description: proj.description,
      category: proj.category,
      featured_image_url: proj.featured_image_url,
      gallery_urls: proj.gallery_urls || [],
      client_name: proj.client_name,
      completion_date: proj.completion_date,
      status: proj.status,
      sort_order: proj.sort_order,
      seo_title: proj.seo_title,
      seo_description: proj.seo_description,
    });
    if (error) console.error(`Erreur projet ${proj.title}:`, error);
  }

  // 6. Pages & Sections
  console.log('📦 Insertion des pages et sections...');
  for (const page of INITIAL_PAGES) {
    const { error: pageErr } = await supabase.from('pages').upsert({
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      template: page.template,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      og_image_url: page.og_image_url,
    });
    if (pageErr) console.error(`Erreur page ${page.title}:`, pageErr);

    for (const sec of page.sections) {
      const { error: secErr } = await supabase.from('page_sections').upsert({
        id: sec.id,
        page_id: page.id,
        section_type: sec.section_type,
        title: sec.title,
        subtitle: sec.subtitle,
        content: sec.content,
        image_url: sec.image_url,
        image_alt: sec.image_alt,
        cta_label: sec.cta_label,
        cta_link: sec.cta_link,
        secondary_cta_label: sec.secondary_cta_label,
        secondary_cta_link: sec.secondary_cta_link,
        settings: sec.settings || {},
        sort_order: sec.sort_order,
        is_visible: sec.is_visible,
      });
      if (secErr) console.error(`Erreur section ${sec.title}:`, secErr);
    }
  }

  // 7. Media items
  console.log('📦 Insertion de la médiathèque...');
  for (const m of INITIAL_MEDIA) {
    const { error } = await supabase.from('media').upsert({
      id: m.id,
      filename: m.filename,
      storage_path: m.storage_path || null,
      url: m.url,
      mime_type: m.mime_type,
      file_size: m.file_size,
      width: m.width,
      height: m.height,
      alt_text: m.alt_text || '',
      title: m.title,
      description: m.description,
      category: m.category || 'General',
    });
    if (error) console.error(`Erreur media ${m.title}:`, error);
  }

  // 8. Super Admin User in Supabase Auth
  console.log('👤 Création / Vérification du compte Super Admin...');
  const adminEmail = 'admin@hinovgroup.com';
  
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (!listError) {
    const existing = userList.users.find(u => u.email === adminEmail);
    if (!existing) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'hinov2025',
        email_confirm: true,
        user_metadata: {
          full_name: 'Super Administrateur HINOV',
          role: 'SUPER_ADMIN',
        },
      });
      if (createError) {
        console.warn('Note création compte admin:', createError.message);
      } else if (newUser.user) {
        // Insert profile
        await supabase.from('profiles').upsert({
          id: newUser.user.id,
          email: adminEmail,
          full_name: 'Super Administrateur HINOV',
          role: 'SUPER_ADMIN',
        });
        console.log(`✅ Compte admin créé : ${adminEmail} (mot de passe: hinov2025)`);
      }
    } else {
      console.log(`✅ Compte admin déjà existant : ${adminEmail}`);
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: existing.id,
        email: adminEmail,
        full_name: 'Super Administrateur HINOV',
        role: 'SUPER_ADMIN',
      });
    }
  }

  console.log('🎉 Seeding terminé avec succès dans Supabase !');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
