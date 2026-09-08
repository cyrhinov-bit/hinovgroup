import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HinovLogo } from '../common/HinovLogo';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  LayoutDashboard,
  MessageCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { navigation, services, settings, currentUser } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const visibleNav = navigation.filter((item) => item.is_visible);
  const publishedServices = services.filter((s) => s.status === 'published');

  return (
    <>
      {/* Top micro-bar for quick contact */}
      <div className="bg-[#111111] text-white/90 text-xs py-2 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] font-medium text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AD07B]" />
              {settings.address}, {settings.city} — {settings.country}
            </span>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone size={12} className="text-[#4A94D1]" />
              {settings.phone}
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {settings.whatsapp_enabled && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#4AD07B] hover:underline font-semibold"
              >
                <MessageCircle size={12} />
                WhatsApp Direct
              </a>
            )}
            {/* Le bouton Tableau de bord est caché aux visiteurs et visible uniquement pour l'administrateur connecté */}
            {currentUser && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#4A94D1]/25 hover:bg-[#4A94D1]/35 text-white transition-colors text-[11px] font-semibold border border-[#4A94D1]/40"
                title="Accéder au tableau de bord CMS"
              >
                <LayoutDashboard size={12} className="text-[#4AD07B]" />
                <span>Tableau de bord</span>
                <span className="text-[10px] text-white/70 font-normal">
                  ({currentUser.full_name?.split(' ')[0] || 'Admin'})
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-white py-4'
        }`}
        style={{
          borderBottom: scrolled ? '3px solid transparent' : '3px solid transparent',
          backgroundImage: scrolled
            ? 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), linear-gradient(to right, #4A94D1, #4AD07B, #E8A020, #B026C8)'
            : 'linear-gradient(white, white), linear-gradient(to right, #4A94D1, #4AD07B, #E8A020, #B026C8)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <HinovLogo size={scrolled ? 'sm' : 'md'} logoSrc={settings.logo_url} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {visibleNav.map((item) => {
              const isActive = location.pathname === item.path;

              if (item.path === '/services' || item.children?.length) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      to={item.path}
                      className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname.startsWith('/services')
                          ? 'text-[#4A94D1] bg-[#EBF4FC]'
                          : 'text-[#111111] hover:text-[#4A94D1] hover:bg-black/5'
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          servicesDropdownOpen ? 'rotate-180 text-[#4A94D1]' : ''
                        }`}
                      />
                    </Link>

                    {/* Services Dropdown */}
                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-black/10 p-2 mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-1.5 border-b border-black/5">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#5F6673]">
                            Pôles d'intervention HINOV
                          </p>
                        </div>
                        {publishedServices.map((service) => (
                          <Link
                            key={service.id}
                            to={`/services/${service.slug}`}
                            className="flex flex-col px-3 py-2 rounded-xl hover:bg-[#F5F7FA] transition-colors group"
                          >
                            <span className="text-xs font-bold text-[#111111] group-hover:text-[#4A94D1] transition-colors">
                              {service.name}
                            </span>
                            <span className="text-[11px] text-[#5F6673] line-clamp-1">
                              {service.short_description}
                            </span>
                          </Link>
                        ))}
                        <div className="pt-1 border-t border-black/5">
                          <Link
                            to="/services"
                            className="block text-center text-xs font-bold text-[#4A94D1] hover:underline py-1.5"
                          >
                            Voir tous les services &rarr;
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-[#4A94D1] bg-[#EBF4FC]'
                      : 'text-[#111111] hover:text-[#4A94D1] hover:bg-black/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/devis">
              <Button variant="primary" size="md">
                Demander un devis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/devis">
              <Button variant="primary" size="sm">
                Devis
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#111111] hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200"
            style={{
              borderTop: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4A94D1, #4AD07B, #E8A020, #B026C8)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            <nav className="flex flex-col space-y-1">
              {visibleNav.map((item) => (
                <div key={item.id}>
                  <Link
                    to={item.path}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      location.pathname === item.path
                        ? 'bg-[#EBF4FC] text-[#4A94D1]'
                        : 'text-[#111111] hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </Link>

                  {/* Mobile Sub-services */}
                  {item.path === '/services' && (
                    <div className="pl-4 pr-2 py-1 space-y-1">
                      {publishedServices.map((service) => (
                        <Link
                          key={service.id}
                          to={`/services/${service.slug}`}
                          className="block px-3 py-1.5 rounded-lg text-xs font-medium text-[#5F6673] hover:text-[#4A94D1] hover:bg-[#F5F7FA]"
                        >
                          &bull; {service.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-black/10 space-y-2">
              <Link to="/devis" className="block">
                <Button variant="primary" size="md" className="w-full">
                  Demander un devis
                </Button>
              </Link>
              {currentUser && (
                <Link to="/admin" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center border-black/15">
                    <LayoutDashboard size={14} className="mr-1.5 text-[#4A94D1]" />
                    Tableau de bord CMS ({currentUser.full_name?.split(' ')[0] || 'Admin'})
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
