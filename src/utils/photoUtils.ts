/**
 * Utilities for handling child beneficiary photos from local files and Google Drive links.
 */

export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/{id}
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pattern 2: id={id}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: /d/{id}
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 4: direct ID if user just pasted an ID string
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  // Strictly block dangerous pseudo-protocols, script execution schemes, SVG and HTML payloads
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('data:application/') ||
    lower.startsWith('data:image/svg') ||
    lower.includes('<') ||
    lower.includes('>') ||
    lower.includes('"') ||
    lower.includes("'")
  ) {
    return false;
  }

  // Safe data URIs: strictly allow standard raster image base64 formats only
  if (lower.startsWith('data:')) {
    return /^data:image\/(jpeg|png|webp|gif|jpg);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed);
  }

  // Safe relative paths starting with / or ./ (avoid protocol-relative //)
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return !trimmed.startsWith('//');
  }

  // Safe HTTP/HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w800`;
  }
  if (!isSafeImageUrl(trimmed)) {
    return '';
  }

  const lower = trimmed.toLowerCase();

  // Canonicalize validated raster data URLs to avoid returning raw user input directly
  if (lower.startsWith('data:')) {
    const dataMatch = trimmed.match(/^data:image\/(jpeg|png|webp|gif|jpg);base64,([a-zA-Z0-9+/=]+)$/i);
    if (!dataMatch) {
      return '';
    }
    const imageType = dataMatch[1].toLowerCase();
    const base64Payload = dataMatch[2];
    return `data:image/${imageType};base64,${base64Payload}`;
  }

  // Normalize safe relative URLs and reject suspicious characters
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    if (
      trimmed.startsWith('//') ||
      /[\u0000-\u001F\u007F<>"']/.test(trimmed)
    ) {
      return '';
    }
    return encodeURI(trimmed);
  }

  // Normalize absolute URLs through URL parsing and strict protocol allowlist
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

export function normalizePhotoUrl(input: string): string {
  return sanitizeImageUrl(input);
}

export function isGoogleDriveUrl(url: string): boolean {
  return Boolean(extractGoogleDriveId(url));
}

/**
 * Reads a local image file and compresses/scales it for clean local storage persistence.
 */
export function readFileAsDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with good quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
