import imageCompression from 'browser-image-compression'

const GALLERY_COMPRESS_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.82,
  fileType: 'image/webp',
}

/** Compresse une image pour la galerie (WebP, max 1920 px, ~1 Mo). Les GIF animés sont conservés tels quels. */
export async function compressGalleryImage(file) {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif') return file

  try {
    return await imageCompression(file, GALLERY_COMPRESS_OPTIONS)
  } catch {
    return file
  }
}
