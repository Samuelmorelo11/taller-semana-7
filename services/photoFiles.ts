import { Directory, File, Paths } from 'expo-file-system';

/**
 * Archivos permanentes de las fotos.
 *
 * `takePictureAsync` e `ImagePicker` devuelven URIs en la carpeta de CACHE, que
 * el sistema puede vaciar. Aqui se copian a la carpeta de documentos (segura)
 * y es esa ruta la que se guarda en SQLite.
 *
 * Se usa solo la API nueva (File / Directory / Paths) del SDK 57; no se mezcla
 * con `FileSystem.copyAsync` de la API anterior.
 */
const photosDir = new Directory(Paths.document, 'photos');

function ensureDir(): void {
  if (!photosDir.exists) {
    photosDir.create({ intermediates: true, idempotent: true });
  }
}

export function persistPhoto(cacheUri: string): string {
  ensureDir();
  const source = new File(cacheUri);
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destination = new File(photosDir, name);
  source.copy(destination);
  return destination.uri;
}

export function deletePhotoFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    // Borrar el archivo nunca debe impedir borrar el registro
    console.warn('[GeoCam] No se pudo borrar el archivo:', e instanceof Error ? e.message : e);
  }
}
