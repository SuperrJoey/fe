import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import WorkspaceList from '../Workspace/WorkspaceList';
import ChatRoom from '../Chat/ChatRoom';
import FileVault from '../Files/FileVault';
import api from '../../services/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState<'workspaces' | 'chat' | 'files'>('workspaces');
  const [blockchainConnected, setBlockchainConnected] = useState(false);

  useEffect(() => {
    // Check blockchain status
    api.get('/audit/status')
      .then(({ data }) => {
        setBlockchainConnected(data.connected || false);
        if (data.connected) {
          console.log('[blockchain] connected to', data.network, 'at', data.address);
        } else {
          console.log('[blockchain] mock mode (not configured)');
        }
      })
      .catch(() => {
        setBlockchainConnected(false);
      });
  }, []);

  useEffect(() => {
    // Read tab from query params: ?tab=chat|files|workspaces
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'chat' || tab === 'files' || tab === 'workspaces') {
      setActiveTab(tab);
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Cryptalk
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                <span className={`relative flex h-2 w-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="font-medium text-gray-700">{connected ? 'Live' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full ${blockchainConnected ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                <span className="font-medium text-gray-700">Blockchain {blockchainConnected ? 'Active' : 'Mock'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">Welcome back</span>
                <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <nav className="w-64 border-r border-gray-200/80 bg-white/50 backdrop-blur-sm py-6">
          <div className="space-y-1 px-3">
            <button
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === 'workspaces'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('workspaces')}
            >
              <span className="text-xl">{activeTab === 'workspaces' ? '📁' : '📂'}</span>
              <span>Workspaces</span>
            </button>
            <button
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <span className="text-xl">{activeTab === 'chat' ? '💬' : '💭'}</span>
              <span>Messages</span>
            </button>
            <button
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === 'files'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('files')}
            >
              <span className="text-xl">{activeTab === 'files' ? '🔒' : '📦'}</span>
              <span>Files</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'workspaces' && (
              <div className="mx-auto max-w-7xl">
                <WorkspaceList />
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="mx-auto max-w-6xl">
                <ChatRoom />
              </div>
            )}
            {activeTab === 'files' && (
              <div className="mx-auto max-w-6xl">
                <FileVault />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;