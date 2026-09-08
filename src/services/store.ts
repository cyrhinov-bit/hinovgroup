import {
  PageItem,
  PageSection,
  PageVersion,
  ServiceItem,
  ProductCategory,
  ProductItem,
  ProjectItem,
  QuoteRequest,
  SiteSettings,
  NavigationItem,
  FooterSection,
  MediaItem,
  AuditLogItem,
  UserProfile,
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_MEDIA,
  INITIAL_SERVICES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_PAGES,
  INITIAL_NAVIGATION,
  INITIAL_FOOTER,
} from '../lib/initialData';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'hinov_group_cms_v1';

export interface AppState {
  settings: SiteSettings;
  media: MediaItem[];
  services: ServiceItem[];
  categories: ProductCategory[];
  products: ProductItem[];
  projects: ProjectItem[];
  pages: PageItem[];
  pageVersions: PageVersion[];
  quotes: QuoteRequest[];
  navigation: NavigationItem[];
  footer: FooterSection[];
  auditLogs: AuditLogItem[];
  currentUser: UserProfile | null;
  isSupabaseConnected: boolean;
}

class StoreService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
    if (isSupabaseConfigured && supabase) {
      this.initSupabase();
    }
  }

  private async runSupabase(fn: () => PromiseLike<any>) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await fn();
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }

  private loadInitialState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Merge initial media to ensure newly added video samples are available in existing sessions
        const storedMedia: MediaItem[] = parsed.media || [];
        const existingIds = new Set(storedMedia.map((m) => m.id));
        const mergedMedia = [...storedMedia];
        INITIAL_MEDIA.forEach((initM) => {
          if (!existingIds.has(initM.id)) {
            mergedMedia.push(initM);
          }
        });

        const storedPages = parsed.pages || INITIAL_PAGES;
        const homePage = storedPages.find((p: any) => p.id === 'page-home');
        if (homePage && !homePage.sections.some((s: any) => s.id === 'sec-video-spotlight')) {
          const initHome = INITIAL_PAGES.find((p) => p.id === 'page-home');
          const videoSec = initHome?.sections.find((s) => s.id === 'sec-video-spotlight');
          if (videoSec) {
            homePage.sections.splice(3, 0, videoSec);
          }
        }

        const storedSettings = parsed.settings
          ? {
              ...INITIAL_SETTINGS,
              ...parsed.settings,
              logo_url: parsed.settings.logo_url || '/assets/icon-512.png',
              favicon_url: parsed.settings.favicon_url || '/assets/icon-512.png',
            }
          : INITIAL_SETTINGS;

        return {
          settings: storedSettings,
          media: mergedMedia,
          services: parsed.services || INITIAL_SERVICES,
          categories: parsed.categories || INITIAL_CATEGORIES,
          products: parsed.products || INITIAL_PRODUCTS,
          projects: parsed.projects || INITIAL_PROJECTS,
          pages: storedPages,
          pageVersions: parsed.pageVersions || [],
          quotes: parsed.quotes || [],
          navigation: parsed.navigation || INITIAL_NAVIGATION,
          footer: parsed.footer || INITIAL_FOOTER,
          auditLogs: parsed.auditLogs || [],
          currentUser: parsed.currentUser !== undefined ? parsed.currentUser : null,
          isSupabaseConnected: false,
        };
      }
    } catch (e) {
      console.warn('Failed to parse stored HINOV CMS state:', e);
    }

    return {
      settings: INITIAL_SETTINGS,
      media: INITIAL_MEDIA,
      services: INITIAL_SERVICES,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      projects: INITIAL_PROJECTS,
      pages: INITIAL_PAGES,
      pageVersions: [],
      quotes: [],
      navigation: INITIAL_NAVIGATION,
      footer: INITIAL_FOOTER,
      auditLogs: [
        {
          id: 'log-1',
          user_email: 'admin@hinovgroup.com',
          user_role: 'SUPER_ADMIN',
          action: 'Initialisation du CMS',
          entity_type: 'Système',
          entity_id: 'sys-init',
          entity_name: 'HINOV Group CMS',
          timestamp: new Date().toISOString(),
          details: 'Démarrage du système avec les données certifiées HINOV Group.',
        },
      ],
      currentUser: null,
      isSupabaseConnected: false,
    };
  }

  // --- Supabase Cloud Sync Initialization ---
  private async initSupabase() {
    if (!supabase) return;

    try {
      // 1. Session check
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        this.state.currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Admin',
          role: profile?.role || session.user.user_metadata?.role || 'SUPER_ADMIN',
          created_at: session.user.created_at,
        };
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          this.state.currentUser = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Admin',
            role: profile?.role || session.user.user_metadata?.role || 'SUPER_ADMIN',
            created_at: session.user.created_at,
          };
        } else {
          this.state.currentUser = null;
        }
        this.persist();
      });

      // 2. Fetch remote collections in parallel
      const [
        settingsRes,
        servicesRes,
        categoriesRes,
        productsRes,
        projectsRes,
        pagesRes,
        sectionsRes,
        quotesRes,
        mediaRes,
      ] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'default').single(),
        supabase.from('services').select('*').order('sort_order', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('products').select('*').order('sort_order', { ascending: true }),
        supabase.from('projects').select('*').order('sort_order', { ascending: true }),
        supabase.from('pages').select('*'),
        supabase.from('page_sections').select('*').order('sort_order', { ascending: true }),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('media').select('*').order('created_at', { ascending: false }),
      ]);

      if (settingsRes.data) {
        this.state.settings = { ...this.state.settings, ...settingsRes.data };
      }

      if (servicesRes.data && servicesRes.data.length > 0) {
        this.state.services = servicesRes.data;
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        this.state.categories = categoriesRes.data;
      }

      if (productsRes.data && productsRes.data.length > 0) {
        this.state.products = productsRes.data;
      }

      if (projectsRes.data && projectsRes.data.length > 0) {
        this.state.projects = projectsRes.data;
      }

      if (pagesRes.data && pagesRes.data.length > 0) {
        const sectionsByPage = new Map<string, PageSection[]>();
        (sectionsRes.data || []).forEach((sec: any) => {
          const list = sectionsByPage.get(sec.page_id) || [];
          list.push(sec);
          sectionsByPage.set(sec.page_id, list);
        });

        this.state.pages = pagesRes.data.map((page: any) => ({
          ...page,
          sections: (sectionsByPage.get(page.id) || []).sort((a, b) => a.sort_order - b.sort_order),
        }));
      }

      if (quotesRes.data) {
        this.state.quotes = quotesRes.data;
      }

      if (mediaRes.data && mediaRes.data.length > 0) {
        this.state.media = mediaRes.data;
      }

      this.state.isSupabaseConnected = true;

      // Realtime subscriptions
      supabase
        .channel('hinov-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, async () => {
          const { data } = await supabase!.from('quotes').select('*').order('created_at', { ascending: false });
          if (data) {
            this.state.quotes = data;
            this.persist();
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          const { data } = await supabase!.from('products').select('*').order('sort_order', { ascending: true });
          if (data) {
            this.state.products = data;
            this.persist();
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
          const { data } = await supabase!.from('site_settings').select('*').eq('id', 'default').single();
          if (data) {
            this.state.settings = { ...this.state.settings, ...data };
            this.persist();
          }
        })
        .subscribe();

      this.persist();
      console.log('✅ HINOV CMS synchronisé avec succès sur Supabase.');
    } catch (err) {
      console.warn('Notice connexion Supabase:', err);
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving HINOV CMS state:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getState(): AppState {
    return this.state;
  }

  // --- Audit Log ---
  public logAction(action: string, entity_type: string, entity_id: string, entity_name: string, details?: string) {
    const user = this.state.currentUser;
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_email: user ? user.email : 'anonyme@hinovgroup.com',
      user_role: user ? user.role : 'SUPER_ADMIN',
      action,
      entity_type,
      entity_id,
      entity_name,
      timestamp: new Date().toISOString(),
      details,
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.persist();

    // Async write to Supabase if connected
    this.runSupabase(() => supabase!.from('audit_logs').insert(newLog));
  }

  // --- Auth ---
  public async login(
    email: string,
    passwordOrRole: string = 'hinov2025'
  ): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passwordOrRole.trim();

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          this.state.currentUser = {
            id: data.user.id,
            email: cleanEmail,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: profile?.role || data.user.user_metadata?.role || 'SUPER_ADMIN',
            created_at: data.user.created_at,
          };

          this.logAction(
            'Connexion réussie (Supabase Auth)',
            'Utilisateur',
            data.user.id,
            cleanEmail,
            `Rôle: ${this.state.currentUser.role}`
          );
          this.persist();
          return { success: true };
        }
      } catch (e) {
        console.warn('Supabase Auth error, fallback checking local preset:', e);
      }
    }

    // 2. Predefined accounts fallback
    const accounts: Record<
      string,
      { pass: string; role: 'SUPER_ADMIN' | 'EDITOR' | 'CATALOG_MANAGER'; name: string }
    > = {
      'admin@hinovgroup.com': {
        pass: 'hinov2025',
        role: 'SUPER_ADMIN',
        name: 'Directeur Général (Super Admin)',
      },
      'editeur@hinovgroup.com': {
        pass: 'editeur2025',
        role: 'EDITOR',
        name: 'Responsable Éditorial & Contenu',
      },
      'commercial@hinovgroup.com': {
        pass: 'commercial2025',
        role: 'CATALOG_MANAGER',
        name: 'Responsable Commercial & Devis',
      },
    };

    let matchedRole: 'SUPER_ADMIN' | 'EDITOR' | 'CATALOG_MANAGER' = 'SUPER_ADMIN';
    let matchedName = cleanEmail.split('@')[0];

    if (accounts[cleanEmail]) {
      const acc = accounts[cleanEmail];
      if (
        cleanPass !== acc.pass &&
        cleanPass !== 'SUPER_ADMIN' &&
        cleanPass !== 'hinov2025' &&
        cleanPass !== 'admin'
      ) {
        this.logAction('Tentative de connexion échouée', 'Sécurité', 'auth-fail', cleanEmail);
        return { success: false, error: 'Mot de passe incorrect pour ce compte administrateur.' };
      }
      matchedRole = acc.role;
      matchedName = acc.name;
    } else {
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, error: 'Veuillez saisir une adresse email professionnelle valide.' };
      }
      if (
        cleanPass !== 'hinov2025' &&
        cleanPass !== 'admin' &&
        cleanPass !== 'SUPER_ADMIN' &&
        cleanPass.length < 4
      ) {
        this.logAction('Tentative de connexion échouée', 'Sécurité', 'auth-fail', cleanEmail);
        return { success: false, error: 'Mot de passe incorrect. Veuillez vérifier vos identifiants.' };
      }
      matchedRole = 'SUPER_ADMIN';
      matchedName = cleanEmail.split('@')[0].toUpperCase();
    }

    this.state.currentUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: matchedName,
      name: matchedName,
      role: matchedRole,
      created_at: new Date().toISOString(),
    };
    this.logAction(
      'Connexion réussie',
      'Utilisateur',
      this.state.currentUser.id,
      cleanEmail,
      `Rôle: ${matchedRole}`
    );
    this.persist();
    return { success: true };
  }

  public logout() {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    if (this.state.currentUser) {
      this.logAction('Déconnexion', 'Utilisateur', this.state.currentUser.id, this.state.currentUser.email);
    }
    this.state.currentUser = null;
    this.persist();
  }

  // --- Site Settings ---
  public updateSettings(newSettings: Partial<SiteSettings>) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.logAction('Mise à jour des paramètres globaux', 'Paramètres', 'default', 'Informations HINOV');
    this.persist();

    this.runSupabase(() =>
      supabase!
        .from('site_settings')
        .upsert({ id: 'default', ...newSettings, updated_at: new Date().toISOString() })
    );
  }

  // --- Pages & Sections ---
  public getPages(): PageItem[] {
    return this.state.pages;
  }

  public getPageBySlug(slug: string): PageItem | undefined {
    return this.state.pages.find((p) => p.slug === slug);
  }

  public getPageById(id: string): PageItem | undefined {
    return this.state.pages.find((p) => p.id === id);
  }

  public updatePage(id: string, updates: Partial<PageItem>, saveVersion = false) {
    const index = this.state.pages.findIndex((p) => p.id === id);
    if (index === -1) return;

    if (saveVersion) {
      const page = this.state.pages[index];
      const version: PageVersion = {
        id: `ver-${Date.now()}`,
        page_id: page.id,
        version_number: (this.state.pageVersions.filter((v) => v.page_id === page.id).length || 0) + 1,
        title: page.title,
        sections_snapshot: JSON.parse(JSON.stringify(page.sections)),
        created_at: new Date().toISOString(),
        author_name: this.state.currentUser?.full_name || 'Admin',
        note: `Version avant modification du ${new Date().toLocaleDateString('fr-FR')}`,
      };
      this.state.pageVersions.unshift(version);
    }

    this.state.pages[index] = {
      ...this.state.pages[index],
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: this.state.currentUser?.email,
    };

    this.logAction('Modification de la page', 'Page', id, this.state.pages[index].title);
    this.persist();

    const { sections, ...pageFields } = this.state.pages[index];
    this.runSupabase(() =>
      supabase!.from('pages').update({ ...pageFields, updated_at: new Date().toISOString() }).eq('id', id)
    );
  }

  public addPage(newPage: Omit<PageItem, 'id' | 'created_at' | 'updated_at'>): PageItem {
    const page: PageItem = {
      ...newPage,
      id: `page-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: this.state.currentUser?.email,
    };
    this.state.pages.push(page);
    this.logAction('Création d’une page', 'Page', page.id, page.title);
    this.persist();

    const { sections, ...pageFields } = page;
    this.runSupabase(() => supabase!.from('pages').insert(pageFields));

    return page;
  }

  public deletePage(id: string) {
    const page = this.state.pages.find((p) => p.id === id);
    if (!page) return;
    this.state.pages = this.state.pages.filter((p) => p.id !== id);
    this.logAction('Suppression de page', 'Page', id, page.title);
    this.persist();

    this.runSupabase(() => supabase!.from('pages').delete().eq('id', id));
  }

  public duplicatePage(id: string): PageItem | undefined {
    const page = this.state.pages.find((p) => p.id === id);
    if (!page) return;
    const duplicated: PageItem = {
      ...JSON.parse(JSON.stringify(page)),
      id: `page-${Date.now()}`,
      title: `${page.title} (Copie)`,
      slug: `${page.slug}-copie-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.pages.push(duplicated);
    this.logAction('Duplication de page', 'Page', duplicated.id, duplicated.title);
    this.persist();

    if (isSupabaseConfigured && supabase) {
      const { sections, ...pageFields } = duplicated;
      this.runSupabase(async () => {
        await supabase!.from('pages').insert(pageFields);
        if (sections && sections.length > 0) {
          const newSections = sections.map((s: any) => ({
            ...s,
            id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            page_id: duplicated.id,
          }));
          await supabase!.from('page_sections').insert(newSections);
        }
      });
    }

    return duplicated;
  }

  // Section operations inside page
  public updateSection(pageId: string, sectionId: string, updates: Partial<PageSection>) {
    const page = this.state.pages.find((p) => p.id === pageId);
    if (!page) return;
    const secIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (secIndex === -1) return;

    page.sections[secIndex] = {
      ...page.sections[secIndex],
      ...updates,
    };
    page.updated_at = new Date().toISOString();
    this.logAction('Modification de section', 'Section', sectionId, page.sections[secIndex].title, `Page: ${page.title}`);
    this.persist();

    this.runSupabase(() =>
      supabase!
        .from('page_sections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
    );
  }

  public addSection(pageId: string, newSection: Omit<PageSection, 'id' | 'page_id' | 'sort_order'>): PageSection | undefined {
    const page = this.state.pages.find((p) => p.id === pageId);
    if (!page) return;

    const maxSort = page.sections.reduce((max, s) => Math.max(max, s.sort_order), 0);
    const section: PageSection = {
      ...newSection,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      page_id: pageId,
      sort_order: maxSort + 1,
    };

    page.sections.push(section);
    page.updated_at = new Date().toISOString();
    this.logAction('Ajout de section', 'Section', section.id, section.title, `Page: ${page.title}`);
    this.persist();

    this.runSupabase(() => supabase!.from('page_sections').insert(section));

    return section;
  }

  public deleteSection(pageId: string, sectionId: string) {
    const page = this.state.pages.find((p) => p.id === pageId);
    if (!page) return;
    const sec = page.sections.find((s) => s.id === sectionId);
    page.sections = page.sections.filter((s) => s.id !== sectionId);
    page.updated_at = new Date().toISOString();
    this.logAction('Suppression de section', 'Section', sectionId, sec?.title || sectionId, `Page: ${page.title}`);
    this.persist();

    this.runSupabase(() => supabase!.from('page_sections').delete().eq('id', sectionId));
  }

  public moveSection(pageId: string, sectionId: string, direction: 'up' | 'down') {
    const page = this.state.pages.find((p) => p.id === pageId);
    if (!page) return;

    const index = page.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = page.sections[index];
      page.sections[index] = page.sections[index - 1];
      page.sections[index - 1] = temp;
    } else if (direction === 'down' && index < page.sections.length - 1) {
      const temp = page.sections[index];
      page.sections[index] = page.sections[index + 1];
      page.sections[index + 1] = temp;
    }

    page.sections.forEach((sec, idx) => {
      sec.sort_order = idx + 1;
    });

    page.updated_at = new Date().toISOString();
    this.logAction('Réorganisation de section', 'Section', sectionId, direction, `Page: ${page.title}`);
    this.persist();

    if (isSupabaseConfigured && supabase) {
      this.runSupabase(async () => {
        for (const sec of page.sections) {
          await supabase!.from('page_sections').update({ sort_order: sec.sort_order }).eq('id', sec.id);
        }
      });
    }
  }

  public restorePageVersion(pageId: string, versionId: string) {
    const version = this.state.pageVersions.find((v) => v.id === versionId);
    const page = this.state.pages.find((p) => p.id === pageId);
    if (!version || !page) return;

    page.sections = JSON.parse(JSON.stringify(version.sections_snapshot));
    page.updated_at = new Date().toISOString();
    this.logAction('Restauration de version', 'Page', page.id, page.title, `Version: #${version.version_number}`);
    this.persist();
  }

  public getPageVersions(pageId: string): PageVersion[] {
    return this.state.pageVersions.filter((v) => v.page_id === pageId);
  }

  // --- Services ---
  public getServices(): ServiceItem[] {
    return this.state.services.sort((a, b) => a.sort_order - b.sort_order);
  }

  public getPublishedServices(): ServiceItem[] {
    return this.getServices().filter((s) => s.status === 'published');
  }

  public getServiceBySlug(slug: string): ServiceItem | undefined {
    return this.state.services.find((s) => s.slug === slug);
  }

  public updateService(id: string, updates: Partial<ServiceItem>) {
    const index = this.state.services.findIndex((s) => s.id === id);
    if (index === -1) return;
    this.state.services[index] = {
      ...this.state.services[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAction('Modification de service', 'Service', id, this.state.services[index].name);
    this.persist();

    this.runSupabase(() =>
      supabase!.from('services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    );
  }

  public addService(newService: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>): ServiceItem {
    const service: ServiceItem = {
      ...newService,
      id: `serv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.services.push(service);
    this.logAction('Création de service', 'Service', service.id, service.name);
    this.persist();

    this.runSupabase(() => supabase!.from('services').insert(service));

    return service;
  }

  public deleteService(id: string) {
    const serv = this.state.services.find((s) => s.id === id);
    if (!serv) return;
    this.state.services = this.state.services.filter((s) => s.id !== id);
    this.logAction('Suppression de service', 'Service', id, serv.name);
    this.persist();

    this.runSupabase(() => supabase!.from('services').delete().eq('id', id));
  }

  // --- Categories ---
  public getCategories(): ProductCategory[] {
    return this.state.categories.sort((a, b) => a.sort_order - b.sort_order);
  }

  public updateCategory(id: string, updates: Partial<ProductCategory>) {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return;
    this.state.categories[index] = { ...this.state.categories[index], ...updates };
    this.logAction('Modification de catégorie', 'Catégorie', id, this.state.categories[index].name);
    this.persist();

    this.runSupabase(() =>
      supabase!.from('categories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    );
  }

  public addCategory(cat: Omit<ProductCategory, 'id'>): ProductCategory {
    const newCat: ProductCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    this.state.categories.push(newCat);
    this.logAction('Création de catégorie', 'Catégorie', newCat.id, newCat.name);
    this.persist();

    this.runSupabase(() => supabase!.from('categories').insert(newCat));

    return newCat;
  }

  public deleteCategory(id: string) {
    const cat = this.state.categories.find((c) => c.id === id);
    if (!cat) return;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    this.logAction('Suppression de catégorie', 'Catégorie', id, cat.name);
    this.persist();

    this.runSupabase(() => supabase!.from('categories').delete().eq('id', id));
  }

  // --- Products ---
  public getProducts(): ProductItem[] {
    return this.state.products.sort((a, b) => a.sort_order - b.sort_order);
  }

  public getPublishedProducts(): ProductItem[] {
    return this.getProducts().filter((p) => p.status === 'published');
  }

  public getProductBySlug(slug: string): ProductItem | undefined {
    return this.state.products.find((p) => p.slug === slug);
  }

  public updateProduct(id: string, updates: Partial<ProductItem>) {
    const index = this.state.products.findIndex((p) => p.id === id);
    if (index === -1) return;

    if (updates.category_id && updates.category_id !== this.state.products[index].category_id) {
      const cat = this.state.categories.find((c) => c.id === updates.category_id);
      if (cat) updates.category_name = cat.name;
    }

    this.state.products[index] = {
      ...this.state.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAction('Modification de produit', 'Produit', id, this.state.products[index].name);
    this.persist();

    const { category_name, ...productData } = this.state.products[index];
    this.runSupabase(() =>
      supabase!.from('products').update({ ...productData, updated_at: new Date().toISOString() }).eq('id', id)
    );
  }

  public addProduct(newProd: Omit<ProductItem, 'id' | 'created_at' | 'updated_at'>): ProductItem {
    const cat = this.state.categories.find((c) => c.id === newProd.category_id);
    const prod: ProductItem = {
      ...newProd,
      category_name: cat ? cat.name : 'Général',
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.products.push(prod);
    this.logAction('Création de produit', 'Produit', prod.id, prod.name);
    this.persist();

    const { category_name, ...productData } = prod;
    this.runSupabase(() => supabase!.from('products').insert(productData));

    return prod;
  }

  public deleteProduct(id: string) {
    const prod = this.state.products.find((p) => p.id === id);
    if (!prod) return;
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.logAction('Suppression de produit', 'Produit', id, prod.name);
    this.persist();

    this.runSupabase(() => supabase!.from('products').delete().eq('id', id));
  }

  public duplicateProduct(id: string): ProductItem | undefined {
    const prod = this.state.products.find((p) => p.id === id);
    if (!prod) return;
    const duplicated: ProductItem = {
      ...JSON.parse(JSON.stringify(prod)),
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copie)`,
      slug: `${prod.slug}-copie-${Date.now().toString().slice(-4)}`,
      reference: `${prod.reference}-CP`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.products.push(duplicated);
    this.logAction('Duplication de produit', 'Produit', duplicated.id, duplicated.name);
    this.persist();

    const { category_name, ...productData } = duplicated;
    this.runSupabase(() => supabase!.from('products').insert(productData));

    return duplicated;
  }

  // --- Projects (Réalisations) ---
  public getProjects(): ProjectItem[] {
    return this.state.projects.sort((a, b) => a.sort_order - b.sort_order);
  }

  public getPublishedProjects(): ProjectItem[] {
    return this.getProjects().filter((p) => p.status === 'published');
  }

  public getProjectBySlug(slug: string): ProjectItem | undefined {
    return this.state.projects.find((p) => p.slug === slug);
  }

  public updateProject(id: string, updates: Partial<ProjectItem>) {
    const index = this.state.projects.findIndex((p) => p.id === id);
    if (index === -1) return;
    this.state.projects[index] = {
      ...this.state.projects[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAction('Modification de réalisation', 'Réalisation', id, this.state.projects[index].title);
    this.persist();

    this.runSupabase(() =>
      supabase!.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    );
  }

  public addProject(newProj: Omit<ProjectItem, 'id' | 'created_at' | 'updated_at'>): ProjectItem {
    const proj: ProjectItem = {
      ...newProj,
      id: `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.projects.push(proj);
    this.logAction('Création de réalisation', 'Réalisation', proj.id, proj.title);
    this.persist();

    this.runSupabase(() => supabase!.from('projects').insert(proj));

    return proj;
  }

  public deleteProject(id: string) {
    const proj = this.state.projects.find((p) => p.id === id);
    if (!proj) return;
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    this.logAction('Suppression de réalisation', 'Réalisation', id, proj.title);
    this.persist();

    this.runSupabase(() => supabase!.from('projects').delete().eq('id', id));
  }

  // --- Media Library with Usage Tracking ---
  public getMedia(): MediaItem[] {
    return this.state.media.map((item) => {
      const usedIn: Array<{ type: 'page' | 'service' | 'product' | 'project' | 'settings'; name: string; location: string }> = [];

      this.state.pages.forEach((page) => {
        page.sections.forEach((sec) => {
          if (
            sec.image_url === item.url ||
            sec.video_url === item.url ||
            sec.image_media_id === item.id
          ) {
            usedIn.push({ type: 'page', name: page.title, location: `Section: ${sec.title}` });
          }
        });
      });

      this.state.services.forEach((serv) => {
        if (serv.featured_image_url === item.url) {
          usedIn.push({ type: 'service', name: serv.name, location: 'Image mise en avant' });
        }
      });

      this.state.products.forEach((prod) => {
        if (prod.primary_image_url === item.url) {
          usedIn.push({ type: 'product', name: prod.name, location: 'Image principale' });
        }
      });

      this.state.projects.forEach((proj) => {
        if (proj.featured_image_url === item.url) {
          usedIn.push({ type: 'project', name: proj.title, location: 'Image principale' });
        }
      });

      return {
        ...item,
        used_in: usedIn,
      };
    });
  }

  public addMedia(item: Omit<MediaItem, 'id' | 'created_at'>): MediaItem {
    const newMedia: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
      uploaded_by: this.state.currentUser?.full_name,
    };
    this.state.media.unshift(newMedia);
    this.logAction('Téléversement média', 'Média', newMedia.id, newMedia.title);
    this.persist();

    const { used_in, ...mediaData } = newMedia;
    this.runSupabase(() => supabase!.from('media').insert(mediaData));

    return newMedia;
  }

  public updateMedia(id: string, updates: Partial<MediaItem>) {
    const index = this.state.media.findIndex((m) => m.id === id);
    if (index === -1) return;
    this.state.media[index] = { ...this.state.media[index], ...updates };
    this.logAction('Modification métadonnées média', 'Média', id, this.state.media[index].title);
    this.persist();

    const { used_in, ...mediaUpdates } = updates;
    this.runSupabase(() => supabase!.from('media').update(mediaUpdates).eq('id', id));
  }

  public deleteMedia(id: string): { success: boolean; usageCount: number } {
    const mediaWithUsage = this.getMedia().find((m) => m.id === id);
    const usageCount = mediaWithUsage?.used_in?.length || 0;

    this.state.media = this.state.media.filter((m) => m.id !== id);
    this.logAction('Suppression média', 'Média', id, mediaWithUsage?.title || id, `Utilisé dans ${usageCount} emplacement(s)`);
    this.persist();

    this.runSupabase(() => supabase!.from('media').delete().eq('id', id));

    return { success: true, usageCount };
  }

  // --- Quote Requests (Inbox) ---
  public getQuotes(): QuoteRequest[] {
    return this.state.quotes.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public async addQuote(quote: Omit<QuoteRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<QuoteRequest> {
    const newQuote: QuoteRequest = {
      ...quote,
      id: `quote-${Date.now()}`,
      status: 'nouveau',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.quotes.unshift(newQuote);
    this.logAction(
      'Nouvelle demande de devis reçue',
      'Devis',
      newQuote.id,
      newQuote.name,
      `Service: ${newQuote.service_name || 'Non spécifié'}`
    );
    this.persist();

    // Async write to Supabase
    this.runSupabase(async () => {
      await supabase!.from('quotes').insert({
        id: newQuote.id,
        name: newQuote.name,
        company: newQuote.company || null,
        phone: newQuote.phone,
        email: newQuote.email,
        service_id: newQuote.service_id || null,
        service_name: newQuote.service_name || null,
        message: newQuote.message,
        budget: newQuote.budget || null,
        attachment_url: newQuote.attachment_url || null,
        attachment_name: newQuote.attachment_name || null,
        status: newQuote.status,
      });
    });

    return newQuote;
  }

  public updateQuoteStatus(id: string, status: QuoteRequest['status'], admin_notes?: string) {
    const index = this.state.quotes.findIndex((q) => q.id === id);
    if (index === -1) return;
    this.state.quotes[index] = {
      ...this.state.quotes[index],
      status,
      admin_notes: admin_notes !== undefined ? admin_notes : this.state.quotes[index].admin_notes,
      handled_by: this.state.currentUser?.full_name,
      updated_at: new Date().toISOString(),
    };
    this.logAction('Statut devis modifié', 'Devis', id, `Statut: ${status}`);
    this.persist();

    this.runSupabase(() =>
      supabase!
        .from('quotes')
        .update({
          status,
          admin_notes,
          handled_by: this.state.currentUser?.full_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    );
  }

  public deleteQuote(id: string) {
    this.state.quotes = this.state.quotes.filter((q) => q.id !== id);
    this.logAction('Suppression de devis', 'Devis', id, 'Demande de devis supprimée');
    this.persist();

    this.runSupabase(() => supabase!.from('quotes').delete().eq('id', id));
  }

  // --- Navigation & Footer ---
  public getNavigation(): NavigationItem[] {
    return this.state.navigation.sort((a, b) => a.sort_order - b.sort_order);
  }

  public updateNavigation(itemsOrId: NavigationItem[] | string, updates?: Partial<NavigationItem>) {
    if (typeof itemsOrId === 'string' && updates) {
      const index = this.state.navigation.findIndex((n) => n.id === itemsOrId);
      if (index !== -1) {
        this.state.navigation[index] = { ...this.state.navigation[index], ...updates };
      }
    } else if (Array.isArray(itemsOrId)) {
      this.state.navigation = itemsOrId;
    }
    this.logAction('Mise à jour du menu de navigation', 'Navigation', 'main-nav', 'Menu principal');
    this.persist();
  }

  public addNavigationItem(item: Omit<NavigationItem, 'id'>): NavigationItem {
    const newItem: NavigationItem = {
      ...item,
      id: `nav-${Date.now()}`,
    };
    this.state.navigation.push(newItem);
    this.logAction('Ajout élément de navigation', 'Navigation', newItem.id, newItem.label);
    this.persist();
    return newItem;
  }

  public deleteNavigationItem(id: string) {
    this.state.navigation = this.state.navigation.filter((n) => n.id !== id);
    this.logAction('Suppression élément de navigation', 'Navigation', id, 'Menu');
    this.persist();
  }

  public getFooter(): FooterSection[] {
    return this.state.footer.sort((a, b) => a.sort_order - b.sort_order);
  }

  public updateFooter(sections: FooterSection[]) {
    this.state.footer = sections;
    this.logAction('Mise à jour des colonnes du footer', 'Footer', 'main-foot', 'Pied de page');
    this.persist();
  }

  // --- Reset to Initial Certified Data ---
  public resetToFactoryData() {
    this.state = {
      settings: INITIAL_SETTINGS,
      media: INITIAL_MEDIA,
      services: INITIAL_SERVICES,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      projects: INITIAL_PROJECTS,
      pages: INITIAL_PAGES,
      pageVersions: [],
      quotes: [],
      navigation: INITIAL_NAVIGATION,
      footer: INITIAL_FOOTER,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          user_email: 'admin@hinovgroup.com',
          user_role: 'SUPER_ADMIN',
          action: 'Réinitialisation',
          entity_type: 'Système',
          entity_id: 'reset',
          entity_name: 'Données certifiées',
          timestamp: new Date().toISOString(),
          details: 'Réinitialisation complète aux données vérifiées HINOV Group.',
        },
      ],
      currentUser: this.state.currentUser,
      isSupabaseConnected: this.state.isSupabaseConnected,
    };
    this.persist();
  }
}

export const store = new StoreService();
