import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { EncryptionService } from '../../utils/encryption';
import { fileToArrayBuffer, arrayBufferToBlob, encryptFile, decryptFile } from '../../utils/fileEncryption';
import SearchBar from '../Common/SearchBar';
import { searchText, highlightText } from '../../utils/searchUtils';

type Workspace = { _id: string; name: string; inviteCode?: string };
type FileMetadata = {
  _id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  createdAt: string;
  uploaderId: string;
  workspaceId: string;
};

const FileVault: React.FC = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWs, setSelectedWs] = useState<string>('');
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive workspace key (same as ChatRoom)
  const deriveKeyForWorkspace = async (wsId: string) => {
    let ws = workspaces.find(w => w._id === wsId);
    if (!ws?.inviteCode) {
      try {
        const { data } = await api.get<Workspace[]>('/workspaces');
        setWorkspaces(data);
        ws = data.find((w) => w._id === wsId);
      } catch {
        // ignore
      }
    }
    if (!ws?.inviteCode) throw new Error('Missing inviteCode for workspace');
    const digestHex = await EncryptionService.sha256Hex(ws.inviteCode.toUpperCase());
    const bytesArr = new Uint8Array(digestHex.match(/.{1,2}/g)!.map(h => parseInt(h, 16)));
    let binary = '';
    for (let i = 0; i < bytesArr.length; i++) binary += String.fromCharCode(bytesArr[i]);
    const b64 = btoa(binary);
    return EncryptionService.importAesKeyBase64(b64);
  };

  // Load workspaces
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Workspace[]>('/workspaces');
        setWorkspaces(data);
        if (data.length && !selectedWs) setSelectedWs(data[0]._id);
      } catch (e) {
        console.error('Failed to load workspaces:', e);
      }
    })();
  }, []);

  // Load files when workspace changes
  useEffect(() => {
    if (!selectedWs) return;

    const loadFiles = async () => {
      try {
        const { data } = await api.get<{ files: FileMetadata[] }>(`/files/workspace/${selectedWs}`);
        setFiles(data.files || []);
      } catch (error) {
        console.error('Failed to load files:', error);
      }
    };

    loadFiles();
  }, [selectedWs]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedWs) return;

    setUploading(true);
    try {
      // Get workspace key
      const key = await deriveKeyForWorkspace(selectedWs);

      // Read file as ArrayBuffer
      const fileBuffer = await fileToArrayBuffer(file);

      // Encrypt file
      const { encryptedB64, ivB64 } = await encryptFile(fileBuffer, key);

      // Calculate hash of original file using Web Crypto API
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[crypto] uploading file', {
        filename: file.name,
        size: file.size,
        workspaceId: selectedWs,
        hash,
        encryptedSize: encryptedB64.length
      });

      // Convert encrypted base64 to Blob for upload
      const encryptedBytes = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
      const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });

      // Create FormData
      const formData = new FormData();
      formData.append('file', encryptedBlob, file.name);
      formData.append('workspaceId', selectedWs);
      formData.append('ivB64', ivB64);
      formData.append('hash', hash);
      formData.append('originalSize', file.size.toString());
      formData.append('originalFilename', file.name);
      formData.append('contentType', file.type || 'application/octet-stream');

      // Upload to server
      const { data } = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('[persistence] file saved to database', data);
      console.log('[blockchain] hash queued for blockchain storage:', hash);

      // Reload files
      const { data: filesData } = await api.get<{ files: FileMetadata[] }>(`/files/workspace/${selectedWs}`);
      setFiles(filesData.files || []);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file download
  const handleFileDownload = async (file: FileMetadata) => {
    try {
      console.log('[download] Starting download for file:', file._id);
      
      // Get workspace key
      const key = await deriveKeyForWorkspace(file.workspaceId);

      // Download encrypted file
      const response = await api.get(`/files/${file._id}`, {
        responseType: 'blob',
        // Important: axios needs this to expose custom headers
        transformResponse: [(data) => data]
      });

      console.log('[download] Response received', {
        status: response.status,
        headers: response.headers
      });

      // Get IV and hash from headers (case-insensitive access)
      const ivB64 = response.headers['x-file-iv'] || response.headers['X-File-IV'];
      const hash = response.headers['x-file-hash'] || response.headers['X-File-Hash'];

      console.log('[download] Headers extracted', { ivB64: !!ivB64, hash: !!hash });

      if (!ivB64) {
        throw new Error('IV not found in response headers');
      }

      // Read encrypted blob as ArrayBuffer
      const encryptedBuffer = await response.data.arrayBuffer();
      console.log('[download] Encrypted buffer size:', encryptedBuffer.byteLength);

      // Convert ArrayBuffer to base64 for decryption
      const encryptedArray = new Uint8Array(encryptedBuffer);
      let encryptedStr = '';
      for (let i = 0; i < encryptedArray.length; i++) {
        encryptedStr += String.fromCharCode(encryptedArray[i]);
      }
      const encryptedB64 = btoa(encryptedStr);

      // Decrypt file
      const decryptedBuffer = await decryptFile(encryptedB64, ivB64, key);
      console.log('[download] Decrypted buffer size:', decryptedBuffer.byteLength);

      console.log('[crypto] downloaded and decrypted file', {
        filename: file.originalFilename,
        workspaceId: file.workspaceId,
        hash
      });

      // Create blob and download
      const blob = arrayBufferToBlob(decryptedBuffer, file.contentType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFilename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error: any) {
      console.error('[download] Failed to download file:', error);
      console.error('[download] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to download file: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle file deletion
  const handleFileDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.delete(`/files/${fileId}`);
      
      // Reload files
      const { data } = await api.get<{ files: FileMetadata[] }>(`/files/workspace/${selectedWs}`);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎥';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('sheet') || contentType.includes('excel')) return '📊';
    if (contentType.includes('zip') || contentType.includes('archive')) return '📦';
    return '📎';
  };

  // Filter files by search query
  const filteredFiles = searchQuery.trim()
    ? files.filter((file) => searchText(file.originalFilename, searchQuery))
    : files;

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full px-4 md:px-0">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Secure File Vault</h2>
        <p className="mt-2 text-gray-600">Encrypted file storage with blockchain audit trails</p>
      </div>

      {/* Workspace Selector */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 md:p-6 shadow-lg">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Workspace</label>
        <select
          value={selectedWs}
          onChange={(e) => setSelectedWs(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="" disabled>Select a workspace…</option>
          {workspaces.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      {selectedWs && (
        <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">
              ☁️
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Upload Encrypted Files</h3>
            <p className="mb-4 text-sm text-gray-600">All files are encrypted with AES-256 before upload</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              disabled={!selectedWs || uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
                !selectedWs || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:scale-105 cursor-pointer'
              }`}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Choose File</span>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 md:p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Files</h3>
          {files.length > 0 && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              {searchQuery.trim() && filteredFiles.length !== files.length && (
                <span className="ml-1 text-gray-500">of {files.length}</span>
              )}
            </span>
          )}
        </div>

        {/* Search Bar */}
        {selectedWs && files.length > 0 && (
          <div className="mb-4">
            <SearchBar
              placeholder="Search files by name..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              resultCount={filteredFiles.length}
              className="w-full"
            />
          </div>
        )}

        {!selectedWs ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl">
              📁
            </div>
            <p className="text-gray-500">Select a workspace to view files</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              📦
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">No files yet</h3>
            <p className="text-gray-500">Upload your first file to get started</p>
          </div>
        ) : searchQuery.trim() && filteredFiles.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              🔍
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">No files found</h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => {
              // Highlight filename if searching
              const highlightedFilename = searchQuery.trim()
                ? highlightText(file.originalFilename, searchQuery)
                : file.originalFilename;

              return (
              <div
                key={file._id}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md transition-all hover:border-indigo-300 hover:shadow-lg hover:scale-105"
              >
                {/* File Icon */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-2xl">
                  {getFileIcon(file.contentType)}
                </div>

                {/* File Info */}
                <h4 
                  className="mb-1 text-sm font-bold text-gray-900 break-words" 
                  title={file.originalFilename}
                  dangerouslySetInnerHTML={{ __html: highlightedFilename }}
                />
                <p className="mb-3 text-xs text-gray-500">
                  {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFileDownload(file)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg"
                  >
                    📥 Download
                  </button>
                  {file.uploaderId === user?.id && (
                    <button
                      onClick={() => handleFileDelete(file._id)}
                      className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Security Badge */}
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <span>🔒</span>
                  <span className="font-medium">Encrypted</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileVault;
