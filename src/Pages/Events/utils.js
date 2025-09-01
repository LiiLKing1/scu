// Google Drive audio link utils

/**
 * Extracts the Google Drive FILE_ID from various share link formats or a raw ID.
 * Supported:
 *  - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *  - https://drive.google.com/open?id=FILE_ID
 *  - https://docs.google.com/uc?export=download&id=FILE_ID
 *  - Raw FILE_ID (letters, digits, _ or -)
 */
export function extractDriveFileId(input) {
  if (!input) return null;
  const s = String(input).trim();

  // If it's likely a raw file id
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;

  try {
    const u = new URL(s);

    // /file/d/FILE_ID/...
    const m1 = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m1 && m1[1]) return m1[1];

    // /d/FILE_ID
    const m2 = u.pathname.match(/\/d\/([^/]+)/);
    if (m2 && m2[1]) return m2[1];

    // ?id=FILE_ID
    const id = u.searchParams.get('id') || u.searchParams.get('ids');
    if (id) return id;
  } catch {
    // Not a URL; fall through
  }

  return null;
}

/**
 * Builds a streamable link for <audio> from a FILE_ID.
 * mode:
 *  - 'download' => https://docs.google.com/uc?export=download&id=FILE_ID
 *  - 'preview'  => https://drive.google.com/uc?export=preview&id=FILE_ID
 */
export function buildDriveAudioUrl(fileId, mode = 'download') {
  if (!fileId) return null;
  const exportType = mode === 'preview' ? 'preview' : 'download';
  const host = mode === 'preview' ? 'https://drive.google.com/uc' : 'https://docs.google.com/uc';
  return `${host}?export=${exportType}&id=${encodeURIComponent(fileId)}`;
}

/**
 * Normalizes any Google Drive share link (or raw ID) to a direct audio URL.
 * Returns { src, fileId, normalized }.
 */
export function normalizeDriveAudioLink(input, options = {}) {
  const mode = options.mode === 'preview' ? 'preview' : 'download';
  const fileId = extractDriveFileId(input);
  if (!fileId) {
    return { src: String(input || '').trim(), fileId: null, normalized: false };
  }
  return { src: buildDriveAudioUrl(fileId, mode), fileId, normalized: true };
}
