import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Film,
  Play,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { MediaItem } from '../../types';

export const AdminMediaPage: React.FC = () => {
  const { media, store } = useStore();
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const isVid =
        m.media_type === 'video' ||
        m.mime_type?.startsWith('video/') ||
        m.url.includes('.mp4') ||
        m.url.includes('.webm') ||
        m.url.includes('.mov') ||
        m.url.includes('youtube.com') ||
        m.url.includes('youtu.be') ||
        m.url.includes('vimeo.com');

      if (selectedType === 'image' && isVid) return false;
      if (selectedType === 'video' && !isVid) return false;

      const matchFolder = selectedFolder === 'all' || m.folder === selectedFolder || m.category === selectedFolder;
      const matchSearch =
        !searchTerm.trim() ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.file_name && m.file_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.filename && m.filename.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchFolder && matchSearch;
    });
  }, [media, selectedFolder, selectedType, searchTerm]);

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDeleteConfirm = () => {
    if (mediaToDelete) {
      store.deleteMedia(mediaToDelete.id);
      setMediaToDelete(null);
    }
  };

  const folders = ['all', 'Vidéos', 'Services', 'Produits', 'Réalisations', 'Bannières', 'Logos', 'Général'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Médiathèque Centrale</h1>
          <p className="text-xs text-[#5F6673]">
            Bibliothèque d'images et de vidéos utilisées pour les pages, services, catalogue et réalisations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={15} />}
          onClick={() => setIsPickerOpen(true)}
        >
          Téléverser ou Ajouter un Média
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Media type filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA] rounded-xl border border-black/5 self-start md:self-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedType === 'all'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#5F6673] hover:text-[#111111]'
            }`}
          >
            Tous ({media.length})
          </button>
          <button
            onClick={() => setSelectedType('image')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedType === 'image'
                ? 'bg-[#4A94D1] text-white shadow-xs'
                : 'text-[#5F6673] hover:text-[#111111]'
            }`}
          >
            <ImageIcon size={13} />
            <span>Images</span>
          </button>
          <button
            onClick={() => setSelectedType('video')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedType === 'video'
                ? 'bg-[#4AD07B] text-white shadow-xs'
                : 'text-[#5F6673] hover:text-[#111111]'
            }`}
          >
            <Film size={13} />
            <span>Vidéos</span>
          </button>
        </div>

        {/* Folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F5F7FA] text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
              }`}
            >
              {folder === 'all' ? 'Tous dossiers' : folder}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredMedia.map((item) => {
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
            <Card key={item.id} className="overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div
                className="aspect-video bg-gray-950 relative overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewMedia(item)}
              >
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
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Play size={16} className="fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#4AD07B] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <Film size={11} />
                      Vidéo
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs">
                      {item.folder || item.category || 'Général'}
                    </span>
                  </>
                )}

                {item.duration && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                    {item.duration}s
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <p className="text-xs font-bold text-[#111111] truncate">{item.title}</p>
                <p className="text-[11px] font-mono text-[#5F6673] truncate">
                  {item.file_name || item.filename}
                </p>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(item)}
                    leftIcon={
                      copiedId === item.id ? (
                        <Check size={12} className="text-[#32A85F]" />
                      ) : (
                        <Copy size={12} />
                      )
                    }
                  >
                    {copiedId === item.id ? 'Copié !' : 'Copier lien'}
                  </Button>

                  <button
                    onClick={() => setMediaToDelete(item)}
                    className="p-1.5 text-[#5F6673] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer ce média"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Media Picker Modal for uploading */}
      {isPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(selected) => {
            setIsPickerOpen(false);
          }}
          title="Téléverser un nouveau média"
        />
      )}

      {/* Delete Confirmation Modal */}
      {mediaToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setMediaToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Supprimer ce média ?"
          message={`Êtes-vous sûr de vouloir supprimer définitivement "${mediaToDelete.title}" ?`}
          confirmLabel="Supprimer"
          variant="danger"
        />
      )}
    </div>
  );
};
