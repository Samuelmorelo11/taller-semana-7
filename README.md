# GeoCam

App en Expo que toma fotos con la cámara, guarda su ubicación GPS y las muestra en un mapa
de OpenStreetMap. Desde la Semana 7 los datos viven en **SQLite con Drizzle ORM**: las fotos
sobreviven al cierre de la app (offline-first).

## Cómo ejecutarlo

    npm install
    npx expo start -c

## Arquitectura (por capas)

    Pantalla (app/)  ->  Hook (hooks/)  ->  Repositorio (db/repositories/)  ->  Drizzle + esquema (db/)  ->  SQLite

Las pantallas **no importan nada de Drizzle**: solo usan hooks.

| Capa | Archivos |
|------|----------|
| Pantallas | `app/(tabs)/geocam.tsx`, `fotos.tsx`, `mapa.tsx`, `app/foto/[id].tsx` |
| Hooks | `usePhotos`, `usePhotoList`, `usePhotoDetail`, `useAlbums`, `useCamera`, `useGeoLocation`, `useShake` |
| Repositorios | `db/repositories/photos.ts`, `albums.ts` |
| Esquema / cliente | `db/schema.ts`, `db/client.ts` |
| Archivos | `services/photoFiles.ts` (copia la foto de caché a la carpeta de documentos) |
| Migraciones | `drizzle/` (versionada en Git, generada con `drizzle-kit generate`) |

## Modelo de datos

    albums                          photos
    ------                          ------
    id (PK)                         id (PK)
    name (UNIQUE)                   uri
    created_at                      latitude, longitude, accuracy (nullable)
          ^                         source ('camera' | 'gallery')
          |  0..N                   album_id (FK -> albums.id, ON DELETE SET NULL)
          +-------------------------note (nullable)          [migración 0001]
                                    favorite (boolean, def. false) [migración 0001]
                                    created_at

- `0000_inicial.sql`: tablas `albums` y `photos`.
- `0001_nota_favorito.sql`: agrega `note` y `favorite` sin perder las fotos existentes.
- Al borrar un álbum sus fotos **no** se borran (`PRAGMA foreign_keys = ON` en `db/client.ts`).

## Funciones

- Cámara y galería; la foto se copia a la carpeta de documentos y se borra junto con su registro.
- Pestaña **Fotos**: buscador por nota (`like`), filtro por álbum y por favoritas, creación de álbumes.
- Pantalla de foto: editar nota, favorita, mover de álbum y eliminar con confirmación.
- Agitar el teléfono ofrece borrar todas las fotos (con confirmación).

## Permisos

La app nunca pide permisos al abrirse. La cámara es obligatoria (`PermissionPrimer`); la
ubicación es opcional: si se niega, las fotos se guardan sin coordenadas. Con el permiso
bloqueado aparece el botón **Abrir Ajustes**.

| Concedido | Rechazado | Bloqueado |
|-----------|-----------|-----------|
| _agregar captura/GIF_ | _agregar captura/GIF_ | _agregar captura/GIF_ |

## Evidencia

![Pantalla GeoCam](Evidencia/geocam.png)
![Pantalla Mapa](Evidencia/mapa.png)
