import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import { ArrowRight, Briefcase, Calendar, User } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'published');
  }, [projects]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedProjects.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [publishedProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return publishedProjects;
    return publishedProjects.filter((p) => p.category === selectedCategory);
  }, [publishedProjects, selectedCategory]);

  return (
    <div className="w-full">
      {/* Banner */}
      <section className="bg-white border-b border-black/5 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4FC] border border-[#4A94D1]/20">
            <span className="w-2 h-2 rounded-full bg-[#4A94D1]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3573A8]">
              Portfolio de réalisations
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Nos Travaux & Réalisations
          </h1>
          <p className="text-base text-[#5F6673] max-w-2xl mx-auto leading-relaxed">
            Découvrez un aperçu concret des projets d'imprimerie, de câblage réseau, de développement
            logiciel et de fourniture de matériel réalisés par HINOV Group.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#4A94D1] text-white shadow-xs'
                    : 'bg-white text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
                }`}
              >
                Toutes ({publishedProjects.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#4A94D1] text-white shadow-xs'
                      : 'bg-white text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid or Empty state */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={36} />}
              title="Nos réalisations seront bientôt disponibles."
              description="Notre galerie de projets certifiés est en cours de mise à jour par l'équipe technique. Vous pouvez nous contacter pour toute demande de référence personnalisée."
              actionLabel="Demander un devis pour votre projet"
              onAction={() => {
                window.location.href = '/devis';
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card key={project.id} hoverEffect className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <MediaDisplay
                        imageUrl={project.featured_image_url}
                        imageAlt={project.title}
                        className="w-full h-full object-cover"
                        aspectRatioClassName="aspect-[16/10]"
                        autoPlay={false}
                        loop={false}
                        muted={true}
                        showControls={false}
                      />
                      <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
                        {project.category}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <h2 className="text-xl font-bold text-[#111111]">{project.title}</h2>
                      <p className="text-xs text-[#5F6673] line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#5F6673]">
                        {project.client_name && (
                          <span className="flex items-center gap-1.5">
                            <User size={13} className="text-[#4A94D1]" />
                            {project.client_name}
                          </span>
                        )}
                        {project.completion_date && (
                          <span className="flex items-center gap-1.5 ml-auto">
                            <Calendar size={13} className="text-[#D38323]" />
                            {project.completion_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-2">
                    <Link to={`/realisations/${project.slug}`} className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-between" rightIcon={<ArrowRight size={14} />}>
                        Détails du projet
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
