import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { albumsRepo } from '@/db/repositories/albums';

export function useAlbums() {
  const { data: albums } = useLiveQuery(albumsRepo.listQuery());

  const createAlbum = useCallback(async (name: string): Promise<string | null> => {
    const clean = name.trim();
    if (!clean) return 'Escribe un nombre para el album.';
    try {
      await albumsRepo.create(clean);
      return null;
    } catch {
      // name es unique: el unico fallo esperable es un duplicado
      return 'Ya existe un album con ese nombre.';
    }
  }, []);

  const removeAlbum = useCallback((id: number) => albumsRepo.remove(id), []);

  return { albums, createAlbum, removeAlbum };
}
