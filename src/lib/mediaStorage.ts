import { supabase, isSupabaseConfigured } from './supabase';
import { MediaItem, MediaType } from '../types';

/**
 * IndexedDB Configuration for Local/Offline Binary Storage
 */
const DB_NAME = 'hinov_media_store';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

// In-memory registry for object URLs
const blobUrlCache = new Map<string, string>();

export async function saveLocalBlob(id: string, blob: Blob): Promise<string> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = { id, blob, created_at: Date.now() };
    const req = store.put(item);
    req.onsuccess = () => {
      // Create and cache object URL
      if (blobUrlCache.has(id)) {
        URL.revokeObjectURL(blobUrlCache.get(id)!);
      }
      const objectUrl = URL.createObjectURL(blob);
      blobUrlCache.set(id, objectUrl);
      resolve(objectUrl);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalBlobUrl(id: string): Promise<string | null> {
  if (blobUrlCache.has(id)) {
    return blobUrlCache.get(id)!;
  }
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result?.blob) {
          const url = URL.createObjectURL(req.result.blob);
          blobUrlCache.set(id, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteLocalBlob(id: string): Promise<void> {
  if (blobUrlCache.has(id)) {
    URL.revokeObjectURL(blobUrlCache.get(id)!);
    blobUrlCache.delete(id);
  }
  try {
    const db = await getIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch {
    // Ignore error on deletion
  }
}

/**
 * Capture an automatic video poster thumbnail (WebP/JPEG) from a video File
 */
export async function generateVideoPoster(
  file: File
): Promise<{ posterUrl: string; duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      // Seek to 1 second or 25% of duration for a representative frame
      const seekTime = Math.min(1.0, video.duration > 0 ? video.duration * 0.25 : 0);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 640;
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 360;
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const posterUrl = canvas.toDataURL('image/jpeg', 0.7);
          cleanup();
          resolve({
            posterUrl,
            duration: Math.round(video.duration || 0),
            width: video.videoWidth || width,
            height: video.videoHeight || height,
          });
          return;
        }
      } catch (err) {
        console.warn('Canvas poster capture fallback:', err);
      }
      cleanup();
      resolve({
        posterUrl: '',
        duration: Math.round(video.duration || 0),
        width: 1280,
        height: 720,
      });
    };

    video.onerror = () => {
      cleanup();
      resolve({
        posterUrl: '',
        duration: 0,
        width: 1280,
        height: 720,
      });
    };

    // Timeout safety in case video cannot decode
    setTimeout(() => {
      cleanup();
      resolve({
        posterUrl: '',
        duration: 0,
        width: 1280,
        height: 720,
      });
    }, 5000);
  });
}

export interface UploadProgressCallback {
  (progress: number, statusText: string): void;
}

export interface UploadMediaResult {
  url: string;
  posterUrl?: string;
  mediaType: MediaType;
  mimeType: string;
  fileSize: number;
  fileName: string;
  duration?: number;
  width?: number;
  height?: number;
  storagePath?: string;
  isCloudStored: boolean;
}

/**
 * Upload a media file from the user's computer.
 * - If Supabase is connected: uploads binary file to Supabase Storage bucket 'media' for global public CDN access.
 * - If Supabase is not connected: stores safely into IndexedDB for persistent local playback.
 */
export async function uploadMediaFile(
  file: File,
  options?: {
    category?: string;
    folder?: string;
    onProgress?: UploadProgressCallback;
  }
): Promise<UploadMediaResult> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
  const mediaType: MediaType = isVideo ? 'video' : 'image';
  const onProgress = options?.onProgress || (() => {});

  onProgress(10, 'Analyse du fichier...');

  let posterUrl: string | undefined = undefined;
  let duration = 0;
  let width = 1280;
  let height = 720;

  if (isVideo) {
    onProgress(20, 'Génération de la miniature de couverture...');
    try {
      const posterData = await generateVideoPoster(file);
      posterUrl = posterData.posterUrl;
      duration = posterData.duration;
      width = posterData.width;
      height = posterData.height;
    } catch (e) {
      console.warn('Could not generate poster:', e);
    }
  }

  // --- 1. Supabase Cloud Storage Mode (Public CDN - Visible to all visitors worldwide) ---
  if (supabase && isSupabaseConfigured) {
    try {
      onProgress(35, 'Téléversement sur le Cloud Supabase Storage...');

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const folderPath = isVideo ? 'videos' : 'images';
      const filePath = `${folderPath}/${timestamp}_${sanitizedName}`;

      // Upload main media file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true,
          contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        });

      if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      onProgress(80, 'Finalisation et génération du lien public CDN...');

      // Retrieve public CDN URL
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(uploadData.path);
      const publicUrl = publicUrlData.publicUrl;

      // Also upload poster if available
      let cloudPosterUrl = posterUrl;
      if (posterUrl && posterUrl.startsWith('data:image/')) {
        try {
          const res = await fetch(posterUrl);
          const posterBlob = await res.blob();
          const posterPath = `posters/${timestamp}_${sanitizedName}.jpg`;
          const { data: posterUploadData } = await supabase.storage
            .from('media')
            .upload(posterPath, posterBlob, {
              contentType: 'image/jpeg',
              upsert: true,
            });
          if (posterUploadData) {
            const { data: pUrl } = supabase.storage.from('media').getPublicUrl(posterUploadData.path);
            cloudPosterUrl = pUrl.publicUrl;
          }
        } catch (posterErr) {
          console.warn('Could not upload cloud poster, keeping base64:', posterErr);
        }
      }

      onProgress(100, 'Téléversement réussi ! Média disponible pour tous.');

      return {
        url: publicUrl,
        posterUrl: cloudPosterUrl,
        mediaType,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        fileSize: file.size,
        fileName: file.name,
        duration,
        width,
        height,
        isCloudStored: true,
      };
    } catch (cloudErr) {
      console.warn('Fallback to local storage following cloud upload failure:', cloudErr);
    }
  }

  // --- 2. Local Fallback via IndexedDB (Zero LocalStorage quota limit) ---
  onProgress(60, 'Enregistrement sécurisé dans la base locale (IndexedDB)...');
  const localId = `blob_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const objectUrl = await saveLocalBlob(localId, file);

  onProgress(100, 'Prêt ! Média sauvegardé en local.');

  return {
    url: objectUrl,
    posterUrl,
    mediaType,
    mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    fileSize: file.size,
    fileName: file.name,
    duration,
    width,
    height,
    storagePath: localId,
    isCloudStored: false,
  };
}

/**
 * Restore an object URL from IndexedDB for a given media item if its URL was a local blob
 */
export async function restoreMediaItemUrl(id: string, storagePath?: string): Promise<string | null> {
  const key = storagePath || id;
  return getLocalBlobUrl(key);
}
