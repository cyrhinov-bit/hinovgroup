import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Film,
  Video,
  Play,
} from 'lucide-react';
import { Page, PageSection } from '../../types';

export const AdminPagesPage: React.FC = () => {
  const { pages, store } = useStore();
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || 'page-home');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<PageSection | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState<any>('rich_text');
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const handleToggleSectionVisibility = (sectionId: string, currentVal: boolean) => {
    store.updateSection(activePage.id, sectionId, { is_visible: !currentVal });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const sorted = [...activePage.sections].sort((a, b) => a.sort_order - b.sort_order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap sort orders
    const currentSection = sorted[index];
    const targetSection = sorted[targetIndex];

    const tempOrder = currentSection.sort_order;
    store.updateSection(activePage.id, currentSection.id, { sort_order: targetSection.sort_order });
    store.updateSection(activePage.id, targetSection.id, { sort_order: tempOrder });
  };

  const handleSaveSection = () => {
    if (!editingSection) return;
    store.updateSection(activePage.id, editingSection.id, editingSection);
    setEditingSection(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    const maxOrder = Math.max(...activePage.sections.map((s) => s.sort_order), 0);
    const newSec: PageSection = {
      id: `sec-${Date.now()}`,
      page_id: activePage.id,
      section_type: newSectionType,
      title: newSectionTitle.trim(),
      content: 'Contenu éditorial à personnaliser...',
      sort_order: maxOrder + 1,
      is_visible: true,
    };

    store.addSection(activePage.id, newSec);
    setIsAddSectionOpen(false);
    setNewSectionTitle('');
  };

  const sortedSections = [...(activePage?.sections || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Gestionnaire de Pages & Sections</h1>
          <p className="text-xs text-[#5F6673]">
            Modifiez en direct les textes, images, bannières et agencements de votre site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={activePage.slug === 'accueil' ? '/' : `/${activePage.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>
              Aperçu en direct
            </Button>
          </a>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAddSectionOpen(true)}
          >
            Ajouter une section
          </Button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-3">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPageId(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedPageId === p.id
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'bg-white text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
            }`}
          >
            Page : {p.title}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
          Sections de la page &laquo; {activePage.title} &raquo; ({sortedSections.length})
        </h2>

        {sortedSections.map((sec, idx) => (
          <Card
            key={sec.id}
            className={`p-5 transition-all ${!sec.is_visible ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#F5F7FA] text-[#5F6673] font-mono text-[10px] font-bold border border-black/5">
                    {sec.section_type}
                  </span>
                  {sec.media_type === 'video' || sec.video_url ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4AD07B]/15 text-[#1b7a42] text-[10px] font-bold">
                      <Film size={11} />
                      Vidéo active
                    </span>
                  ) : sec.image_url ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4A94D1]/15 text-[#3573A8] text-[10px] font-bold">
                      <ImageIcon size={11} />
                      Image
                    </span>
                  ) : null}
                  {!sec.is_visible && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Masqué
                    </span>
                  )}
                  {sec.subtitle && (
                    <span className="text-[11px] text-[#4A94D1] font-bold truncate">
                      {sec.subtitle}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#111111]">{sec.title}</h3>
                <p className="text-xs text-[#5F6673] line-clamp-2">{sec.content}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveSection(idx, 'up')}
                  className="p-2 rounded-lg hover:bg-black/5 text-[#5F6673] disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  disabled={idx === sortedSections.length - 1}
                  onClick={() => handleMoveSection(idx, 'down')}
                  className="p-2 rounded-lg hover:bg-black/5 text-[#5F6673] disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => handleToggleSectionVisibility(sec.id, sec.is_visible)}
                  className="p-2 rounded-lg hover:bg-black/5 text-[#5F6673]"
                  title={sec.is_visible ? 'Masquer' : 'Afficher'}
                >
                  {sec.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={14} />}
                  onClick={() => setEditingSection({ ...sec })}
                >
                  Éditer
                </Button>
                <button
                  onClick={() => setSectionToDelete(sec)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          title={`Édition : ${editingSection.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre principal"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                required
              />
              <Input
                label="Sous-titre / Badge supérieur"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
              />
            </div>

            <Textarea
              label="Texte / Descriptif de la section"
              value={editingSection.content}
              onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
              rows={4}
            />

            {/* Media selection: Image or Short Video */}
            <div className="space-y-3 p-4 rounded-xl border border-black/10 bg-[#F5F7FA]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Type de média de la section
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-black/10">
                  <button
                    type="button"
                    onClick={() => setEditingSection({ ...editingSection, media_type: 'image' })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      editingSection.media_type !== 'video'
                        ? 'bg-[#4A94D1] text-white shadow-xs'
                        : 'text-[#5F6673] hover:text-[#111111]'
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Image statique</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSection({
                        ...editingSection,
                        media_type: 'video',
                        video_autoplay: editingSection.video_autoplay ?? true,
                        video_loop: editingSection.video_loop ?? true,
                        video_muted: editingSection.video_muted ?? true,
                        video_controls: editingSection.video_controls ?? true,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      editingSection.media_type === 'video'
                        ? 'bg-[#4AD07B] text-white shadow-xs'
                        : 'text-[#5F6673] hover:text-[#111111]'
                    }`}
                  >
                    <Film size={13} />
                    <span>Courte vidéo (MP4)</span>
                  </button>
                </div>
              </div>

              {editingSection.media_type === 'video' ? (
                /* Video Configuration */
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <Input
                        label="Lien URL de la vidéo (MP4, WebM ou YouTube)"
                        placeholder="https://.../video.mp4"
                        value={editingSection.video_url || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, video_url: e.target.value })
                        }
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMediaPickerOpen(true)}
                          leftIcon={<Film size={14} />}
                        >
                          Changer la vidéo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#EBF4FC] text-[#3573A8] border-[#4A94D1]/30 hover:bg-[#EBF4FC]/80"
                          onClick={() => {
                            setEditingSection({
                              ...editingSection,
                              media_type: 'image',
                            });
                            setIsMediaPickerOpen(true);
                          }}
                          leftIcon={<ImageIcon size={14} />}
                        >
                          Remplacer par une photo statique
                        </Button>
                        {editingSection.video_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingSection({
                                ...editingSection,
                                video_url: '',
                                media_type: 'image',
                              })
                            }
                          >
                            Retirer la vidéo
                          </Button>
                        )}
                      </div>

                      <Input
                        label="Image de couverture (Poster avant lecture - optionnel)"
                        placeholder="https://.../poster.jpg"
                        value={editingSection.video_poster_url || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            video_poster_url: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Live Video Preview Box */}
                    <div className="w-full md:w-56 shrink-0">
                      <p className="text-xs font-bold text-[#111111] mb-1">Aperçu en direct :</p>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/90 border border-black/15 relative flex items-center justify-center">
                        {editingSection.video_url ? (
                          <MediaDisplay
                            mediaType="video"
                            videoUrl={editingSection.video_url}
                            videoPosterUrl={editingSection.video_poster_url}
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            showControls={true}
                            interactive={true}
                            className="w-full h-full object-cover"
                            aspectRatioClassName="aspect-[4/3]"
                          />
                        ) : (
                          <div className="text-center p-3 text-white/50 space-y-1">
                            <Film size={24} className="mx-auto text-white/30" />
                            <p className="text-[11px]">Aucune vidéo renseignée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Playback Options */}
                  <div className="p-3 bg-white rounded-lg border border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-[#111111] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingSection.video_autoplay ?? true}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            video_autoplay: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-[#4A94D1] focus:ring-[#4A94D1]"
                      />
                      <span>Lecture auto (Muet)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-[#111111] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingSection.video_loop ?? true}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            video_loop: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-[#4A94D1] focus:ring-[#4A94D1]"
                      />
                      <span>Boucle infinie</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-[#111111] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingSection.video_controls ?? true}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            video_controls: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-[#4A94D1] focus:ring-[#4A94D1]"
                      />
                      <span>Boutons son / pause</span>
                    </label>
                  </div>
                </div>
              ) : (
                /* Static Image Configuration */
                <div className="flex items-center gap-4 pt-1">
                  {editingSection.image_url ? (
                    <img
                      src={typeof editingSection.image_url === 'string' ? editingSection.image_url : (editingSection.image_url as any)?.url || ''}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover border border-black/10 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center text-[#5F6673] shrink-0">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-[#5F6673] truncate">
                      {(typeof editingSection.image_url === 'string' ? editingSection.image_url : (editingSection.image_url as any)?.url) || 'Aucune image sélectionnée'}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMediaPickerOpen(true)}
                        leftIcon={<ImageIcon size={14} />}
                      >
                        Changer la photo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#E9FAF0] text-[#1B703C] border-[#4AD07B]/30 hover:bg-[#E9FAF0]/80"
                        onClick={() => {
                          setEditingSection({
                            ...editingSection,
                            media_type: 'video',
                            video_autoplay: true,
                            video_loop: true,
                            video_muted: true,
                            video_controls: true,
                          });
                          setIsMediaPickerOpen(true);
                        }}
                        leftIcon={<Film size={14} />}
                      >
                        Remplacer par une vidéo
                      </Button>
                      {editingSection.image_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection({ ...editingSection, image_url: '' })}
                        >
                          Retirer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/10">
              <Input
                label="Bouton principal (Label)"
                value={editingSection.cta_label || ''}
                onChange={(e) => setEditingSection({ ...editingSection, cta_label: e.target.value })}
                placeholder="Ex: Demander un devis"
              />
              <Input
                label="Bouton principal (Lien)"
                value={editingSection.cta_link || ''}
                onChange={(e) => setEditingSection({ ...editingSection, cta_link: e.target.value })}
                placeholder="Ex: /devis"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bouton secondaire (Label)"
                value={editingSection.secondary_cta_label || ''}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, secondary_cta_label: e.target.value })
                }
                placeholder="Ex: En savoir plus"
              />
              <Input
                label="Bouton secondaire (Lien)"
                value={editingSection.secondary_cta_link || ''}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, secondary_cta_link: e.target.value })
                }
                placeholder="Ex: /services"
              />
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setEditingSection(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveSection} leftIcon={<Check size={16} />}>
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Section Modal */}
      {isAddSectionOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddSectionOpen(false)}
          title="Ajouter une nouvelle section"
        >
          <div className="space-y-4">
            <Select
              label="Type de section"
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value)}
            >
              <option value="presentation">Présentation & Visuel (Image ou Vidéo)</option>
              <option value="video_spotlight">Focus / Plein écran vidéo courte</option>
              <option value="rich_text">Bloc de texte éditorial</option>
              <option value="cta">Bannière d'action (CTA)</option>
              <option value="why_us">Arguments / Pourquoi nous choisir</option>
              <option value="contact_quick">Bloc contact rapide</option>
            </Select>

            <Input
              label="Titre de la section"
              placeholder="Ex: Notre engagement qualité"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              required
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-black/10">
              <Button variant="outline" size="sm" onClick={() => setIsAddSectionOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddSection}>
                Créer la section
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(selected) => {
            if (editingSection) {
              const isVid =
                selected.mediaType === 'video' ||
                selected.url.includes('.mp4') ||
                selected.url.includes('.webm') ||
                selected.url.includes('.mov') ||
                selected.url.includes('.ogg') ||
                selected.url.includes('youtube.com') ||
                selected.url.includes('youtu.be') ||
                selected.url.includes('vimeo.com');

              if (isVid) {
                setEditingSection({
                  ...editingSection,
                  media_type: 'video',
                  video_url: selected.url,
                  video_poster_url: selected.posterUrl || editingSection.video_poster_url,
                  image_alt: selected.alt || editingSection.image_alt,
                  video_autoplay: editingSection.video_autoplay ?? true,
                  video_loop: editingSection.video_loop ?? true,
                  video_controls: editingSection.video_controls ?? true,
                });
              } else {
                setEditingSection({
                  ...editingSection,
                  media_type: 'image',
                  image_url: selected.url,
                  image_alt: selected.alt || editingSection.image_alt,
                });
              }
            }
            setIsMediaPickerOpen(false);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {sectionToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setSectionToDelete(null)}
          onConfirm={() => {
            store.deleteSection(activePage.id, sectionToDelete.id);
            setSectionToDelete(null);
          }}
          title="Supprimer cette section ?"
          message={`Êtes-vous certain de vouloir supprimer définitivement la section "${sectionToDelete.title}" ?`}
          confirmVariant="danger"
          confirmLabel="Supprimer la section"
        />
      )}
    </div>
  );
};
