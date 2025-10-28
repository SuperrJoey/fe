import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import WorkspaceList from '../Workspace/WorkspaceList';
import ChatRoom from '../Chat/ChatRoom';
import FileVault from '../Files/FileVault';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState<'workspaces' | 'chat' | 'files'>('workspaces');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex h-14 items-center justify-between border-b bg-white px-5">
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-xl font-semibold text-indigo-600">Cryptalk</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-52 border-r bg-white py-5">
          <button
            className={`block w-full px-5 py-3 text-left text-sm transition ${
              activeTab === 'workspaces'
                ? 'bg-indigo-600 font-medium text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('workspaces')}
          >
            Workspaces
          </button>
          <button
            className={`block w-full px-5 py-3 text-left text-sm transition ${
              activeTab === 'chat'
                ? 'bg-indigo-600 font-medium text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Messages
          </button>
          <button
            className={`block w-full px-5 py-3 text-left text-sm transition ${
              activeTab === 'files'
                ? 'bg-indigo-600 font-medium text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto p-5">
          {activeTab === 'workspaces' && (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <WorkspaceList />
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <ChatRoom />
            </div>
          )}
          {activeTab === 'files' && (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <FileVault />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;