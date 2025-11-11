// Encrypt file (ArrayBuffer) using Web Crypto API directly
export async function encryptFile(file: ArrayBuffer, key: CryptoKey): Promise<{ encryptedB64: string; ivB64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    file
  );
  
  // Convert to base64 (handle large arrays)
  const encryptedArray = new Uint8Array(encrypted);
  let encryptedStr = '';
  for (let i = 0; i < encryptedArray.length; i++) {
    encryptedStr += String.fromCharCode(encryptedArray[i]);
  }
  const encryptedB64 = btoa(encryptedStr);
  
  let ivStr = '';
  for (let i = 0; i < iv.length; i++) {
    ivStr += String.fromCharCode(iv[i]);
  }
  const ivB64 = btoa(ivStr);
  
  return { encryptedB64, ivB64 };
}

// Decrypt file (base64) to ArrayBuffer using Web Crypto API directly
export async function decryptFile(encryptedB64: string, ivB64: string, key: CryptoKey): Promise<ArrayBuffer> {
  // Convert base64 to Uint8Array
  const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  
  return decrypted;
}

// Convert file to ArrayBuffer
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Convert ArrayBuffer to Blob for download
export function arrayBufferToBlob(buffer: ArrayBuffer, contentType: string): Blob {
  return new Blob([buffer], { type: contentType });
}

