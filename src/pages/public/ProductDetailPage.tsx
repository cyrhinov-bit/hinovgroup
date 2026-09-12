import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, settings } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState<string>(product?.primary_image_url || '');

  if (!product) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Produit non trouvé</h1>
        <p className="text-sm text-[#5F6673] mb-6">Cet article n'existe pas ou n'est plus au catalogue.</p>
        <Link to="/catalogue">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
            Retour au catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [
    product.primary_image_url,
    ...(product.gallery_urls || []),
  ].filter(Boolean);

  const activeImg = selectedImage || product.primary_image_url;

  const similarProducts = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id && p.status === 'published')
    .slice(0, 3);

  const whatsappInquiryUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Bonjour HINOV Group, je souhaite obtenir des informations sur l'article : ${product.name} (Réf : ${product.reference}).`
  )}`;

  return (
    <div className="w-full py-10 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6673]">
          <Link to="/" className="hover:text-[#4A94D1]">Accueil</Link>
          <span>/</span>
          <Link to="/catalogue" className="hover:text-[#4A94D1]">Catalogue</Link>
          <span>/</span>
          <span className="text-[#111111] font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-black/10 shadow-sm relative">
              <MediaDisplay
                imageUrl={activeImg}
                imageAlt={product.name}
                className="w-full h-full object-contain p-4"
                aspectRatioClassName="aspect-square"
                autoPlay={true}
                loop={true}
                muted={true}
              />
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/95 text-[#111111] text-xs font-bold shadow-xs backdrop-blur-xs">
                {product.category_name}
              </span>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shrink-0 transition-all cursor-pointer ${
                      activeImg === img
                        ? 'border-[#4A94D1] ring-2 ring-[#4A94D1]/20'
                        : 'border-black/10 hover:border-black/25'
                    }`}
                  >
                    <MediaDisplay
                      imageUrl={img}
                      className="w-full h-full object-contain p-1"
                      aspectRatioClassName="aspect-square"
                      autoPlay={false}
                      loop={false}
                      muted={true}
                      showControls={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-black/10 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#5F6673]">
                  RÉFÉRENCE : {product.reference}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & Availability Block */}
              <div className="p-4 bg-[#F5F7FA] rounded-xl border border-black/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5F6673] block">Tarif estimatif :</span>
                  {product.price_display_mode === 'show' && product.price ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-[#D38323]">
                        {product.price.toLocaleString('fr-FR')} {product.currency}
                      </span>
                      {product.unit && (
                        <span className="text-xs text-[#5F6673]">/ {product.unit}</span>
                      )}
                    </div>
                  ) : product.price_display_mode === 'on_demand' ? (
                    <span className="text-lg font-bold text-[#4A94D1]">Tarif sur demande</span>
                  ) : (
                    <span className="text-sm font-semibold text-[#5F6673]">Nous consulter</span>
                  )}
                </div>

                <div>
                  {product.availability === 'in_stock' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9FAF0] text-[#32A85F] text-xs font-bold border border-[#4AD07B]/30">
                      <CheckCircle2 size={14} />
                      En stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                      Sur commande
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm text-[#5F6673] leading-relaxed">
                {product.short_description}
              </p>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <Link
                  to={`/devis?product=${encodeURIComponent(product.name)}&ref=${encodeURIComponent(
                    product.reference
                  )}`}
                  className="block"
                >
                  <Button variant="primary" size="lg" className="w-full" rightIcon={<FileText size={18} />}>
                    Demander un devis pour cet article
                  </Button>
                </Link>

                {settings.whatsapp_enabled && (
                  <a href={whatsappInquiryUrl} target="_blank" rel="noreferrer" className="block">
                    <Button
                      variant="success"
                      size="md"
                      className="w-full"
                      leftIcon={<MessageCircle size={18} />}
                    >
                      Discuter sur WhatsApp au sujet de cet article
                    </Button>
                  </a>
                )}
              </div>

              {/* Assurance notes */}
              <div className="pt-4 border-t border-black/5 grid grid-cols-2 gap-4 text-xs text-[#5F6673]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#4AD07B] shrink-0" />
                  <span>Disponibilité vérifiée</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-[#4A94D1] shrink-0" />
                  <span>Conseil d'expert HINOV</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold text-[#111111]">Caractéristiques techniques</h3>
                <div className="divide-y divide-black/5 text-xs">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between">
                      <span className="font-semibold text-[#5F6673]">{spec.key}</span>
                      <span className="font-bold text-[#111111]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Detailed Description */}
            {product.description && (
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-bold text-[#111111]">Description détaillée</h3>
                <p className="text-sm text-[#5F6673] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="pt-10 border-t border-black/10 space-y-6">
            <h2 className="text-xl font-bold text-[#111111]">Articles similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarProducts.map((p) => (
                <Card key={p.id} hoverEffect className="p-4 flex items-center gap-4">
                  <img
                    src={p.primary_image_url}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#111111] truncate">{p.name}</p>
                    <p className="text-xs font-mono text-[#5F6673]">{p.reference}</p>
                    <Link
                      to={`/catalogue/${p.slug}`}
                      className="text-xs font-bold text-[#4A94D1] hover:underline inline-flex items-center gap-1"
                    >
                      Voir <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
