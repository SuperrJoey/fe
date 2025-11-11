import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { EncryptionService } from '../../utils/encryption';
import SearchBar from '../Common/SearchBar';
import { searchText, highlightText } from '../../utils/searchUtils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const workspacesRef = useRef(workspaces);
  const loadingMessagesRef = useRef<{ [workspaceId: string]: boolean }>({});
  const { user } = useAuth();
  
  // Keep workspaces ref in sync
  useEffect(() => {
    workspacesRef.current = workspaces;
  }, [workspaces]);
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
        if (data.length) {
          // Prefer workspace from query param if provided
          const params = new URLSearchParams(window.location.search);
          const wsParam = params.get('ws');
          if (wsParam && data.some(w => w._id === wsParam)) {
            setSelectedWs(wsParam);
          } else if (!selectedWs) {
            setSelectedWs(data[0]._id);
          }
        }
      } catch (e) {
        // ignore for demo
      }
    })();
  }, []);

  // Load message history when workspace changes
  useEffect(() => {
    if (!selectedWs || !user) return;
    
    // Prevent multiple simultaneous loads for the same workspace
    if (loadingMessagesRef.current[selectedWs]) {
      console.log('[loadMessages] Already loading messages for workspace:', selectedWs);
      return;
    }
    
    const loadMessages = async () => {
      // Mark as loading
      loadingMessagesRef.current[selectedWs] = true;
      
      try {
        const { data } = await api.get<{ messages: any[] }>(`/messages/workspace/${selectedWs}`);
        if (!data.messages || data.messages.length === 0) {
          // Clear messages for this workspace if none found
          setMessages((prev) => prev.filter(m => m.workspaceId !== selectedWs));
          loadingMessagesRef.current[selectedWs] = false;
          return;
        }

        const key = await deriveKeyForWorkspace(selectedWs);
        
        // Decrypt and format messages
        const decryptedMessages = await Promise.all(
          data.messages.map(async (msg): Promise<ChatMessage | null> => {
            try {
              const plain = await EncryptionService.decryptString(msg.ciphertextB64, msg.ivB64, key);
              return {
                id: msg._id,
                author: msg.senderId === user.id ? 'me' : 'other',
                text: plain,
                at: new Date(msg.createdAt).getTime(),
                workspaceId: msg.workspaceId
              };
            } catch (err) {
              console.error('Failed to decrypt message:', err);
              return null;
            }
          })
        );

        // Filter out failed decryptions and set messages
        const validMessages = decryptedMessages.filter((m): m is ChatMessage => m !== null);
        
        console.log('[loadMessages] Loading messages for workspace:', selectedWs, 'Found:', validMessages.length);
        
        setMessages((prev) => {
          // Keep messages from other workspaces
          const otherWorkspaceMessages = prev.filter(m => m.workspaceId !== selectedWs);
          
          // Get ALL existing messages for this workspace (both optimistic and real)
          const existingWorkspaceMessages = prev.filter(m => m.workspaceId === selectedWs);
          console.log('[loadMessages] Existing messages for workspace:', existingWorkspaceMessages.length);
          
          // Create a set of existing real message IDs (ObjectId format, 24 chars)
          const existingRealMessageIds = new Set(
            existingWorkspaceMessages
              .filter(m => m.id.length === 24) // Only real messages (ObjectId)
              .map(m => m.id)
          );
          
          // Filter out messages that already exist in state (by ID)
          const newMessages = validMessages.filter(msg => !existingRealMessageIds.has(msg.id));
          console.log('[loadMessages] New messages to add:', newMessages.length, 'out of', validMessages.length);
          
          // Get optimistic messages (UUID format, typically 36 chars) for this workspace
          // These are messages that were sent but not yet saved to DB
          const optimisticMessages = existingWorkspaceMessages.filter(m => 
            m.id.length > 24 // UUIDs are longer than MongoDB ObjectIds (24 chars)
          );
          console.log('[loadMessages] Optimistic messages:', optimisticMessages.length);
          
          // Create a map of real messages by content+timestamp for matching optimistic ones
          const realMessagesByContent = new Map<string, ChatMessage>();
          validMessages.forEach(msg => {
            const key = `${msg.text}|${msg.author}|${Math.floor(msg.at / 1000)}`; // Round to seconds
            if (!realMessagesByContent.has(key)) {
              realMessagesByContent.set(key, msg);
            }
          });
          
          // Find optimistic messages that match real messages (by content + author + timestamp within 10s)
          const matchedOptimisticIds = new Set<string>();
          optimisticMessages.forEach(optMsg => {
            const optKey = `${optMsg.text}|${optMsg.author}|${Math.floor(optMsg.at / 1000)}`;
            const match = realMessagesByContent.get(optKey);
            if (match && Math.abs(match.at - optMsg.at) < 10000) {
              matchedOptimisticIds.add(optMsg.id);
              console.log('[loadMessages] Matched optimistic message:', optMsg.id, 'with real:', match.id);
            }
          });
          
          // Keep only optimistic messages that haven't been matched (not yet saved to DB)
          const unmatchedOptimistic = optimisticMessages.filter(opt => 
            !matchedOptimisticIds.has(opt.id)
          );
          console.log('[loadMessages] Unmatched optimistic messages:', unmatchedOptimistic.length);
          
          // Combine: other workspace messages + existing real messages + new messages + unmatched optimistic messages
          const allMessages = [
            ...otherWorkspaceMessages,
            ...existingWorkspaceMessages.filter(m => m.id.length === 24), // Keep existing real messages
            ...newMessages, // Add only new messages
            ...unmatchedOptimistic
          ];
          
          // Final deduplication by ID (this should catch any remaining duplicates)
          const messageMap = new Map<string, ChatMessage>();
          allMessages.forEach(msg => {
            // If we already have this ID, keep the one with the real ID (ObjectId) over UUID
            if (messageMap.has(msg.id)) {
              const existing = messageMap.get(msg.id)!;
              // Prefer real message (ObjectId) over optimistic (UUID)
              if (msg.id.length <= 24 && existing.id.length > 24) {
                messageMap.set(msg.id, msg);
                console.log('[loadMessages] Replaced optimistic with real message:', msg.id);
              } else {
                console.log('[loadMessages] Duplicate message ID found, keeping existing:', msg.id);
              }
            } else {
              messageMap.set(msg.id, msg);
            }
          });
          
          const uniqueMessages = Array.from(messageMap.values());
          console.log('[loadMessages] Final unique messages:', uniqueMessages.length, 'for workspace:', selectedWs);
          
          // Sort by timestamp
          return uniqueMessages.sort((a, b) => a.at - b.at);
        });
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        // Mark as not loading
        loadingMessagesRef.current[selectedWs] = false;
      }
    };
    
    // Add a small delay to prevent rapid re-loading when switching workspaces
    const timeoutId = setTimeout(() => {
      loadMessages();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      loadingMessagesRef.current[selectedWs] = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWs, user?.id]); // Only reload when workspace or user changes, not workspaces array

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
        
        // Skip if this is our own message (already rendered optimistically)
        if (payload.senderId === user?.id) return;
        
        const key = await deriveKeyForWorkspace(payload.workspaceId);
        const plain = await EncryptionService.decryptString(payload.ciphertextB64, payload.ivB64, key);
        const plainHash = await EncryptionService.sha256Hex(plain);
        console.log('[crypto] received', {
          workspaceId: payload.workspaceId,
          workspaceName: workspacesRef.current.find(w => w._id === payload.workspaceId)?.name,
          ciphertextB64: payload.ciphertextB64,
          ivB64: payload.ivB64,
          decryptedPlaintext: plain,
          decryptedHashSha256: plainHash
        });
        
        // Check if message already exists (avoid duplicates)
        setMessages((prev) => {
          // Check by ID first
          const existsById = prev.some(m => m.id === payload.id);
          if (existsById) {
            console.log('[socket] Message already exists by ID:', payload.id);
            return prev;
          }
          
          // Also check if this message matches an optimistic one (by content and timestamp)
          // This can happen if the message was sent optimistically but then received via socket
          const optimisticMatch = prev.find(m => 
            m.workspaceId === payload.workspaceId &&
            m.text === plain &&
            Math.abs(m.at - payload.at) < 10000 && // Within 10 seconds
            m.id.length > 24 // Optimistic messages have UUID format
          );
          
          if (optimisticMatch) {
            console.log('[socket] Replacing optimistic message with real one:', optimisticMatch.id, '->', payload.id);
            // Replace optimistic message with real one
            return prev.map(m => {
              if (m.id === optimisticMatch.id) {
                return {
                  id: payload.id,
                  author: 'other',
                  text: plain,
                  at: payload.at,
                  workspaceId: payload.workspaceId
                };
              }
              return m;
            });
          }
          
          // New message, add it
          return [
            ...prev,
            {
              id: payload.id,
              author: 'other',
              text: plain,
              at: payload.at,
              workspaceId: payload.workspaceId
            }
          ];
        });
      } catch (err) {
        console.error('[crypto] decrypt failed', err);
      }
    };

    socket.on('chat:message', onIncoming);
    return () => {
      socket.off('chat:message', onIncoming);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.id]); // Only depend on socket and user.id, not workspaces array

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
    if (!text.trim() || !socket || !selectedWs || !user) return;

    try {
      const key = await deriveKeyForWorkspace(selectedWs);
      const now = Date.now();
      const { ciphertextB64, ivB64 } = await EncryptionService.encryptString(text, key);
      const plainHash = await EncryptionService.sha256Hex(text);
      const messageId = crypto.randomUUID();
      
      console.log('[crypto] sending', {
        workspaceId: selectedWs,
        workspaceName: workspaces.find(w => w._id === selectedWs)?.name,
        ciphertextB64,
        ivB64,
        plaintext: text,
        plaintextHashSha256: plainHash
      });

      // Save message to database via API
      try {
        await api.post('/messages', {
          workspaceId: selectedWs,
          ciphertextB64,
          ivB64,
          hash: plainHash
        });
        console.log('[persistence] message saved to database');
        console.log('[blockchain] hash queued for blockchain storage:', plainHash);
      } catch (err) {
        console.error('[persistence] failed to save message:', err);
      }

      // Optimistic local render as plaintext for sender
      setMessages((prev) => [
        ...prev,
        { id: messageId, text, at: now, workspaceId: selectedWs, author: 'me' }
      ]);

      // Emit ciphertext for real-time delivery to others
      socket.emit('chat:message', {
        id: messageId,
        at: now,
        workspaceId: selectedWs,
        senderId: user.id,
        ciphertextB64,
        ivB64,
        hash: plainHash
      });

      setText('');
    } catch (err) {
      console.error('[crypto] encryption/send failed:', err);
    }
  };

  // Filter messages by workspace (memoized to prevent infinite loops)
  const visibleMessages = useMemo(() => {
    return messages.filter((m) => m.workspaceId === selectedWs);
  }, [messages, selectedWs]);

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (searchQuery.trim()) {
      return visibleMessages.filter((m) => searchText(m.text, searchQuery));
    }
    return visibleMessages;
  }, [searchQuery, visibleMessages]);

  // Update search results when query or messages change
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = visibleMessages.filter((m) => searchText(m.text, searchQuery));
      setSearchResults(results);
      setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    }
  }, [searchQuery, visibleMessages]);

  // Scroll to current search result
  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults[currentSearchIndex]) {
      const messageId = searchResults[currentSearchIndex].id;
      const element = messageRefs.current[messageId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight briefly
        element.classList.add('ring-2', 'ring-yellow-400', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-yellow-400', 'ring-offset-2');
        }, 2000);
      }
    }
  }, [currentSearchIndex, searchResults]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle search navigation
  const handleSearchNavigate = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    if (direction === 'next') {
      setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
    } else {
      setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  };

  const selectedWorkspace = workspaces.find(w => w._id === selectedWs);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
        <p className="mt-2 text-gray-600">Secure end-to-end encrypted conversations</p>
      </div>

      {/* Workspace Selector */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Workspace Dropdown */}
          <div className="flex-1 min-w-[200px]">
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

          {/* Invite Code Display */}
          {selectedWorkspace?.inviteCode && (
            <div className="flex items-end">
              <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3">
                <div className="text-xs font-medium text-gray-600">Invite Code</div>
                <code className="text-lg font-bold text-indigo-600">{selectedWorkspace.inviteCode}</code>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-end">
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3">
              <span className={`relative flex h-2 w-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
                {connected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-sm font-medium text-gray-700">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          <form onSubmit={joinWorkspaceByCode} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-mono outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
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
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Create
            </button>
          </form>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex min-h-[65vh] md:h-[600px] flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
        {/* Chat Header */}
        {selectedWs && (
          <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedWorkspace?.name || 'Workspace'}</h3>
                <p className="text-xs text-gray-600">End-to-end encrypted • Messages are secure</p>
              </div>
              {filteredMessages.length !== visibleMessages.length && (
                <div className="text-xs text-indigo-600 font-medium">
                  {filteredMessages.length} of {visibleMessages.length} messages
                </div>
              )}
            </div>
            {/* Search Bar */}
            <SearchBar
              placeholder="Search messages..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              resultCount={searchResults.length}
              currentIndex={currentSearchIndex}
              onNavigate={handleSearchNavigate}
              showNavigation={searchQuery.trim().length > 0}
              className="mt-2"
            />
          </div>
        )}

        {/* Messages Area */}
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
          {!selectedWs && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl">
                  💬
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No workspace selected</h3>
                <p className="text-gray-500">Create or select a workspace to start messaging</p>
              </div>
            </div>
          )}
          {selectedWs && visibleMessages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-3xl">
                  👋
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No messages yet</h3>
                <p className="text-gray-500">Be the first to say hello!</p>
              </div>
            </div>
          )}
          {selectedWs && searchQuery.trim() && filteredMessages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                  🔍
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No results found</h3>
                <p className="text-gray-500">Try a different search term</p>
              </div>
            </div>
          )}
          {filteredMessages.map((m) => {
            const isHighlighted = searchResults[currentSearchIndex]?.id === m.id;
            const highlightedText = searchQuery.trim() 
              ? highlightText(m.text, searchQuery) 
              : m.text;
            
            return (
              <div
                key={m.id}
                ref={(el) => {
                  messageRefs.current[m.id] = el;
                }}
                className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'} transition-all ${
                  isHighlighted ? 'scale-105' : ''
                }`}
              >
                <div
                  className={`group max-w-[75%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] rounded-2xl px-4 py-3 shadow-lg transition-all hover:shadow-xl ${
                    m.author === 'me'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border-2 border-gray-200'
                  } ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                >
                  <p 
                    className="break-words whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  />
                  <p className={`mt-1 text-xs ${m.author === 'me' ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={selectedWs ? 'Type a message…' : 'Select a workspace first…'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!selectedWs || !connected}
              className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!connected || !text.trim() || !selectedWs}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;