import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Monitor,
  Printer,
  Code2,
  Network,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const ServicesIndexPage: React.FC = () => {
  const { services } = useStore();
  const publishedServices = services.filter((s) => s.status === 'published');

  const iconMap: Record<string, React.ReactNode> = {
    Monitor: <Monitor className="w-8 h-8" />,
    Printer: <Printer className="w-8 h-8" />,
    Code2: <Code2 className="w-8 h-8" />,
    Network: <Network className="w-8 h-8" />,
    BookOpen: <BookOpen className="w-8 h-8" />,
  };

  const accentColorMap: Record<string, string> = {
    blue: 'bg-[#EBF4FC] text-[#4A94D1]',
    green: 'bg-[#E9FAF0] text-[#4AD07B]',
    orange: 'bg-[#FDF5EB] text-[#D38323]',
    magenta: 'bg-[#F9ECF6] text-[#A6378D]',
  };

  const accentBorderMap: Record<string, 'blue' | 'green' | 'orange' | 'magenta'> = {
    blue: 'blue',
    green: 'green',
    orange: 'orange',
    magenta: 'magenta',
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white via-[#F5F7FA] to-white py-16 sm:py-20 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4FC] border border-[#4A94D1]/20">
            <span className="w-2 h-2 rounded-full bg-[#4A94D1]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3573A8]">
              Pôles d'intervention officiels
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Nos Services & Expertises
          </h1>
          <p className="text-base sm:text-lg text-[#5F6673] max-w-2xl mx-auto leading-relaxed">
            HINOV Group déploie des prestations spécialisées et des solutions clé en main pour
            répondre aux exigences des entreprises, administrations, établissements scolaires et particuliers.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedServices.map((service) => (
              <Card
                key={service.id}
                hoverEffect
                accentBorder={accentBorderMap[service.accent_color] || 'blue'}
                className="flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                    <img
                      src={service.featured_image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md ${
                          accentColorMap[service.accent_color] || 'bg-white text-[#4A94D1]'
                        }`}
                      >
                        {iconMap[service.icon_name] || <Monitor className="w-6 h-6" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-[#111111]">{service.name}</h2>
                    <p className="text-sm text-[#5F6673] leading-relaxed line-clamp-3">
                      {service.short_description}
                    </p>

                    <div className="pt-3 border-t border-black/5 space-y-2">
                      <p className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                        Prestations incluses :
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#5F6673]">
                        {service.prestations.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-[#4AD07B] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-2">
                  <Link to={`/services/${service.slug}`} className="block">
                    <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight size={16} />}>
                      Consulter le pôle
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global CTA Banner */}
      <section className="py-16 bg-white border-t border-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center mx-auto shadow-xs">
            <Zap size={28} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Vous avez un projet spécifique nécessitant plusieurs compétences ?
          </h2>
          <p className="text-base text-[#5F6673] max-w-xl mx-auto leading-relaxed">
            Notre force réside dans la synergie de nos 5 domaines. Nous combinons câblage, matériel,
            logiciels et supports imprimés au sein d'un devis unique et transparent.
          </p>
          <div className="pt-2">
            <Link to="/devis">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Demander un devis personnalisé
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
