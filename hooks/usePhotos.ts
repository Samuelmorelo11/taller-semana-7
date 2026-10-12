import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo } from 'react';

import { photosRepo } from '@/db/repositories/photos';
import type { Photo } from '@/db/schema';
import { deletePhotoFile, persistPhoto } from '@/services/photoFiles';
import type { Coords, GeoPhotoSource } from '@/types/geo';

/** Foto con coordenadas garantizadas (sin `?? 0`: ver `LocatedPhoto` en types/geo.ts). */
export type LocatedPhotoRow = Photo & { latitude: number; longitude: number };

export function hasLocation(photo: Photo): photo is LocatedPhotoRow {
  return photo.latitude !== null && photo.longitude !== null;
}

export interface AddPhotoInput {
  /** URI temporal (cache) de la camara o la galeria. */
  uri: string;
  coords: Coords | null;
  source: GeoPhotoSource;
}

export interface UsePhotosResult {
  photos: Photo[];
  photosWithLocation: LocatedPhotoRow[];
  error: Error | undefined;
  addPhoto: (input: AddPhotoInput) => Promise<void>;
  removePhoto: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function usePhotos(): UsePhotosResult {
  const { data: photos, error } = useLiveQuery(photosRepo.listQuery());
  const { data: located } = useLiveQuery(photosRepo.withLocationQuery());

  // El filtro SQL ya garantiza coordenadas; el type guard estrecha el tipo sin `as`
  const photosWithLocation = useMemo(() => located.filter(hasLocation), [located]);

  const addPhoto = useCallback(async ({ uri, coords, source }: AddPhotoInput) => {
    // 1) Archivo permanente  2) Registro en SQLite con la nueva ruta
    const permanentUri = persistPhoto(uri);
    try {
      await photosRepo.create({
        uri: permanentUri,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        accuracy: coords?.accuracy ?? null,
        source,
      });
    } catch (e) {
      // Si falla el INSERT no se deja un archivo huerfano
      deletePhotoFile(permanentUri);
      throw e;
    }
  }, []);

  const removePhoto = useCallback(async (id: number) => {
    const photo = await photosRepo.findById(id);
    await photosRepo.remove(id);
    if (photo) deletePhotoFile(photo.uri);
  }, []);

  const clearAll = useCallback(async () => {
    const all = await photosRepo.listAll();
    await photosRepo.clearAll();
    all.forEach((p) => deletePhotoFile(p.uri));
  }, []);

  return { photos, photosWithLocation, error, addPhoto, removePhoto, clearAll };
}
