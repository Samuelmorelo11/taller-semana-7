import { asc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { albums } from '@/db/schema';

export const albumsRepo = {
  listQuery() {
    return db.select().from(albums).orderBy(asc(albums.name));
  },

  create(name: string) {
    return db.insert(albums).values({ name });
  },

  // Gracias a onDelete: 'set null' sus fotos quedan sin album, no se borran
  remove(id: number) {
    return db.delete(albums).where(eq(albums.id, id));
  },
};
