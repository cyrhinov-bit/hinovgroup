import React from 'react';
import { Link } from 'react-router-dom';
import { HinovLogo } from '../common/HinovLogo';
import { useStore } from '../../hooks/useStore';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Globe,
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, services, footer, currentUser } = useStore();

  const publishedServices = services.filter((s) => s.status === 'published');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111111] text-white border-t border-white/10 relative">
      {/* Floating WhatsApp Button */}
      {settings.whatsapp_enabled && settings.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-[#4AD07B] hover:bg-[#32A85F] text-white rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
          aria-label="Contacter sur WhatsApp"
        >
          <MessageCircle size={28} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-bold">
            Discuter sur WhatsApp
          </span>
        </a>
      )}

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block">
              <HinovLogo variant="monochrome-white" size="md" logoSrc={settings.logo_url} />
            </Link>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              {settings.tagline}. Entreprise de prestation de services spécialisée dans l'informatique,
              l'imprimerie grand format, le développement logiciel, le câblage réseau structuré et la
              distribution de fournitures scolaires et de bureau.
            </p>

            <div className="pt-2 flex items-center gap-3">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#4A94D1] text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook HINOV Group"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#A6378D] text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram HINOV Group"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#4A94D1] text-white flex items-center justify-center transition-colors"
                  aria-label="LinkedIn HINOV Group"
                >
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Column 1: Services */}
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#4A94D1]">
              Nos 5 Domaines
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              {publishedServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Column 2: Navigation Links from CMS */}
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#D38323]">
              Accès Rapide
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-white transition-colors">À propos</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Tous les services</Link>
              </li>
              <li>
                <Link to="/realisations" className="hover:text-white transition-colors">Réalisations</Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">Catalogue produits</Link>
              </li>
              <li>
                <Link to="/devis" className="hover:text-white transition-colors font-semibold text-[#D38323]">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact details verified */}
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#4AD07B]">
              Coordonnées
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#4AD07B] shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.city}
                  <br />
                  <span className="text-xs text-white/50">{settings.country}</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-[#4A94D1] shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-[#D38323] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white truncate">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe size={18} className="text-[#A6378D] shrink-0" />
                <span className="text-white/60">www.hinovgroup.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            &copy; {new Date().getFullYear()} HINOV Group. Tous droits réservés. Prestation de services de qualité.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to={currentUser ? '/admin' : '/admin/login'}
              className="hover:text-white transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100"
              title="Accès réservé à l'équipe HINOV"
            >
              <Lock size={12} />
              <span>{currentUser ? 'Tableau de bord CMS' : 'Espace Administration'}</span>
            </Link>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Haut de page</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
