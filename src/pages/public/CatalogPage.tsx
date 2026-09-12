import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Package,
  CheckCircle2,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { products, categories } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  const publishedProducts = useMemo(() => {
    return products.filter((p) => p.status === 'published');
  }, [products]);

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.is_active);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let list = publishedProducts;

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortOption === 'price_asc') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price_desc') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [publishedProducts, selectedCategory, searchTerm, sortOption]);

  return (
    <div className="w-full">
      {/* Banner */}
      <section className="bg-white border-b border-black/5 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF5EB] border border-[#D38323]/20">
            <span className="w-2 h-2 rounded-full bg-[#D38323]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B26A15]">
              Catalogue vitrine officiel
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Catalogue Produits & Fournitures
          </h1>
          <p className="text-base text-[#5F6673] max-w-2xl mx-auto leading-relaxed">
            Parcourez notre gamme de fournitures scolaires, articles de bureau et équipements informatiques.
            Demandez un devis immédiat pour vos commandes individuelles ou groupées.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-8 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="w-full md:w-96">
              <Input
                placeholder="Rechercher un produit, une référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#4A94D1] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
                }`}
              >
                Toutes ({publishedProducts.length})
              </button>
              {activeCategories.map((cat) => {
                const count = publishedProducts.filter((p) => p.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#4A94D1] text-white shadow-xs'
                        : 'bg-[#F5F7FA] text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <SlidersHorizontal size={16} className="text-[#5F6673]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="rounded-xl border border-black/15 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#111111] outline-none"
              >
                <option value="default">Tri par défaut</option>
                <option value="price_asc">Prix : croissant</option>
                <option value="price_desc">Prix : décroissant</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Package size={32} />}
              title="Notre catalogue est actuellement en cours de mise à jour."
              description="Aucun produit ne correspond à vos critères de recherche. Vous pouvez réinitialiser les filtres ou nous contacter pour une commande spécifique."
              actionLabel="Réinitialiser les filtres"
              onAction={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  hoverEffect
                  className="flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image or Video Area */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <MediaDisplay
                        imageUrl={product.primary_image_url}
                        imageAlt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        aspectRatioClassName="aspect-square"
                        autoPlay={false}
                        loop={false}
                        muted={true}
                        showControls={false}
                      />
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-white/95 text-[#111111] text-[11px] font-bold shadow-xs backdrop-blur-xs">
                        {product.category_name}
                      </span>
                      {product.availability === 'in_stock' ? (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-[#4AD07B]/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 size={10} />
                          En stock
                        </span>
                      ) : null}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <p className="text-[11px] font-mono text-[#5F6673] tracking-wide">
                        REF: {product.reference}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#5F6673] line-clamp-2 leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="p-5 pt-0 mt-2 border-t border-black/5 flex items-center justify-between">
                    <div>
                      {product.price_display_mode === 'show' && product.price ? (
                        <div>
                          <p className="text-base font-extrabold text-[#D38323]">
                            {product.price.toLocaleString('fr-FR')} {product.currency}
                          </p>
                          {product.unit && (
                            <p className="text-[10px] text-[#5F6673]">la {product.unit}</p>
                          )}
                        </div>
                      ) : product.price_display_mode === 'on_demand' ? (
                        <span className="text-xs font-bold text-[#4A94D1]">Prix sur demande</span>
                      ) : (
                        <span className="text-xs text-[#5F6673]">Nous consulter</span>
                      )}
                    </div>

                    <Link to={`/catalogue/${product.slug}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                        Fiche
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
