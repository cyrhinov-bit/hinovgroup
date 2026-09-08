import React from 'react';
import { useStore } from '../../hooks/useStore';
import { SectionRenderer } from '../../components/sections/SectionRenderer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AboutPage: React.FC = () => {
  const { pages } = useStore();
  const aboutPage = pages.find((p) => p.slug === 'a-propos' || p.id === 'page-about');

  if (!aboutPage) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner text="Chargement de la page..." />
      </div>
    );
  }

  const sortedSections = [...aboutPage.sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="w-full">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};
