import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { projects } = useStore();

  const project = projects.find((p) => p.slug === slug);
  const [selectedImg, setSelectedImg] = useState<string>(project?.featured_image_url || '');

  if (!project) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Réalisation non trouvée</h1>
        <p className="text-sm text-[#5F6673] mb-6">Le projet recherché n'existe pas ou n'est plus public.</p>
        <Link to="/realisations">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
            Retour aux réalisations
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [
    project.featured_image_url,
    ...(project.gallery_urls || []),
  ].filter(Boolean);

  const activeImg = selectedImg || project.featured_image_url;

  return (
    <div className="w-full py-10 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6673]">
          <Link to="/" className="hover:text-[#4A94D1]">Accueil</Link>
          <span>/</span>
          <Link to="/realisations" className="hover:text-[#4A94D1]">Réalisations</Link>
          <span>/</span>
          <span className="text-[#111111] font-bold truncate max-w-xs">{project.title}</span>
        </div>

        {/* Header Block */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-black/10 space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#EBF4FC] text-[#3573A8] text-xs font-bold">
            {project.category}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#5F6673] pt-2 border-t border-black/5">
            {project.client_name && (
              <span className="flex items-center gap-1.5 font-medium">
                <User size={14} className="text-[#4A94D1]" />
                Client : <strong className="text-[#111111]">{project.client_name}</strong>
              </span>
            )}
            {project.completion_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-[#D38323]" />
                Date : <strong className="text-[#111111]">{project.completion_date}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[#32A85F] font-bold">
              <ShieldCheck size={14} />
              Projet livré & certifié HINOV
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[16/9] bg-white rounded-2xl overflow-hidden border border-black/10 shadow-sm">
            <img
              src={activeImg}
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`w-24 h-20 rounded-xl overflow-hidden border-2 bg-white shrink-0 cursor-pointer ${
                    activeImg === img ? 'border-[#4A94D1] ring-2 ring-[#4A94D1]/20' : 'border-black/10'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <Card className="p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#111111]">Descriptif des travaux réalisés</h2>
          <p className="text-base text-[#5F6673] leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </Card>

        {/* Action Bottom */}
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-white to-[#F5F7FA]">
          <h3 className="text-xl font-bold text-[#111111]">
            Vous avez un projet similaire à réaliser ?
          </h3>
          <p className="text-sm text-[#5F6673] max-w-md mx-auto">
            Contactez notre bureau d'études pour un diagnostic technique et un devis personnalisé.
          </p>
          <div className="pt-2">
            <Link to="/devis">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Demander un devis sans engagement
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
