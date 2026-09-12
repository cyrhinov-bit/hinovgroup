import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MediaDisplay } from '../ui/MediaDisplay';
import { MediaItem, MediaType } from '../../types';
import { uploadMediaFile } from '../../lib/mediaStorage';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Search,
  Check,
  Film,
  Play,
  Cloud,
  HardDrive,
  Loader2,
  AlertCircle,
  Video,
  FileText,
} from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: {
    url: string;
    alt?: string;
    id?: string;
    mediaType?: MediaType;
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
  title = 'Choisir un média (Image ou Vidéo)',
  filterType = 'all',
}) => {
  const { media, store } = useStore();
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>(filterType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Général');
  const [uploadMediaType, setUploadMediaType] = useState<MediaType>('image');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Direct URL state
  const [customUrl, setCustomUrl] = useState('');
  const [customAlt, setCustomAlt] = useState('');
  const [customMediaType, setCustomMediaType] = useState<MediaType>('image');
  const [customPosterUrl, setCustomPosterUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (filterType !== 'all') {
      setTypeFilter(filterType);
    }
  }, [filterType]);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const filteredMedia = media.filter((item) => {
    const isVid =
      item.media_type === 'video' ||
      item.mime_type?.startsWith('video/') ||
      item.url.includes('.mp4') ||
      item.url.includes('.webm') ||
      item.url.includes('.mov') ||
      item.url.includes('youtube.com') ||
      item.url.includes('youtu.be') ||
      item.url.includes('vimeo.com');

    if (typeFilter === 'image' && isVid) return false;
    if (typeFilter === 'video' && !isVid) return false;

    const term = searchTerm.toLowerCase();
    const titleMatch = item.title ? item.title.toLowerCase().includes(term) : false;
    const altMatch = item.alt_text ? item.alt_text.toLowerCase().includes(term) : false;
    const catMatch = item.category ? item.category.toLowerCase().includes(term) : false;

    return !term || titleMatch || altMatch || catMatch;
  });

  const handleFileSelect = (file: File) => {
    setUploadError('');
    setSelectedFile(file);

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    setUploadMediaType(isVideo ? 'video' : 'image');

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(cleanTitle);
    setUploadAlt(`${isVideo ? 'Vidéo' : 'Image'} HINOV Group - ${cleanTitle}`);

    // Create temporary local preview
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const tempUrl = URL.createObjectURL(file);
    setFilePreviewUrl(tempUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText('Préparation du fichier...');
    setUploadError('');

    try {
      const uploadResult = await uploadMediaFile(selectedFile, {
        category: uploadCategory,
        folder: uploadMediaType === 'video' ? 'Vidéos' : 'Général',
        onProgress: (pct, msg) => {
          setUploadProgress(pct);
          setUploadStatusText(msg);
        },
      });

      const newMedia = store.addMedia({
        title: uploadTitle.trim() || (uploadResult.mediaType === 'video' ? 'Nouvelle vidéo' : 'Nouvelle image'),
        filename: uploadResult.fileName,
        file_name: uploadResult.fileName,
        url: uploadResult.url,
        media_type: uploadResult.mediaType,
        mime_type: uploadResult.mimeType,
        file_size: uploadResult.fileSize,
        duration: uploadResult.duration,
        width: uploadResult.width,
        height: uploadResult.height,
        poster_url: uploadResult.posterUrl,
        alt_text: uploadAlt.trim() || 'Média HINOV Group',
        category: uploadCategory,
        folder: uploadMediaType === 'video' ? 'Vidéos' : 'Général',
      });

      onSelect({
        url: newMedia.url,
        alt: newMedia.alt_text,
        id: newMedia.id,
        mediaType: newMedia.media_type,
        posterUrl: newMedia.poster_url,
      });

      onClose();
    } catch (err: any) {
      console.error('Erreur téléversement média:', err);
      setUploadError(err.message || 'Une erreur est survenue lors du téléversement.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;

    const isVid =
      customMediaType === 'video' ||
      customUrl.includes('.mp4') ||
      customUrl.includes('.webm') ||
      customUrl.includes('.mov') ||
      customUrl.includes('youtube.com') ||
      customUrl.includes('youtu.be') ||
      customUrl.includes('vimeo.com');

    const fname = customUrl.split('/').pop()?.split('?')[0] || (isVid ? 'video.mp4' : 'image.jpg');

    const newMedia = store.addMedia({
      filename: fname,
      file_name: fname,
      url: customUrl.trim(),
      media_type: isVid ? 'video' : 'image',
      mime_type: isVid ? 'video/mp4' : 'image/jpeg',
      file_size: isVid ? 2000000 : 100000,
      title: customAlt.trim() || (isVid ? 'Vidéo distante' : 'Image URL'),
      alt_text: customAlt.trim() || 'Média HINOV Group',
      poster_url: customPosterUrl.trim() || undefined,
      category: 'Externe',
      folder: isVid ? 'Vidéos' : 'Général',
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
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:bg-black/5'
            }`}
          >
            <Upload size={13} />
            <span>Téléverser depuis l'ordinateur</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:bg-black/5'
            }`}
          >
            <LinkIcon size={13} />
            <span>Lien Web / Vidéo externe</span>
          </button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par titre, catégorie ou nom de fichier..."
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
                  <span>Vidéos</span>
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {filteredMedia.map((item) => {
                const isSelected = selectedMedia?.id === item.id || currentUrl === item.url;
                const isVid =
                  item.media_type === 'video' ||
                  item.mime_type?.startsWith('video/') ||
                  item.url.includes('.mp4') ||
                  item.url.includes('.webm') ||
                  item.url.includes('.mov') ||
                  item.url.includes('youtube.com') ||
                  item.url.includes('youtu.be') ||
                  item.url.includes('vimeo.com');

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
                    <div className="aspect-video bg-gray-950 relative overflow-hidden flex items-center justify-center">
                      {isVid ? (
                        <>
                          <MediaDisplay
                            mediaType="video"
                            videoUrl={item.url}
                            videoPosterUrl={item.poster_url}
                            autoPlay={false}
                            loop={false}
                            muted={true}
                            showControls={false}
                            interactive={false}
                            className="w-full h-full object-cover"
                            aspectRatioClassName="aspect-video"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
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
                        />
                      )}

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#4A94D1] text-white flex items-center justify-center shadow-md">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-white">
                      <p className="text-xs font-bold text-[#111111] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#5F6673] truncate font-mono">
                        {item.file_name || item.filename}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredMedia.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#5F6673]">
                  <Film size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Aucun média trouvé</p>
                  <p className="text-xs text-[#5F6673]/80 mt-1">
                    Téléversez un fichier depuis votre ordinateur ou ajoutez un lien.
                  </p>
                </div>
              )}
            </div>

            {/* Selection details */}
            {selectedMedia && (
              <div className="p-3 bg-[#EBF4FC] rounded-xl border border-[#4A94D1]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-[#4A94D1]/30 flex items-center justify-center">
                    {selectedMedia.media_type === 'video' || selectedMedia.url.includes('.mp4') ? (
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
                      selectedMedia.mime_type?.startsWith('video/') ||
                      selectedMedia.url.includes('.mp4') ||
                      selectedMedia.url.includes('.webm') ||
                      selectedMedia.url.includes('.mov') ||
                      selectedMedia.url.includes('youtube.com') ||
                      selectedMedia.url.includes('youtu.be') ||
                      selectedMedia.url.includes('vimeo.com');

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
                  Insérer ce média
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload from Computer */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Cloud storage badge */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isSupabaseConfigured
                  ? 'bg-[#E9FAF0] border-[#4AD07B]/30 text-[#1B703C]'
                  : 'bg-[#FDF5EB] border-[#D38323]/30 text-[#B26A15]'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSupabaseConfigured ? (
                  <Cloud size={16} className="text-[#32A85F] shrink-0" />
                ) : (
                  <HardDrive size={16} className="text-[#D38323] shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {isSupabaseConfigured
                      ? 'Stockage Cloud Supabase Actif (CDN Public)'
                      : 'Stockage Local IndexedDB'}
                  </span>
                  <p className="text-[11px] opacity-90">
                    {isSupabaseConfigured
                      ? 'Les vidéos téléversées sont hébergées sur le CDN mondial et visibles par tous les visiteurs dès publication.'
                      : 'Les médias sont stockés dans la base de votre navigateur. Connectez Supabase pour une diffusion cloud mondiale.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Drag and drop box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black/20 hover:border-[#4A94D1] rounded-2xl p-6 text-center cursor-pointer bg-[#F5F7FA] hover:bg-[#EBF4FC]/40 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="video/mp4,video/webm,video/quicktime,video/ogg,video/m4v,image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                onChange={handleFileInputChange}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-[#4A94D1]/10 text-[#4A94D1] flex items-center justify-center mb-3">
                {uploadMediaType === 'video' ? <Video size={24} /> : <Upload size={24} />}
              </div>
              <p className="text-sm font-bold text-[#111111]">
                Glissez-déposez votre vidéo ou image ici, ou{' '}
                <span className="text-[#4A94D1] underline">parcourez votre ordinateur</span>
              </p>
              <p className="text-xs text-[#5F6673] mt-1">
                Formats acceptés : <strong>MP4, WebM, MOV, OGG</strong> (vidéos jusqu'à 100 Mo) &bull;{' '}
                <strong>JPG, PNG, WebP, SVG</strong> (images)
              </p>
            </div>

            {/* Selected File Details & Preview */}
            {selectedFile && (
              <div className="p-4 bg-white rounded-xl border border-black/10 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-56 shrink-0 aspect-video rounded-xl overflow-hidden bg-black/90 relative flex items-center justify-center border border-black/10">
                    {uploadMediaType === 'video' ? (
                      <video
                        src={filePreviewUrl}
                        controls
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={filePreviewUrl}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      {uploadMediaType === 'video' ? 'Vidéo locale' : 'Image locale'}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Titre du média"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Ex: Vidéo présentation HINOV"
                      />
                      <Input
                        label="Texte alternatif (SEO & Accessibilité)"
                        value={uploadAlt}
                        onChange={(e) => setUploadAlt(e.target.value)}
                        placeholder="Ex: Équipe HINOV en action"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5F6673] pt-2 border-t border-black/5">
                      <span>Fichier : <strong>{selectedFile.name}</strong></span>
                      <span>Taille : <strong>{(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo</strong></span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#111111]">
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={13} className="animate-spin text-[#4A94D1]" />
                        {uploadStatusText}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4A94D1] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreviewUrl('');
                    }}
                    disabled={isUploading}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveUpload}
                    disabled={isUploading}
                    leftIcon={isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  >
                    {isUploading ? 'Téléversement en cours...' : 'Enregistrer & Publier'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom URL / YouTube / Vimeo */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCustomMediaType('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  customMediaType === 'video'
                    ? 'bg-[#4AD07B] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-[#5F6673] hover:text-[#111111]'
                }`}
              >
                <Film size={13} />
                <span>Lien Vidéo (YouTube, Vimeo ou MP4 direct)</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomMediaType('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  customMediaType === 'image'
                    ? 'bg-[#4A94D1] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-[#5F6673] hover:text-[#111111]'
                }`}
              >
                <ImageIcon size={13} />
                <span>Image Web (URL directe)</span>
              </button>
            </div>

            <Input
              label={
                customMediaType === 'video'
                  ? 'Lien de la vidéo (YouTube, YouTube Shorts, Vimeo ou URL MP4)'
                  : "URL directe de l'image"
              }
              placeholder={
                customMediaType === 'video'
                  ? 'https://www.youtube.com/watch?v=... ou https://exemple.com/video.mp4'
                  : 'https://images.unsplash.com/...'
              }
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              leftIcon={<LinkIcon size={16} />}
            />

            {customMediaType === 'video' && (
              <Input
                label="Image de couverture (Poster avant lecture - Optionnel)"
                placeholder="https://images.unsplash.com/... ou https://exemple.com/poster.jpg"
                value={customPosterUrl}
                onChange={(e) => setCustomPosterUrl(e.target.value)}
              />
            )}

            <Input
              label="Titre / Description SEO"
              placeholder="Ex: Démonstration des services HINOV"
              value={customAlt}
              onChange={(e) => setCustomAlt(e.target.value)}
            />

            {/* Live Preview */}
            {customUrl && (
              <div className="p-3 bg-[#F5F7FA] rounded-xl border border-black/10 space-y-2">
                <p className="text-xs font-bold text-[#111111]">Aperçu du média :</p>
                <div className="max-w-md aspect-video rounded-xl overflow-hidden bg-black relative flex items-center justify-center border">
                  <MediaDisplay
                    mediaType={customMediaType}
                    videoUrl={customMediaType === 'video' ? customUrl : undefined}
                    imageUrl={customMediaType === 'image' ? customUrl : undefined}
                    videoPosterUrl={customPosterUrl}
                    autoPlay={false}
                    loop={false}
                    muted={true}
                    showControls={true}
                    interactive={true}
                    aspectRatioClassName="aspect-video"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
              <Button variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim()}
              >
                Insérer ce lien
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
