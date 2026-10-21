/**
 * Web Crypto API AES-GCM 256-bit encryption for local offline backups.
 * Zero external transmission - all encryption occurs in-browser.
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(data: unknown, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const plainBytes = enc.encode(JSON.stringify(data));
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plainBytes
  );

  const payload = {
    version: '1.0',
    type: 'ngo_tracker_encrypted_backup',
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(cipherBuffer),
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
}

export async function decryptData<T>(encryptedJsonString: string, passphrase: string): Promise<T> {
  const parsed = JSON.parse(encryptedJsonString);
  if (parsed.type !== 'ngo_tracker_encrypted_backup' && parsed.type !== 'vineyard_encrypted_backup') {
    throw new Error('Unrecognized backup format. Please select a valid NGO Data Tracker backup archive.');
  }

  const salt = new Uint8Array(base64ToArrayBuffer(parsed.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(parsed.iv));
  const cipherBytes = base64ToArrayBuffer(parsed.ciphertext);

  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    cipherBytes
  );

  const dec = new TextDecoder();
  const plainText = dec.decode(decryptedBuffer);
  return JSON.parse(plainText) as T;
}
