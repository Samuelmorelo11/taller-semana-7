import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { photosRepo, type PhotoFilters } from '@/db/repositories/photos';

/** Lista filtrada: se recalcula sola cuando cambian los filtros (C4). */
export function usePhotoList(filters: PhotoFilters) {
  const { data, error } = useLiveQuery(photosRepo.listQuery(filters), [
    filters.search,
    filters.albumId,
    filters.onlyFavorites,
  ]);
  return { photos: data, error };
}
