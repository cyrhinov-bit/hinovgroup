import React from 'react';
import { useStore } from '../../hooks/useStore';
import { SectionRenderer } from '../../components/sections/SectionRenderer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { pages } = useStore();
  const homePage = pages.find((p) => p.slug === 'accueil' || p.id === 'page-home');

  if (!homePage) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner text="Chargement du contenu HINOV Group..." />
      </div>
    );
  }

  // Sort sections by sort_order
  const sortedSections = [...homePage.sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="w-full">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};
