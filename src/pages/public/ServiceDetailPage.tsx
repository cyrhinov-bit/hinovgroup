import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Button } from '../../components/ui/Button';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import { ImageSlider } from '../../components/ui/ImageSlider';
import { LIBRAIRIE_CATALOGUE_URL } from '../../lib/constants';
import { Card } from '../../components/ui/Card';
import {
  Monitor,
  Printer,
  Code2,
  Network,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  ShoppingBag,
  Phone,
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { services, settings } = useStore();

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Service non trouvé</h1>
        <p className="text-sm text-[#5F6673] mb-6">Le domaine demandé n'existe pas ou a été déplacé.</p>
        <Link to="/services">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
            Retour aux services
          </Button>
        </Link>
      </div>
    );
  }

  const iconMap: Record<string, React.ReactNode> = {
    Monitor: <Monitor className="w-10 h-10" />,
    Printer: <Printer className="w-10 h-10" />,
    Code2: <Code2 className="w-10 h-10" />,
    Network: <Network className="w-10 h-10" />,
    BookOpen: <BookOpen className="w-10 h-10" />,
  };

  const accentColorMap = {
    blue: 'text-[#4A94D1] bg-[#EBF4FC] border-[#4A94D1]/30',
    green: 'text-[#4AD07B] bg-[#E9FAF0] border-[#4AD07B]/30',
    orange: 'text-[#D38323] bg-[#FDF5EB] border-[#D38323]/30',
    magenta: 'text-[#A6378D] bg-[#F9ECF6] border-[#A6378D]/30',
  };

  const accentBadge = accentColorMap[service.accent_color] || accentColorMap.blue;

  // Build the complete array of slider images
  const sliderImages = React.useMemo(() => {
    const list: string[] = [];
    if (service.featured_image_url) {
      list.push(service.featured_image_url);
    }
    if (service.gallery_urls && Array.isArray(service.gallery_urls)) {
      service.gallery_urls.forEach((url) => {
        if (url && typeof url === 'string' && !list.includes(url)) {
          list.push(url);
        }
      });
    }
    return list.length > 0
      ? list
      : [
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        ];
  }, [service.featured_image_url, service.gallery_urls]);

  return (
    <div className="w-full">
      {/* 1. Full-Width Top Sliding Images Banner - Positioned right below the navigation menu */}
      <section className="w-full bg-black/95 relative border-b border-black/10 overflow-hidden">
        <div className="w-full">
          <ImageSlider
            images={sliderImages}
            alt={`Galerie ${service.name}`}
            badgeLabel={`Pôle ${service.name} • HINOV`}
            aspectRatioClassName="aspect-[16/7] sm:aspect-[21/7] max-h-[380px] w-full"
            roundedClassName="rounded-none"
            autoPlay={true}
            autoPlayInterval={4500}
            showThumbnails={false}
            showArrows={sliderImages.length > 1}
            showIndicators={sliderImages.length > 1}
            enableLightbox={true}
            className="rounded-none border-0 shadow-none space-y-0"
          />
        </div>
      </section>

      {/* 2. Breadcrumb & Hero Section with Dedicated Video / Media Player */}
      <section className="bg-white border-b border-black/5 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6673] mb-6">
            <Link to="/" className="hover:text-[#4A94D1]">Accueil</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-[#4A94D1]">Services</Link>
            <span>/</span>
            <span className="text-[#111111] font-bold">{service.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border ${accentBadge}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-current" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Pôle HINOV Group
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight leading-tight">
                {service.name}
              </h1>

              <p className="text-base sm:text-lg text-[#5F6673] leading-relaxed">
                {service.short_description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={`/devis?service=${service.slug}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Demander un devis pour ce pôle
                  </Button>
                </Link>
                {service.slug === 'librairie-papeterie' && (
                  <a href={LIBRAIRIE_CATALOGUE_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" leftIcon={<ShoppingBag size={18} />}>
                      Voir le catalogue produits
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Right Dedicated Video / Media Player */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-black/10 aspect-[4/3] relative bg-black">
                <MediaDisplay
                  imageUrl={service.featured_image_url}
                  imageAlt={service.name}
                  className="w-full h-full object-cover"
                  aspectRatioClassName="aspect-[4/3]"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  badgeLabel="Vidéo illustrative"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details & Prestations */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-10">
              {/* Detailed Presentation */}
              <Card className="p-8 space-y-4">
                <h2 className="text-2xl font-extrabold text-[#111111]">Présentation du service</h2>
                <p className="text-base text-[#5F6673] leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </Card>

              {/* Prestations Certified List */}
              <Card className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#111111]">Prestations couvertes</h2>
                  <p className="text-sm text-[#5F6673] mt-1">
                    Notre équipe intervient avec rigueur sur l'ensemble de ces champs d'application :
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.prestations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#F5F7FA] border border-black/5 flex items-start gap-3"
                    >
                      <div className="p-1 rounded-md bg-[#E9FAF0] text-[#32A85F] shrink-0 mt-0.5">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-semibold text-[#111111] leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Advantages */}
              {service.advantages && service.advantages.length > 0 && (
                <Card className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#111111]">
                        Pourquoi choisir HINOV pour ce pôle ?
                      </h2>
                      <p className="text-xs text-[#5F6673]">Les garanties de notre intervention</p>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-[#5F6673]">
                        <span className="w-2 h-2 rounded-full bg-[#D38323] mt-2 shrink-0" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Immersion & Photo Gallery Card */}
              {sliderImages.length > 1 && (
                <Card className="p-6 sm:p-8 space-y-5">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#111111]">
                      Immersion visuelle & Réalisations
                    </h2>
                    <p className="text-sm text-[#5F6673] mt-1">
                      Découvrez nos équipements, ateliers et réalisations en images ({sliderImages.length} visuels)
                    </p>
                  </div>

                  <ImageSlider
                    images={sliderImages}
                    alt={service.name}
                    aspectRatioClassName="aspect-[16/9]"
                    autoPlay={true}
                    autoPlayInterval={4500}
                    showThumbnails={true}
                    showArrows={true}
                    showIndicators={true}
                    enableLightbox={true}
                  />
                </Card>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Quote Card */}
              <Card className="p-6 space-y-4 bg-gradient-to-br from-white to-[#F5F7FA] border-t-4 border-t-[#D38323]">
                <h3 className="text-lg font-bold text-[#111111]">Besoin d'une tarification ?</h3>
                <p className="text-xs text-[#5F6673] leading-relaxed">
                  Chaque situation est unique. Nous évaluons vos volumes et spécifications pour vous remettre
                  un chiffrage clair sans engagement.
                </p>
                <Link to={`/devis?service=${service.slug}`} className="block">
                  <Button variant="primary" size="md" className="w-full">
                    Demander un devis
                  </Button>
                </Link>
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#5F6673]">
                  <span>Réponse sous 24h ouvrées</span>
                  <span className="font-bold text-[#32A85F]">Devis 100% gratuit</span>
                </div>
              </Card>

              {/* Direct Phone Contact */}
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#5F6673] uppercase tracking-wider">
                      Conseil direct
                    </h4>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="text-sm font-extrabold text-[#111111] hover:text-[#4A94D1]"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-[#5F6673]">
                  Joignable du lundi au samedi à Yopougon, Cité Verte.
                </p>
              </Card>

              {/* Other Services Navigation */}
              <Card className="p-6 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673]">
                  Autres pôles d'expertise
                </h4>
                <div className="space-y-1 pt-1">
                  {services
                    .filter((s) => s.id !== service.id && s.status === 'published')
                    .map((other) => (
                      <Link
                        key={other.id}
                        to={`/services/${other.slug}`}
                        className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold text-[#111111] hover:bg-[#F5F7FA] hover:text-[#4A94D1] transition-colors"
                      >
                        <span>{other.name}</span>
                        <ArrowRight size={14} className="text-[#5F6673]/60" />
                      </Link>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
