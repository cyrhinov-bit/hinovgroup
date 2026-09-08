import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesIndexPage } from './pages/public/ServicesIndexPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { CatalogPage } from './pages/public/CatalogPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { QuotePage } from './pages/public/QuotePage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin CMS
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPagesPage } from './pages/admin/AdminPagesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminQuotesPage } from './pages/admin/AdminQuotesPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminNavigationPage } from './pages/admin/AdminNavigationPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Header & Footer */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="a-propos" element={<AboutPage />} />
          <Route path="services" element={<ServicesIndexPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="catalogue" element={<CatalogPage />} />
          <Route path="catalogue/:slug" element={<ProductDetailPage />} />
          <Route path="realisations" element={<ProjectsPage />} />
          <Route path="realisations/:slug" element={<ProjectDetailPage />} />
          <Route path="devis" element={<QuotePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin CMS Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="pages" element={<AdminPagesPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="quotes" element={<AdminQuotesPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="navigation" element={<AdminNavigationPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
