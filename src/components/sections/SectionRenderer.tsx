import React from 'react';
import { PageSection } from '../../types';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { MediaDisplay } from '../ui/MediaDisplay';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Printer,
  Code2,
  Network,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Film,
  Sparkles,
} from 'lucide-react';

interface SectionRendererProps {
  section: PageSection;
  isPreview?: boolean;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, isPreview = false }) => {
  const { services, products, projects, settings } = useStore();

  if (!section.is_visible && !isPreview) {
    return null;
  }

  const iconMap: Record<string, React.ReactNode> = {
    Monitor: <Monitor className="w-8 h-8" />,
    Printer: <Printer className="w-8 h-8" />,
    Code2: <Code2 className="w-8 h-8" />,
    Network: <Network className="w-8 h-8" />,
    BookOpen: <BookOpen className="w-8 h-8" />,
  };

  const accentBorderMap: Record<string, 'blue' | 'green' | 'orange' | 'magenta'> = {
    blue: 'blue',
    green: 'green',
    orange: 'orange',
    magenta: 'magenta',
  };

  const accentColorMap: Record<string, string> = {
    blue: 'bg-[#EBF4FC] text-[#4A94D1]',
    green: 'bg-[#E9FAF0] text-[#4AD07B]',
    orange: 'bg-[#FDF5EB] text-[#D38323]',
    magenta: 'bg-[#F9ECF6] text-[#A6378D]',
  };

  switch (section.section_type) {
    case 'hero':
      return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F7FA] via-white to-[#F5F7FA] py-16 sm:py-24 border-b border-black/5">
          {/* Subtle geometric circles inspired by HINOV logo */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#4A94D1]/5 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#4AD07B]/5 pointer-events-none blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#D38323]/5 pointer-events-none blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                {section.subtitle && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4FC] border border-[#4A94D1]/30">
                    <span className="w-2 h-2 rounded-full bg-[#4A94D1] animate-pulse" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3573A8]">
                      {section.subtitle}
                    </span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.15]">
                  {section.title}
                </h1>

                <p className="text-base sm:text-lg text-[#5F6673] leading-relaxed max-w-2xl whitespace-pre-line">
                  {section.content}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  {section.cta_label && (
                    <Link to={section.cta_link || '/devis'}>
                      <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                        {section.cta_label}
                      </Button>
                    </Link>
                  )}
                  {section.secondary_cta_label && (
                    <Link to={section.secondary_cta_link || '/services'}>
                      <Button variant="outline" size="lg">
                        {section.secondary_cta_label}
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Trust mini-badges */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#111111] leading-tight">
                      Qualité certifiée
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center shrink-0">
                      <Award size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#111111] leading-tight">
                      Rigueur technique
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E9FAF0] text-[#4AD07B] flex items-center justify-center shrink-0">
                      <Users size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#111111] leading-tight">
                      Satisfaction client
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative circular accent border */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#4A94D1] via-[#D38323] to-[#4AD07B] opacity-30 blur-sm" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <MediaDisplay
                      mediaType={section.media_type}
                      imageUrl={
                        section.image_url ||
                        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80'
                      }
                      imageAlt={section.image_alt || section.title}
                      videoUrl={section.video_url}
                      videoPosterUrl={section.video_poster_url}
                      autoPlay={section.video_autoplay ?? true}
                      loop={section.video_loop ?? true}
                      muted={section.video_muted ?? true}
                      showControls={false}
                      interactive={false}
                      aspectRatioClassName="aspect-[4/3]"
                      badgeLabel={
                        section.media_type === 'video' || section.video_url
                          ? 'En action • HINOV'
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case 'presentation': {
      const hasMedia = !!(section.image_url || section.video_url);
      return (
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {hasMedia && (
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-black/10 relative">
                    <MediaDisplay
                      mediaType={section.media_type}
                      imageUrl={section.image_url}
                      imageAlt={section.image_alt || section.title}
                      videoUrl={section.video_url}
                      videoPosterUrl={section.video_poster_url}
                      autoPlay={section.video_autoplay ?? true}
                      loop={section.video_loop ?? true}
                      muted={section.video_muted ?? true}
                      showControls={false}
                      interactive={false}
                      aspectRatioClassName="aspect-[4/3]"
                      badgeLabel={
                        section.media_type === 'video' || section.video_url
                          ? 'Reportage vidéo'
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              <div className={`${hasMedia ? 'lg:col-span-7 order-1 lg:order-2' : 'lg:col-span-12'} space-y-6`}>
                {section.subtitle && (
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#4A94D1]">
                    {section.subtitle}
                  </p>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                  {section.title}
                </h2>
                <div className="text-base text-[#5F6673] leading-relaxed whitespace-pre-line space-y-4">
                  {section.content}
                </div>
                {section.cta_label && (
                  <div className="pt-2">
                    <Link to={section.cta_link || '/a-propos'}>
                      <Button variant="outline" size="md" rightIcon={<ArrowRight size={16} />}>
                        {section.cta_label}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case 'video_spotlight':
      return (
        <section className="py-16 sm:py-24 bg-gradient-to-b from-[#111111] via-[#1a202c] to-[#111111] text-white relative overflow-hidden">
          {/* Subtle colored glow background */}
          <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-[#4A94D1]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-[#4AD07B]/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              {section.subtitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#4AD07B] text-xs font-extrabold uppercase tracking-wider">
                  <Film size={14} />
                  <span>{section.subtitle}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                  {section.content}
                </p>
              )}
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 bg-black/60 backdrop-blur-md p-2 sm:p-3">
                <MediaDisplay
                  mediaType="video"
                  imageUrl={section.image_url}
                  imageAlt={section.image_alt || section.title}
                  videoUrl={
                    section.video_url ||
                    'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4'
                  }
                  videoPosterUrl={section.video_poster_url || section.image_url}
                  autoPlay={section.video_autoplay ?? true}
                  loop={section.video_loop ?? true}
                  muted={section.video_muted ?? true}
                  showControls={false}
                  interactive={false}
                  aspectRatioClassName="aspect-video"
                  badgeLabel="HINOV Group • Vidéo Immersion"
                />
              </div>

              {(section.cta_label || section.secondary_cta_label) && (
                <div className="flex flex-wrap items-center justify-center gap-4 pt-10">
                  {section.cta_label && (
                    <Link to={section.cta_link || '/devis'}>
                      <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                        {section.cta_label}
                      </Button>
                    </Link>
                  )}
                  {section.secondary_cta_label && (
                    <Link to={section.secondary_cta_link || '/contact'}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-white border-white/30 hover:bg-white/10"
                      >
                        {section.secondary_cta_label}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case 'services_grid': {
      const publishedServices = services.filter((s) => s.status === 'published');
      return (
        <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-b border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              {section.subtitle && (
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#D38323]">
                  {section.subtitle}
                </p>
              )}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-base text-[#5F6673] leading-relaxed">{section.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedServices.map((service) => (
                <Card
                  key={service.id}
                  hoverEffect
                  accentBorder={accentBorderMap[service.accent_color] || 'blue'}
                  className="flex flex-col p-6 sm:p-7 justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                          accentColorMap[service.accent_color] || 'bg-[#EBF4FC] text-[#4A94D1]'
                        }`}
                      >
                        {iconMap[service.icon_name] || <Monitor className="w-8 h-8" />}
                      </div>
                      <span className="text-xs font-bold text-[#5F6673]/60 uppercase tracking-widest">
                        Pôle 0{service.sort_order}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#111111]">{service.name}</h3>

                    <p className="text-sm text-[#5F6673] leading-relaxed line-clamp-3">
                      {service.short_description}
                    </p>

                    <div className="pt-2 border-t border-black/5 space-y-2">
                      <p className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                        Prestations clés :
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#5F6673]">
                        {service.prestations.slice(0, 3).map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4A94D1] mt-1.5 shrink-0" />
                            <span className="line-clamp-1">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-black/5">
                    <Link to={`/services/${service.slug}`} className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-between" rightIcon={<ArrowRight size={16} />}>
                        Découvrir ce service
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {section.cta_label && (
              <div className="text-center mt-12">
                <Link to={section.cta_link || '/services'}>
                  <Button variant="primary" size="md">
                    {section.cta_label}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'why_us':
      return (
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              {section.subtitle && (
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#4AD07B]">
                  {section.subtitle}
                </p>
              )}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-base text-[#5F6673] leading-relaxed">{section.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 space-y-3 border-black/10">
                <div className="w-12 h-12 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-base font-bold text-[#111111]">Excellence d’exécution</h3>
                <p className="text-xs text-[#5F6673] leading-relaxed">
                  Des méthodologies éprouvées et un contrôle qualité strict à chaque étape de nos prestations.
                </p>
              </Card>

              <Card className="p-6 space-y-3 border-black/10">
                <div className="w-12 h-12 rounded-xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h3 className="text-base font-bold text-[#111111]">Solutions sur mesure</h3>
                <p className="text-xs text-[#5F6673] leading-relaxed">
                  Chaque projet est personnalisé selon vos contraintes fonctionnelles, temporelles et budgétaires.
                </p>
              </Card>

              <Card className="p-6 space-y-3 border-black/10">
                <div className="w-12 h-12 rounded-xl bg-[#E9FAF0] text-[#4AD07B] flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h3 className="text-base font-bold text-[#111111]">Écoute & Proximité</h3>
                <p className="text-xs text-[#5F6673] leading-relaxed">
                  Une équipe ivoirienne réactive à Yopougon, toujours accessible pour vous conseiller et intervenir.
                </p>
              </Card>

              <Card className="p-6 space-y-3 border-black/10">
                <div className="w-12 h-12 rounded-xl bg-[#F9ECF6] text-[#A6378D] flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-[#111111]">Pérennité & Fiabilité</h3>
                <p className="text-xs text-[#5F6673] leading-relaxed">
                  Fournitures robustes, équipements certifiés et accompagnement dans la durée.
                </p>
              </Card>
            </div>
          </div>
        </section>
      );

    case 'featured_products': {
      const featured = products.filter((p) => p.status === 'published' && p.is_featured);
      return (
        <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-b border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                {section.subtitle && (
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#A6378D]">
                    {section.subtitle}
                  </p>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-1">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-sm text-[#5F6673] max-w-xl mt-2">{section.content}</p>
                )}
              </div>
              <Link to="/catalogue">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                  Consulter tout le catalogue
                </Button>
              </Link>
            </div>

            {featured.length === 0 ? (
              <EmptyState
                title="Catalogue en cours d’actualisation"
                description="Les produits phares seront bientôt affichés dans cet espace."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.slice(0, 4).map((product) => (
                  <Card key={product.id} hoverEffect className="flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[#111111] text-[11px] font-bold shadow-xs backdrop-blur-xs">
                          {product.category_name}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-[11px] text-[#5F6673] font-mono">{product.reference}</p>
                        <h3 className="text-sm font-bold text-[#111111] line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-[#5F6673] line-clamp-2">{product.short_description}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-black/5 mt-3 flex items-center justify-between">
                      <div>
                        {product.price_display_mode === 'show' && product.price ? (
                          <span className="text-sm font-extrabold text-[#D38323]">
                            {product.price.toLocaleString('fr-FR')} {product.currency}
                          </span>
                        ) : product.price_display_mode === 'on_demand' ? (
                          <span className="text-xs font-semibold text-[#4A94D1]">Sur demande</span>
                        ) : (
                          <span className="text-xs text-[#5F6673]">Nous consulter</span>
                        )}
                      </div>
                      <Link to={`/catalogue/${product.slug}`}>
                        <Button variant="ghost" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'projects_grid': {
      const publishedProjects = projects.filter((p) => p.status === 'published');
      return (
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                {section.subtitle && (
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#4A94D1]">
                    {section.subtitle}
                  </p>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-1">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-sm text-[#5F6673] max-w-xl mt-2">{section.content}</p>
                )}
              </div>
              <Link to="/realisations">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                  Toutes les réalisations
                </Button>
              </Link>
            </div>

            {publishedProjects.length === 0 ? (
              <EmptyState
                title="Nos réalisations seront bientôt disponibles."
                description="Notre portfolio d'interventions et de projets terminés est en cours d'actualisation par l'équipe."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {publishedProjects.slice(0, 3).map((project) => (
                  <Card key={project.id} hoverEffect className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img
                        src={project.featured_image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
                        {project.category}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-[#111111]">{project.title}</h3>
                      <p className="text-xs text-[#5F6673] line-clamp-3">{project.description}</p>
                      <div className="pt-3">
                        <Link to={`/realisations/${project.slug}`}>
                          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                            En savoir plus
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'cta':
      return (
        <section className="py-16 sm:py-20 bg-gradient-to-r from-[#111111] via-[#1a2530] to-[#111111] text-white relative overflow-hidden">
          {/* Subtle colored accent rings */}
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#4A94D1]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#D38323]/15 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            {section.subtitle && (
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#D38323]">
                {section.subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
              {section.title}
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              {section.content}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to={section.cta_link || '/devis'}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                  {section.cta_label || 'Demander un devis gratuit'}
                </Button>
              </Link>
              {section.secondary_cta_label && (
                <Link to={section.secondary_cta_link || '/contact'}>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    {section.secondary_cta_label}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      );

    case 'contact_quick':
      return (
        <section className="py-16 sm:py-20 bg-[#F5F7FA] border-t border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              {section.subtitle && (
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#4A94D1]">
                  {section.subtitle}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{section.title}</h2>
              {section.content && <p className="text-sm text-[#5F6673]">{section.content}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center mx-auto">
                  <Phone size={22} />
                </div>
                <h4 className="text-xs font-bold text-[#5F6673] uppercase tracking-wider">Téléphone</h4>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="block text-sm font-bold text-[#111111] hover:text-[#4A94D1]"
                >
                  {settings.phone}
                </a>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#E9FAF0] text-[#4AD07B] flex items-center justify-center mx-auto">
                  <MessageCircle size={22} />
                </div>
                <h4 className="text-xs font-bold text-[#5F6673] uppercase tracking-wider">WhatsApp</h4>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-bold text-[#32A85F] hover:underline"
                >
                  Discuter en direct
                </a>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center mx-auto">
                  <Mail size={22} />
                </div>
                <h4 className="text-xs font-bold text-[#5F6673] uppercase tracking-wider">Courriel</h4>
                <a
                  href={`mailto:${settings.email}`}
                  className="block text-sm font-bold text-[#111111] hover:text-[#D38323] truncate"
                >
                  {settings.email}
                </a>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F9ECF6] text-[#A6378D] flex items-center justify-center mx-auto">
                  <MapPin size={22} />
                </div>
                <h4 className="text-xs font-bold text-[#5F6673] uppercase tracking-wider">Localisation</h4>
                <p className="text-sm font-bold text-[#111111]">
                  {settings.address}, {settings.city}
                </p>
              </Card>
            </div>
          </div>
        </section>
      );

    case 'rich_text':
      return (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {section.title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{section.title}</h2>
            )}
            <div className="prose prose-slate max-w-none text-base text-[#5F6673] leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
};
