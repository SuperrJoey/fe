import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { EncryptionService } from '../../utils/encryption';

type Workspace = { _id: string; name: string; inviteCode?: string };
type ChatMessage = { id: string; author: 'me' | 'other'; text: string; at: number; workspaceId: string };

const ChatRoom: React.FC = () => {
  const { socket, connected } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWs, setSelectedWs] = useState<string>('');
  const [newWsName, setNewWsName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  // Derive a per-workspace AES key (demo): from inviteCode using SHA-256
  const deriveKeyForWorkspace = async (wsId: string) => {
    let ws = workspaces.find(w => w._id === wsId);
    // If inviteCode missing (e.g., fresh session on receiver), refresh from API once
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



const joinWorkspaceByCode = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!joinCode.trim()) return;
  const { data } = await api.post('/workspaces/join', { code: joinCode.trim().toUpperCase() });
  setWorkspaces((prev) => {
    const exists = prev.find(w => w._id === data._id);
    return exists ? prev : [data, ...prev];
  });
  setSelectedWs(data._id);
  setJoinCode('');
};

  // Load workspaces
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Workspace[]>('/workspaces');
        setWorkspaces(data);
        if (data.length && !selectedWs) setSelectedWs(data[0]._id);
      } catch (e) {
        // ignore for demo
      }
    })();
  }, []);

  // Join socket room when workspace changes
  useEffect(() => {
    if (!socket || !selectedWs || !user) return;
    const wsName = workspaces.find(w => w._id === selectedWs)?.name;
    console.log('[socket] joining room', { workspaceId: selectedWs, workspaceName: wsName, userId: user.id });
    socket.emit('room:join', { workspaceId: selectedWs, userId: user.id });
  }, [socket, selectedWs, user]);

  // Receive messages (ciphertext) → decrypt → render
  useEffect(() => {
    if (!socket) return;

    const onIncoming = async (payload: any) => {
      try {
        if (!payload?.workspaceId || !payload?.ciphertextB64 || !payload?.ivB64) return;
        const key = await deriveKeyForWorkspace(payload.workspaceId);
        const plain = await EncryptionService.decryptString(payload.ciphertextB64, payload.ivB64, key);
        const plainHash = await EncryptionService.sha256Hex(plain);
        console.log('[crypto] received', {
          workspaceId: payload.workspaceId,
          workspaceName: workspaces.find(w => w._id === payload.workspaceId)?.name,
          ciphertextB64: payload.ciphertextB64,
          ivB64: payload.ivB64,
          decryptedPlaintext: plain,
          decryptedHashSha256: plainHash
        });
        setMessages((prev) => [
          ...prev,
          {
            id: payload.id,
            author: 'other',
            text: plain,
            at: payload.at,
            workspaceId: payload.workspaceId
          }
        ]);
      } catch (err) {
        console.error('[crypto] decrypt failed', err);
      }
    };

    socket.on('chat:message', onIncoming);
    return () => {
      socket.off('chat:message', onIncoming);
    };
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const { data } = await api.post<Workspace>('/workspaces', { name: newWsName.trim() });
    setWorkspaces((prev) => [data, ...prev]);
    setSelectedWs(data._id);
    setNewWsName('');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket || !selectedWs) return;

    try {
      const key = await deriveKeyForWorkspace(selectedWs);
      const now = Date.now();
      const { ciphertextB64, ivB64 } = await EncryptionService.encryptString(text, key);
      const plainHash = await EncryptionService.sha256Hex(text);
      console.log('[crypto] sending', {
        workspaceId: selectedWs,
        workspaceName: workspaces.find(w => w._id === selectedWs)?.name,
        ciphertextB64,
        ivB64,
        plaintext: text,
        plaintextHashSha256: plainHash
      });

      // optimistic local render as plaintext for sender
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text, at: now, workspaceId: selectedWs, author: 'me' }
      ]);

      // emit ciphertext for others
      socket.emit('chat:message', {
        id: crypto.randomUUID(),
        at: now,
        workspaceId: selectedWs,
        ciphertextB64,
        ivB64
      });

      setText('');
    } catch (err) {
      // encryption failed; ignore for demo
    }
  };

  const visibleMessages = messages.filter((m) => m.workspaceId === selectedWs);

  return (
    <div>
      {/* Top bar: create/select workspace */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
	  <form onSubmit={joinWorkspaceByCode} className="flex items-center gap-2">
  <input
    type="text"
    placeholder="Enter code"
    value={joinCode}
    onChange={(e) => setJoinCode(e.target.value)}
    className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
  />
  <button
    type="submit"
    className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900"
  >
    Join
  </button>
</form>
        <form onSubmit={createWorkspace} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New workspace name"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create
          </button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">Workspace</label>
          <select
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="" disabled>Select…</option>
            {workspaces.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>

          {workspaces.find(w => w._id === selectedWs)?.inviteCode && (
            <span className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">
              Code: {workspaces.find(w => w._id === selectedWs)?.inviteCode}
            </span>
          )}

          <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Chat box */}
      <div className="flex h-[520px] flex-col overflow-hidden rounded-lg border bg-white">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {(!selectedWs || visibleMessages.length === 0) && (
            <div className="mr-auto max-w-[75%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800">
              {selectedWs ? 'No messages yet. Say hi!' : 'Create or select a workspace to start.'}
            </div>
          )}
          {visibleMessages.map((m) => (
            <div
              key={m.id}
              className={`${m.author === 'me' ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-100 text-gray-800'} max-w-[75%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap`}
              title={new Date(m.at).toLocaleString()}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-3">
          <input
            type="text"
            placeholder={selectedWs ? 'Type a message…' : 'Select a workspace first…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!selectedWs}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!connected || !text.trim() || !selectedWs}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;