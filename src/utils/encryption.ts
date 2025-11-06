// Real AES-256-GCM and SHA-256 using Web Crypto API

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}

function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export class EncryptionService {
  // AES-256-GCM key generation
  static async generateAESKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Export/import helpers for storing keys
  static async exportKeyBase64(key: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey('raw', key);
    return toBase64(raw);
  }

  static async importAesKeyBase64(b64: string): Promise<CryptoKey> {
    const raw = fromBase64(b64);
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  }

  // Encrypt string → base64(ciphertext), base64(iv)
  static async encryptString(plaintext: string, key: CryptoKey): Promise<{ ciphertextB64: string; ivB64: string }>
  {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    const data = textEncoder.encode(plaintext);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    return { ciphertextB64: toBase64(ct), ivB64: toBase64(iv.buffer) };
  }

  // Decrypt using base64 inputs
  static async decryptString(ciphertextB64: string, ivB64: string, key: CryptoKey): Promise<string> {
    const iv = new Uint8Array(fromBase64(ivB64));
    const ct = fromBase64(ciphertextB64);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return textDecoder.decode(pt);
  }

  // SHA-256 hash → hex string
  static async sha256Hex(data: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(data));
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}