import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from '../../hooks/useStore';
import { MediaItem } from '../../types';
import {
  Search,
  Upload,
  Check,
  Image as ImageIcon,
  Film,
  Play,
  Filter,
} from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: {
    url: string;
    alt?: string;
    id?: string;
    mediaType?: 'image' | 'video';
    posterUrl?: string;
  }) => void;
  currentUrl?: string;
  title?: string;
  filterType?: 'all' | 'image' | 'video';
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = 'Choisir un média (Image ou Courte Vidéo)',
  filterType = 'all',
}) => {
  const { media, store } = useStore();
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>(filterType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Upload form states
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Général');
  const [uploadMediaType, setUploadMediaType] = useState<'image' | 'video'>('image');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; type: string } | null>(null);

  // Direct URL state
  const [customUrl, setCustomUrl] = useState('');
  const [customAlt, setCustomAlt] = useState('');
  const [customMediaType, setCustomMediaType] = useState<'image' | 'video'>('image');
  const [customPosterUrl, setCustomPosterUrl] = useState('');

  const filteredMedia = media.filter((item) => {
    const isVid =
      item.media_type === 'video' ||
      item.mime_type?.startsWith('video/') ||
      item.url.endsWith('.mp4') ||
      item.url.endsWith('.webm');

    if (typeFilter === 'image' && isVid) return false;
    if (typeFilter === 'video' && !isVid) return false;

    const term = searchTerm.toLowerCase();
    const titleMatch = item.title ? item.title.toLowerCase().includes(term) : false;
    const altMatch = item.alt_text ? item.alt_text.toLowerCase().includes(term) : false;
    const catMatch = item.category ? item.category.toLowerCase().includes(term) : false;

    return !term || titleMatch || altMatch || catMatch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 15MB for video, 5MB for image
    const isVideoFile = file.type.startsWith('video/');
    const maxSizeBytes = isVideoFile ? 15 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(`Le fichier dépasse la limite maximale recommandée de ${isVideoFile ? '15' : '5'} Mo.`);
      return;
    }

    setUploadMediaType(isVideoFile ? 'video' : 'image');
    setFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    setUploadAlt(`${isVideoFile ? 'Vidéo' : 'Image'} HINOV Group - ${file.name}`);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPreviewUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = () => {
    if (!previewUrl) return;

    const isVid = uploadMediaType === 'video' || fileMeta?.type.startsWith('video/');
    const newMedia = store.addMedia({
      filename: fileMeta?.name || (isVid ? 'video.mp4' : 'image.jpg'),
      file_name: fileMeta?.name || (isVid ? 'video.mp4' : 'image.jpg'),
      url: previewUrl,
      media_type: isVid ? 'video' : 'image',
      mime_type: fileMeta?.type || (isVid ? 'video/mp4' : 'image/jpeg'),
      file_size: fileMeta?.size || (isVid ? 2500000 : 150000),
      title: uploadTitle.trim() || (isVid ? 'Nouvelle vidéo' : 'Nouvelle image'),
      alt_text: uploadAlt.trim() || 'Média HINOV Group',
      category: uploadCategory,
    });

    onSelect({
      url: newMedia.url,
      alt: newMedia.alt_text,
      id: newMedia.id,
      mediaType: newMedia.media_type,
    });
    onClose();
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    const isVid =
      customMediaType === 'video' ||
      customUrl.endsWith('.mp4') ||
      customUrl.endsWith('.webm') ||
      customUrl.includes('youtube.com') ||
      customUrl.includes('youtu.be') ||
      customUrl.includes('vimeo.com');

    const newMedia = store.addMedia({
      filename: customUrl.split('/').pop()?.split('?')[0] || (isVid ? 'video.mp4' : 'image.jpg'),
      file_name: customUrl.split('/').pop()?.split('?')[0] || (isVid ? 'video.mp4' : 'image.jpg'),
      url: customUrl.trim(),
      media_type: isVid ? 'video' : 'image',
      mime_type: isVid ? 'video/mp4' : 'image/jpeg',
      file_size: isVid ? 2000000 : 100000,
      title: customAlt.trim() || (isVid ? 'Vidéo URL' : 'Image URL'),
      alt_text: customAlt.trim() || 'Média HINOV Group',
      poster_url: customPosterUrl.trim() || undefined,
      category: 'Externe',
    });

    onSelect({
      url: newMedia.url,
      alt: newMedia.alt_text,
      id: newMedia.id,
      mediaType: isVid ? 'video' : 'image',
      posterUrl: newMedia.poster_url,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:bg-black/5'
            }`}
          >
            Médiathèque ({media.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:bg-black/5'
            }`}
          >
            Téléverser (Image ou Vidéo)
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:bg-black/5'
            }`}
          >
            Lien URL Web / Vidéo MP4
          </button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par titre, catégorie ou texte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={16} />}
                />
              </div>

              {/* Media type filter buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA] rounded-xl border border-black/5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#5F6673] hover:text-[#111111]'
                  }`}
                >
                  Tous ({media.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('image')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    typeFilter === 'image'
                      ? 'bg-[#4A94D1] text-white shadow-xs'
                      : 'text-[#5F6673] hover:text-[#111111]'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>Images</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('video')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    typeFilter === 'video'
                      ? 'bg-[#4AD07B] text-white shadow-xs'
                      : 'text-[#5F6673] hover:text-[#111111]'
                  }`}
                >
                  <Film size={13} />
                  <span>Vidéos courtes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1">
              {filteredMedia.map((item) => {
                const isSelected = selectedMedia?.id === item.id || currentUrl === item.url;
                const usageCount = item.used_in?.length || 0;
                const isVid =
                  item.media_type === 'video' ||
                  item.mime_type?.startsWith('video/') ||
                  item.url.endsWith('.mp4') ||
                  item.url.endsWith('.webm');

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#4A94D1] ring-2 ring-[#4A94D1]/30 shadow-md scale-[1.02]'
                        : 'border-black/10 hover:border-black/25'
                    }`}
                  >
                    <div className="aspect-video bg-gray-900 relative overflow-hidden flex items-center justify-center">
                      {isVid ? (
                        <>
                          <video
                            src={item.url}
                            poster={item.poster_url}
                            muted
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play size={14} className="fill-white translate-x-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#4AD07B] text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs flex items-center gap-1">
                            <Film size={10} />
                            Vidéo
                          </span>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.alt_text}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#4A94D1] text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}

                      {usageCount > 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                          {usageCount} util.
                        </span>
                      )}
                    </div>

                    <div className="p-2 bg-white">
                      <p className="text-xs font-semibold text-[#111111] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#5F6673] truncate">{item.category || 'Général'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection details */}
            {selectedMedia && (
              <div className="p-3 bg-[#EBF4FC] rounded-xl border border-[#4A94D1]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-[#4A94D1]/30 flex items-center justify-center">
                    {selectedMedia.media_type === 'video' || selectedMedia.url.endsWith('.mp4') ? (
                      <Film size={20} className="text-[#4A94D1]" />
                    ) : (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.alt_text}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#111111]">{selectedMedia.title}</p>
                      {selectedMedia.media_type === 'video' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#4AD07B] text-white">
                          Vidéo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5F6673]">
                      Alt: "{selectedMedia.alt_text}" &bull;{' '}
                      {selectedMedia.used_in && selectedMedia.used_in.length > 0
                        ? `Utilisé dans ${selectedMedia.used_in.length} emplacement(s)`
                        : 'Non utilisé'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const isVid =
                      selectedMedia.media_type === 'video' ||
                      selectedMedia.url.endsWith('.mp4') ||
                      selectedMedia.url.endsWith('.webm');
                    onSelect({
                      url: selectedMedia.url,
                      alt: selectedMedia.alt_text,
                      id: selectedMedia.id,
                      mediaType: isVid ? 'video' : 'image',
                      posterUrl: selectedMedia.poster_url,
                    });
                    onClose();
                  }}
                >
                  Valider la sélection
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#4A94D1]/40 rounded-2xl bg-[#EBF4FC]/40 hover:bg-[#EBF4FC]/60 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#4A94D1] shadow-xs flex items-center justify-center mb-3">
                  <Upload size={28} />
                </div>
                <p className="text-sm font-bold text-[#111111]">
                  Cliquez pour sélectionner une image ou une courte vidéo
                </p>
                <p className="text-xs text-[#5F6673] mt-1">
                  Formats acceptés : JPG, PNG, WEBP, SVG, MP4, WebM (Vidéos max 15 Mo, Images max 5 Mo)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#111111]">Aperçu du fichier :</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#4A94D1]/15 text-[#3573A8]">
                      {uploadMediaType === 'video' ? 'Vidéo courte' : 'Image statique'}
                    </span>
                  </div>

                  <div className="aspect-video rounded-xl overflow-hidden border border-black/15 bg-black/90 relative flex items-center justify-center">
                    {uploadMediaType === 'video' ? (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <button
                    onClick={() => setPreviewUrl('')}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Changer de fichier
                  </button>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Titre du média"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Texte alternatif ou descriptif"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="Ex: Démonstration câblage réseau ou impression"
                    required
                  />
                  <Input
                    label="Catégorie"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  />

                  <div className="pt-2">
                    <Button variant="primary" size="md" className="w-full" onClick={handleSaveUpload}>
                      Téléverser et sélectionner
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#111111]">Type de contenu :</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMediaType('image')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    customMediaType === 'image'
                      ? 'bg-[#4A94D1] text-white border-[#4A94D1]'
                      : 'bg-white text-[#5F6673] border-black/10'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMediaType('video')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    customMediaType === 'video'
                      ? 'bg-[#4AD07B] text-white border-[#4AD07B]'
                      : 'bg-white text-[#5F6673] border-black/10'
                  }`}
                >
                  Courte Vidéo (MP4 / WebM / YouTube)
                </button>
              </div>
            </div>

            <Input
              label={customMediaType === 'video' ? 'Lien URL de la vidéo (MP4 direct ou YouTube)' : "URL directe de l'image"}
              placeholder={
                customMediaType === 'video'
                  ? 'https://exemple.com/video-demonstration.mp4'
                  : 'https://images.unsplash.com/...'
              }
              value={customUrl}
              onChange={(e) => {
                const url = e.target.value;
                setCustomUrl(url);
                if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube.com') || url.includes('youtu.be')) {
                  setCustomMediaType('video');
                }
              }}
              required
            />

            <Input
              label="Titre ou texte alternatif"
              placeholder="Ex: Séquence atelier d'impression HINOV"
              value={customAlt}
              onChange={(e) => setCustomAlt(e.target.value)}
            />

            {customMediaType === 'video' && (
              <Input
                label="Image de couverture de la vidéo (Poster URL - optionnel)"
                placeholder="https://.../poster.jpg"
                value={customPosterUrl}
                onChange={(e) => setCustomPosterUrl(e.target.value)}
              />
            )}

            {customUrl && (
              <div className="aspect-video max-h-52 rounded-xl overflow-hidden border bg-black/90 flex items-center justify-center">
                {customMediaType === 'video' ? (
                  <video
                    src={customUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={customUrl}
                    alt="Aperçu URL"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim()}
              >
                Enregistrer et utiliser ce média
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
