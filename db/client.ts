import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener es obligatorio para que useLiveQuery se actualice
export const expoDb = openDatabaseSync('geocam.db', { enableChangeListener: true });

// SQLite no hace cumplir las llaves foraneas (ni onDelete: 'set null')
// a menos que se active en cada conexion.
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(expoDb, { schema });
