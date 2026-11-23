// Compression d'images côté navigateur avant envoi.
// Une photo de smartphone pèse 3 à 8 Mo : redimensionnée à 1600 px et encodée
// en WebP, elle tombe en général sous 300 Ko sans perte visible.

export interface CompressOptions {
  /** Plus grand côté en pixels (par défaut 1600). */
  maxSize?: number;
  /** Qualité 0-1 (par défaut 0.82). */
  quality?: number;
}

const COMPRESSIBLE = /^image\/(jpeg|jpg|png|webp|heic|heif)$/i;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Retourne un fichier compressé, ou le fichier d'origine si la compression
 * échoue ou n'apporte aucun gain (on ne dégrade jamais un fichier déjà léger).
 */
export async function compressImage(file: File, { maxSize = 1600, quality = 0.82 }: CompressOptions = {}): Promise<File> {
  if (typeof document === 'undefined' || !COMPRESSIBLE.test(file.type)) return file;

  try {
    const img = await loadImage(file);
    const ratio = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * ratio));
    const height = Math.max(1, Math.round(img.naturalHeight * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Version « data URL » pour les cas où le fichier est stocké en base (ex. pièces d'identité). */
export async function compressImageToDataUrl(file: File, options?: CompressOptions): Promise<string> {
  const compressed = await compressImage(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
}
