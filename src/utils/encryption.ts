import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly ALGORITHM = 'AES';
  private static readonly MODE = CryptoJS.mode.CBC;
  private static readonly PADDING = CryptoJS.pad.Pkcs7;

  // Generate a random AES key
  static generateAESKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Encrypt message with AES
  static encryptMessage(message: string, key: string): { encrypted: string; iv: string } {
    const iv = CryptoJS.lib.WordArray.random(128/8);
    const encrypted = CryptoJS.AES.encrypt(message, key, {
      iv: iv,
      mode: this.MODE,
      padding: this.PADDING
    });
    
    return {
      encrypted: encrypted.toString(),
      iv: iv.toString()
    };
  }

  // Decrypt message with AES
  static decryptMessage(encryptedData: string, key: string, iv: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: this.MODE,
      padding: this.PADDING
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Generate RSA key pair (simplified - in production use proper RSA library)
  static generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    // This is a placeholder - you'll need to implement proper RSA key generation
    // Consider using 'node-forge' or 'crypto-js' with proper RSA implementation
    return {
      publicKey: 'placeholder-public-key',
      privateKey: 'placeholder-private-key'
    };
  }

  // Hash data with SHA-256
  static hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
}