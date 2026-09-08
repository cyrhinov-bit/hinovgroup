import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
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
} from 'lucide-react';
import { MediaItem } from '../../types';

export const AdminMediaPage: React.FC = () => {
  const { media, store } = useStore();
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Services');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newPosterUrl, setNewPosterUrl] = useState('');

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const isVid =
        m.media_type === 'video' ||
        m.mime_type?.startsWith('video/') ||
        m.url.endsWith('.mp4') ||
        m.url.endsWith('.webm');

      if (selectedType === 'image' && isVid) return false;
      if (selectedType === 'video' && !isVid) return false;

      const matchFolder = selectedFolder === 'all' || m.folder === selectedFolder;
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

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const isVid =
      newMediaType === 'video' ||
      newUrl.endsWith('.mp4') ||
      newUrl.endsWith('.webm') ||
      newUrl.includes('youtube.com') ||
      newUrl.includes('youtu.be');

    const fname = newUrl.split('/').pop()?.split('?')[0] || (isVid ? 'video.mp4' : 'image.jpg');
    store.addMedia({
      title: newTitle.trim() || (isVid ? 'Vidéo HINOV' : 'Visuel HINOV'),
      url: newUrl.trim(),
      filename: fname,
      file_name: fname,
      alt_text: newTitle.trim() || (isVid ? 'Vidéo HINOV Group' : 'Visuel HINOV Group'),
      file_size: isVid ? 3500000 : 250000,
      mime_type: isVid ? 'video/mp4' : 'image/jpeg',
      media_type: isVid ? 'video' : 'image',
      poster_url: newPosterUrl.trim() || undefined,
      folder: newFolder,
    });

    setIsAddOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewPosterUrl('');
    setNewMediaType('image');
  };

  const folders = ['all', 'Services', 'Produits', 'Réalisations', 'Bannières', 'Logos', 'Général'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Médiathèque Centrale</h1>
          <p className="text-xs text-[#5F6673]">
            Bibliothèque d'images et de courtes vidéos utilisées pour les pages, services, catalogue et réalisations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Upload size={14} />}
          onClick={() => setIsAddOpen(true)}
        >
          Ajouter un média (Image / Vidéo)
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
            <span>Vidéos courtes</span>
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
            item.url.endsWith('.mp4') ||
            item.url.endsWith('.webm');

          return (
            <Card key={item.id} className="overflow-hidden flex flex-col justify-between group">
              <div className="aspect-video bg-gray-950 relative overflow-hidden flex items-center justify-center">
                {isVid ? (
                  <>
                    <video
                      src={item.url}
                      poster={item.poster_url}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                      {item.folder || 'Général'}
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
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Media Modal */}
      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title="Ajouter un média (Image ou Courte Vidéo)"
        >
          <form onSubmit={handleAddMedia} className="space-y-4">
            {/* Format choice */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Type de média
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewMediaType('image')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    newMediaType === 'image'
                      ? 'bg-[#4A94D1] text-white border-[#4A94D1]'
                      : 'bg-white text-[#5F6673] border-black/15'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Image statique</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewMediaType('video')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    newMediaType === 'video'
                      ? 'bg-[#4AD07B] text-white border-[#4AD07B]'
                      : 'bg-white text-[#5F6673] border-black/15'
                  }`}
                >
                  <Film size={14} />
                  <span>Courte vidéo (MP4 / WebM)</span>
                </button>
              </div>
            </div>

            <Input
              label="Titre du média"
              placeholder={newMediaType === 'video' ? 'Ex: Démonstration câblage réseau' : 'Ex: Ordinateur portable maintenance'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <Input
              label={newMediaType === 'video' ? 'URL publique de la vidéo (MP4 ou WebM)' : "URL publique de l'image"}
              placeholder={newMediaType === 'video' ? 'https://.../video.mp4' : 'https://images.unsplash.com/...'}
              value={newUrl}
              onChange={(e) => {
                const url = e.target.value;
                setNewUrl(url);
                if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube.com')) {
                  setNewMediaType('video');
                }
              }}
              required
            />

            {newMediaType === 'video' && (
              <Input
                label="URL de couverture (Poster avant lecture - optionnel)"
                placeholder="https://.../poster.jpg"
                value={newPosterUrl}
                onChange={(e) => setNewPosterUrl(e.target.value)}
              />
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Dossier de classement
              </label>
              <select
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-[#F5F7FA] px-3.5 py-2.5 text-xs font-bold"
              >
                <option value="Services">Services (Informatique, Imprimerie, etc.)</option>
                <option value="Produits">Produits & Fournitures</option>
                <option value="Réalisations">Portfolio Réalisations</option>
                <option value="Bannières">Bannières & Hero</option>
                <option value="Logos">Logos & Icones</option>
                <option value="Général">Général</option>
              </select>
            </div>

            {newUrl && (
              <div className="p-3 bg-[#F5F7FA] rounded-xl border border-black/10">
                <p className="text-xs font-bold text-[#111111] mb-2">Aperçu :</p>
                {newMediaType === 'video' ? (
                  <video
                    src={newUrl}
                    poster={newPosterUrl}
                    controls
                    playsInline
                    className="w-full h-44 object-contain rounded-lg bg-black border border-black/10"
                  />
                ) : (
                  <img
                    src={newUrl}
                    alt="Aperçu"
                    className="w-full h-44 object-cover rounded-lg border border-black/10"
                  />
                )}
              </div>
            )}

            <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Enregistrer dans la médiathèque
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {mediaToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setMediaToDelete(null)}
          onConfirm={() => {
            store.deleteMedia(mediaToDelete.id);
            setMediaToDelete(null);
          }}
          title="Supprimer ce média ?"
          message={`Êtes-vous sûr de vouloir supprimer "${mediaToDelete.title}" de la médiathèque ?`}
          confirmVariant="danger"
          confirmLabel="Supprimer"
        />
      )}
    </div>
  );
};
