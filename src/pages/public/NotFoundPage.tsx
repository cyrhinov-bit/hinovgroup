import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 px-4 text-center max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center mx-auto text-3xl font-extrabold shadow-xs">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#111111]">Page introuvable</h1>
        <p className="text-sm text-[#5F6673] leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home size={16} />}>
            Retour à l'accueil
          </Button>
        </Link>
        <Link to="/services">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft size={16} />}>
            Explorer nos services
          </Button>
        </Link>
      </div>
    </div>
  );
};
