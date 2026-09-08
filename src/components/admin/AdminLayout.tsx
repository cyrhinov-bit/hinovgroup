import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { HinovLogo } from '../common/HinovLogo';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Package,
  FolderTree,
  Image,
  Layers,
  Inbox,
  Settings,
  Compass,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, quotes, store, settings } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Protected route guard: Redirect unauthenticated visitors to /admin/login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const pendingQuotesCount = quotes.filter((q) => q.status === 'nouveau').length;

  const handleLogout = () => {
    store.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Tableau de bord', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Pages & Sections', path: '/admin/pages', icon: <FileText size={18} /> },
    { label: 'Services (5 pôles)', path: '/admin/services', icon: <Briefcase size={18} /> },
    { label: 'Catalogue Produits', path: '/admin/products', icon: <Package size={18} /> },
    { label: 'Catégories', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { label: 'Réalisations', path: '/admin/projects', icon: <Layers size={18} /> },
    {
      label: 'Demandes de devis',
      path: '/admin/quotes',
      icon: <Inbox size={18} />,
      badge: pendingQuotesCount > 0 ? pendingQuotesCount : undefined,
    },
    { label: 'Médiathèque', path: '/admin/media', icon: <Image size={18} /> },
    { label: 'Navigation', path: '/admin/navigation', icon: <Compass size={18} /> },
    { label: 'Paramètres du site', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-black/10 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="p-5 space-y-6">
          <div className="pb-4 border-b border-black/5">
            <Link to="/admin" className="block">
              <HinovLogo size="sm" logoSrc={settings.logo_url} />
            </Link>
            <div className="mt-2 text-[10px] uppercase tracking-wider font-extrabold text-[#5F6673]">
              CMS Administration
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-[#4A94D1] text-white shadow-xs'
                      : 'text-[#111111] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[#5F6673]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white text-[#4A94D1]' : 'bg-[#D38323] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-black/10 space-y-3 bg-[#F5F7FA]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center font-bold text-xs">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#111111] truncate">{currentUser?.full_name || currentUser?.name || 'Admin HINOV'}</p>
              <p className="text-[10px] text-[#5F6673] truncate">{currentUser?.email || 'admin@hinovgroup.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link to="/" target="_blank" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-[11px] justify-center" rightIcon={<ExternalLink size={12} />}>
                Voir site
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-black/10 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-[#111111] hover:bg-black/5 lg:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-sm sm:text-base font-extrabold text-[#111111]">
              HINOV Group &mdash; Plateforme CMS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" target="_blank">
              <Button variant="ghost" size="sm" className="text-xs" rightIcon={<ExternalLink size={14} />}>
                Ouvrir le site public
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-black/10 p-4 space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold ${
                  location.pathname === item.path ? 'bg-[#4A94D1] text-white' : 'text-[#111111] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D38323] text-white text-[10px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-black/10 flex items-center justify-between">
              <Link to="/" target="_blank" className="text-xs text-[#4A94D1] font-bold">
                Voir le site &rarr;
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-600 font-bold">
                Se déconnecter
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
