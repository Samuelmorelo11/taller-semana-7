import { and, desc, eq, isNotNull, like } from 'drizzle-orm';

import { db } from '@/db/client';
import { photos, type NewPhoto } from '@/db/schema';

export type PhotoInput = Omit<NewPhoto, 'id' | 'createdAt'>;
export type PhotoPatch = Partial<Pick<NewPhoto, 'note' | 'favorite' | 'albumId'>>;

export interface PhotoFilters {
  search: string;
  /** `null` = todos los albumes */
  albumId: number | null;
  onlyFavorites: boolean;
}

/** Unica capa que conoce Drizzle: las funciones ...Query() devuelven la consulta sin ejecutarla. */
export const photosRepo = {
  listQuery(filters?: PhotoFilters) {
    const conditions = [];
    if (filters) {
      const term = filters.search.trim();
      if (term) conditions.push(like(photos.note, `%${term}%`));
      if (filters.albumId !== null) conditions.push(eq(photos.albumId, filters.albumId));
      if (filters.onlyFavorites) conditions.push(eq(photos.favorite, true));
    }
    return db
      .select()
      .from(photos)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(photos.createdAt));
  },

  withLocationQuery() {
    return db
      .select()
      .from(photos)
      .where(and(isNotNull(photos.latitude), isNotNull(photos.longitude)))
      .orderBy(desc(photos.createdAt));
  },

  byIdQuery(id: number) {
    return db.select().from(photos).where(eq(photos.id, id));
  },

  findById(id: number) {
    return db.select().from(photos).where(eq(photos.id, id)).get();
  },

  listAll() {
    return db.select().from(photos).all();
  },

  create(data: PhotoInput) {
    return db.insert(photos).values(data);
  },

  update(id: number, data: PhotoPatch) {
    return db.update(photos).set(data).where(eq(photos.id, id));
  },

  remove(id: number) {
    return db.delete(photos).where(eq(photos.id, id));
  },

  clearAll() {
    return db.delete(photos);
  },
};
