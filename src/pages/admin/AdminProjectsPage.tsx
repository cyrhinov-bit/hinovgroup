import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Badge } from '../../components/ui/Badge';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import { Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink, Check, Film } from 'lucide-react';
import { Project } from '../../types';

export const AdminProjectsPage: React.FC = () => {
  const { projects, store } = useStore();
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingProject({
      title: '',
      slug: '',
      category: 'Réseau Informatique',
      client_name: '',
      completion_date: '2025',
      featured_image_url:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      description: '',
      status: 'published',
      sort_order: projects.length + 1,
    });
  };

  const handleSave = () => {
    if (!editingProject || !editingProject.title) return;

    const slug =
      editingProject.slug ||
      editingProject.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    if (editingProject.id) {
      store.updateProject(editingProject.id, {
        ...editingProject,
        slug,
      });
    } else {
      store.addProject({
        ...editingProject,
        slug,
      } as any);
    }

    setEditingProject(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Portfolio & Réalisations</h1>
          <p className="text-xs text-[#5F6673]">
            Gérez les projets livrés et certifiés HINOV Group présentés au public.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/realisations" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>
              Voir les réalisations
            </Button>
          </a>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAdd}>
            Ajouter un projet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="flex flex-col justify-between overflow-hidden">
            <div>
              <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                <MediaDisplay
                  imageUrl={proj.featured_image_url}
                  imageAlt={proj.title}
                  className="w-full h-full object-cover"
                  aspectRatioClassName="aspect-[16/10]"
                  autoPlay={false}
                  loop={false}
                  muted={true}
                  showControls={false}
                />
                <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                  {proj.category}
                </span>
                <div className="absolute top-3 right-3">
                  <Badge variant={proj.status === 'published' ? 'success' : 'warning'}>
                    {proj.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-[#111111]">{proj.title}</h3>
                <p className="text-xs text-[#5F6673] line-clamp-3">{proj.description}</p>
                <div className="text-[11px] text-[#5F6673]">
                  Client : <strong className="text-[#111111]">{proj.client_name || 'Confidentiel'}</strong>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-black/5 mt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit2 size={12} />}
                onClick={() => setEditingProject({ ...proj })}
              >
                Modifier
              </Button>
              <button
                onClick={() => setProjectToDelete(proj)}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          title={editingProject.id ? `Modifier : ${editingProject.title}` : 'Nouvelle réalisation'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre du projet"
                value={editingProject.title || ''}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                required
              />
              <Input
                label="Slug URL"
                value={editingProject.slug || ''}
                onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Catégorie de prestation"
                value={editingProject.category || 'Réseau Informatique'}
                onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
              >
                <option value="Réseau Informatique">Câblage & Réseau</option>
                <option value="Imprimerie & Signalétique">Imprimerie & Signalétique</option>
                <option value="Développement Logiciel">Développement Logiciel</option>
                <option value="Parc Informatique">Matériel Informatique</option>
                <option value="Fournitures de Bureau">Fournitures & Papeterie</option>
              </Select>

              <Input
                label="Nom du client (Facultatif)"
                value={editingProject.client_name || ''}
                onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
              />

              <Input
                label="Année de livraison"
                value={editingProject.completion_date || ''}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, completion_date: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Descriptif des réalisations"
              value={editingProject.description || ''}
              onChange={(e) =>
                setEditingProject({ ...editingProject, description: e.target.value })
              }
              rows={4}
            />

            {/* Featured Image or Video */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Photo ou Vidéo principale du projet
              </label>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-black/10 bg-[#F5F7FA]">
                {editingProject.featured_image_url ? (
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black">
                    <MediaDisplay
                      imageUrl={editingProject.featured_image_url}
                      imageAlt={editingProject.title || ''}
                      className="w-full h-full object-cover"
                      aspectRatioClassName="aspect-[16/10]"
                      autoPlay={true}
                      loop={true}
                      muted={true}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[#5F6673] truncate">
                    {typeof editingProject.featured_image_url === 'string'
                      ? editingProject.featured_image_url
                      : (editingProject.featured_image_url as any)?.url || 'Aucun média'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Changer la photo / vidéo
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditingProject(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<Check size={14} />}>
                Enregistrer la réalisation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(selected) => {
            if (editingProject) {
              const url = typeof selected === 'string' ? selected : selected.url;
              setEditingProject({ ...editingProject, featured_image_url: url });
            }
            setIsMediaPickerOpen(false);
          }}
        />
      )}

      {/* Delete Modal */}
      {projectToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => {
            store.deleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }}
          title="Supprimer la réalisation ?"
          message={`Voulez-vous supprimer définitivement "${projectToDelete.title}" du portfolio public ?`}
          confirmVariant="danger"
          confirmLabel="Supprimer"
        />
      )}
    </div>
  );
};
