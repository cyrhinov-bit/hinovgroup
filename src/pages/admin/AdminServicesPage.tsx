import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  Edit2,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Image as ImageIcon,
  Film,
  ArrowUp,
  ArrowDown,
  Layers,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { Service } from '../../types';

type MediaPickerTarget =
  | { type: 'featured' }
  | { type: 'gallery_add' }
  | { type: 'gallery_replace'; index: number }
  | null;

export const AdminServicesPage: React.FC = () => {
  const { services, store } = useStore();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget>(null);
  const [newPrestation, setNewPrestation] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const handleSave = () => {
    if (!editingService) return;
    store.updateService(editingService.id, editingService);
    setEditingService(null);
  };

  const handleAddPrestation = () => {
    if (!newPrestation.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      prestations: [...editingService.prestations, newPrestation.trim()],
    });
    setNewPrestation('');
  };

  const handleRemovePrestation = (index: number) => {
    if (!editingService) return;
    const updated = [...editingService.prestations];
    updated.splice(index, 1);
    setEditingService({ ...editingService, prestations: updated });
  };

  const handleAddAdvantage = () => {
    if (!newAdvantage.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      advantages: [...(editingService.advantages || []), newAdvantage.trim()],
    });
    setNewAdvantage('');
  };

  const handleRemoveAdvantage = (index: number) => {
    if (!editingService) return;
    const updated = [...(editingService.advantages || [])];
    updated.splice(index, 1);
    setEditingService({ ...editingService, advantages: updated });
  };

  // Slider Gallery Handlers
  const handleAddGalleryImage = (url: string) => {
    if (!editingService || !url.trim()) return;
    const current = editingService.gallery_urls || [];
    setEditingService({
      ...editingService,
      gallery_urls: [...current, url.trim()],
    });
  };

  const handleReplaceGalleryImage = (index: number, url: string) => {
    if (!editingService || !url.trim()) return;
    const current = [...(editingService.gallery_urls || [])];
    current[index] = url.trim();
    setEditingService({
      ...editingService,
      gallery_urls: current,
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!editingService) return;
    const current = [...(editingService.gallery_urls || [])];
    current.splice(index, 1);
    setEditingService({
      ...editingService,
      gallery_urls: current,
    });
  };

  const handleMoveGalleryImage = (index: number, direction: 'up' | 'down') => {
    if (!editingService) return;
    const current = [...(editingService.gallery_urls || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    setEditingService({
      ...editingService,
      gallery_urls: current,
    });
  };

  const handleAddGalleryUrlInput = () => {
    if (!newGalleryUrl.trim() || !editingService) return;
    handleAddGalleryImage(newGalleryUrl.trim());
    setNewGalleryUrl('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Gestion des Pôles & Services</h1>
          <p className="text-xs text-[#5F6673]">
            Personnalisez les 5 domaines officiels d'activité de HINOV Group, leurs prestations et visuels.
          </p>
        </div>
        <a href="/services" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>
            Voir la page publique des services
          </Button>
        </a>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col justify-between overflow-hidden">
            <div>
              <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                <MediaDisplay
                  imageUrl={service.featured_image_url}
                  imageAlt={service.name}
                  className="w-full h-full object-cover"
                  aspectRatioClassName="aspect-[16/9]"
                  autoPlay={false}
                  loop={false}
                  muted={true}
                  showControls={false}
                />
                <div className="absolute top-2.5 right-2.5 z-10">
                  <Badge variant={service.status === 'published' ? 'success' : 'warning'}>
                    {service.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F6673]">
                    Pôle #{service.sort_order} &bull; {service.accent_color}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#111111]">{service.name}</h3>
                <p className="text-xs text-[#5F6673] line-clamp-3">{service.short_description}</p>
                <div className="text-[11px] text-[#4A94D1] font-semibold">
                  {service.prestations.length} prestations listées
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-black/5 mt-2 flex items-center justify-between">
              <a
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#5F6673] hover:text-[#4A94D1] inline-flex items-center gap-1"
              >
                Page publique <ExternalLink size={12} />
              </a>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit2 size={14} />}
                onClick={() => setEditingService({ ...service })}
              >
                Éditer le pôle
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={true}
          onClose={() => setEditingService(null)}
          title={`Édition : ${editingService.name}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom du service"
                value={editingService.name}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                required
              />
              <Input
                label="Slug URL"
                value={editingService.slug}
                onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Couleur d'accentuation"
                value={editingService.accent_color}
                onChange={(e) =>
                  setEditingService({ ...editingService, accent_color: e.target.value as any })
                }
              >
                <option value="blue">Bleu HINOV</option>
                <option value="green">Vert HINOV</option>
                <option value="orange">Orange HINOV</option>
                <option value="magenta">Magenta HINOV</option>
              </Select>

              <Select
                label="Icône associée"
                value={editingService.icon_name}
                onChange={(e) => setEditingService({ ...editingService, icon_name: e.target.value })}
              >
                <option value="Monitor">Informatique (Monitor)</option>
                <option value="Printer">Imprimerie (Printer)</option>
                <option value="Code2">Développement (Code2)</option>
                <option value="Network">Réseau (Network)</option>
                <option value="BookOpen">Papeterie (BookOpen)</option>
              </Select>

              <Select
                label="Statut"
                value={editingService.status}
                onChange={(e) =>
                  setEditingService({ ...editingService, status: e.target.value as any })
                }
              >
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </Select>
            </div>

            <Textarea
              label="Description courte (Cards d'accueil)"
              value={editingService.short_description}
              onChange={(e) =>
                setEditingService({ ...editingService, short_description: e.target.value })
              }
              rows={2}
            />

            <Textarea
              label="Présentation détaillée (Page du service)"
              value={editingService.description}
              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
              rows={4}
            />

            {/* Featured image/video with MediaPicker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Photo ou Vidéo de couverture principale
              </label>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-black/10 bg-[#F5F7FA]">
                {editingService.featured_image_url ? (
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black">
                    <MediaDisplay
                      imageUrl={editingService.featured_image_url}
                      imageAlt={editingService.name}
                      className="w-full h-full object-cover"
                      aspectRatioClassName="aspect-[4/3]"
                      autoPlay={true}
                      loop={true}
                      muted={true}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <ImageIcon size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[#5F6673] truncate">
                    {typeof editingService.featured_image_url === 'string'
                      ? editingService.featured_image_url
                      : (editingService.featured_image_url as any)?.url || 'Aucun média'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setMediaPickerTarget({ type: 'featured' })}
                  >
                    Changer la photo / vidéo principale
                  </Button>
                </div>
              </div>
            </div>

            {/* Gallery & Slider Images Management */}
            <div className="space-y-3 pt-2 border-t border-black/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#4A94D1]" />
                    Galerie du Slider — Images défilantes ({editingService.gallery_urls?.length || 0})
                  </label>
                  <p className="text-[11px] text-[#5F6673]">
                    Ajoutez, réordonnez ou supprimez les images qui composent le carrousel défilant de la page de ce service.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setMediaPickerTarget({ type: 'gallery_add' })}
                >
                  Ajouter depuis la médiathèque
                </Button>
              </div>

              {/* Quick Add by URL */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ou coller l'URL d'une image à ajouter au slider (https://...)..."
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGalleryUrlInput();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddGalleryUrlInput}
                  disabled={!newGalleryUrl.trim()}
                >
                  Ajouter URL
                </Button>
              </div>

              {/* Gallery Images List */}
              {editingService.gallery_urls && editingService.gallery_urls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {editingService.gallery_urls.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F5F7FA] border border-black/10 transition-all hover:border-[#4A94D1]/40"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black">
                        <MediaDisplay
                          imageUrl={imgUrl}
                          imageAlt={`Slide #${idx + 1}`}
                          className="w-full h-full object-cover"
                          aspectRatioClassName="aspect-[4/3]"
                          autoPlay={false}
                          loop={false}
                          muted={true}
                          showControls={false}
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-white text-[9px] font-mono font-bold">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono text-[#5F6673] truncate" title={imgUrl}>
                          {imgUrl}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveGalleryImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-md bg-white border border-black/10 text-[#5F6673] hover:text-[#111111] hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Déplacer vers la gauche / haut"
                          >
                            <ArrowUp size={12} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveGalleryImage(idx, 'down')}
                            disabled={idx === (editingService.gallery_urls?.length || 1) - 1}
                            className="p-1 rounded-md bg-white border border-black/10 text-[#5F6673] hover:text-[#111111] hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Déplacer vers la droite / bas"
                          >
                            <ArrowDown size={12} />
                          </button>

                          {/* Replace */}
                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: 'gallery_replace', index: idx })}
                            className="px-2 py-1 rounded-md bg-white border border-black/10 text-[#5F6673] hover:text-[#4A94D1] hover:bg-black/5 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                            title="Remplacer cette image"
                          >
                            <Edit2 size={11} />
                            <span>Remplacer</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="p-1 rounded-md bg-white border border-black/10 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all ml-auto"
                            title="Supprimer du slider"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-black/15 bg-white text-center space-y-1">
                  <p className="text-xs font-semibold text-[#111111]">Aucune image dans le slider</p>
                  <p className="text-[11px] text-[#5F6673]">
                    Le slider de la page de service affichera l'image illustrative principale. Cliquez sur « Ajouter depuis la médiathèque » pour enrichir la galerie.
                  </p>
                </div>
              )}
            </div>

            {/* Prestations Management */}
            <div className="space-y-3 pt-2 border-t border-black/10">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Liste des prestations couvertes ({editingService.prestations.length})
              </label>
              <div className="space-y-2">
                {editingService.prestations.map((prest, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] text-xs font-medium"
                  >
                    <span>{prest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrestation(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nouvelle prestation..."
                  value={newPrestation}
                  onChange={(e) => setNewPrestation(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleAddPrestation}>
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Advantages */}
            <div className="space-y-3 pt-2 border-t border-black/10">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Points forts & Avantages HINOV
              </label>
              <div className="space-y-2">
                {(editingService.advantages || []).map((adv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] text-xs font-medium"
                  >
                    <span>{adv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdvantage(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nouvel avantage..."
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleAddAdvantage}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setEditingService(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Check size={16} />}>
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget !== null && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={(selected) => {
            if (editingService) {
              const url = typeof selected === 'string' ? selected : selected.url;
              if (mediaPickerTarget.type === 'featured') {
                setEditingService({ ...editingService, featured_image_url: url });
              } else if (mediaPickerTarget.type === 'gallery_add') {
                handleAddGalleryImage(url);
              } else if (mediaPickerTarget.type === 'gallery_replace') {
                handleReplaceGalleryImage(mediaPickerTarget.index, url);
              }
            }
            setMediaPickerTarget(null);
          }}
        />
      )}
    </div>
  );
};
