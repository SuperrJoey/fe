import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type Workspace = { _id: string; name: string; inviteCode?: string; ownerId?: string; createdAt?: string };

const WorkspaceList: React.FC = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWsName, setNewWsName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const { data } = await api.get<Workspace[]>('/workspaces');
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const { data } = await api.post<Workspace>('/workspaces', { name: newWsName.trim() });
      setWorkspaces([data, ...workspaces]);
      setNewWsName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const joinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const { data } = await api.post<Workspace>('/workspaces/join', { code: joinCode.trim().toUpperCase() });
      setWorkspaces([data, ...workspaces.filter(w => w._id !== data._id)]);
      setJoinCode('');
      setShowJoinForm(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join workspace');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Invite code copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Your Workspaces</h2>
        <p className="mt-2 text-gray-600">Manage your secure collaboration spaces</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setShowJoinForm(false); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
        >
          <span>✨</span>
          <span>Create Workspace</span>
        </button>
        <button
          onClick={() => { setShowJoinForm(!showJoinForm); setShowCreateForm(false); }}
          className="flex items-center gap-2 rounded-xl border-2 border-indigo-300 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:scale-105"
        >
          <span>🔗</span>
          <span>Join Workspace</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg">
          <form onSubmit={createWorkspace} className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Workspace name"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              className="flex-1 rounded-xl border-2 border-indigo-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Join Form */}
      {showJoinForm && (
        <div className="mb-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
          <form onSubmit={joinWorkspace} className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Workspaces Grid */}
      {workspaces.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl">
            📁
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">No workspaces yet</h3>
          <p className="text-gray-500">Create your first workspace to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-indigo-300 hover:shadow-xl hover:scale-105"
            >
              {/* Workspace Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-2xl shadow-lg">
                {workspace.name.charAt(0).toUpperCase()}
              </div>

              {/* Workspace Info */}
              <h3 className="mb-2 text-xl font-bold text-gray-900">{workspace.name}</h3>
              <p className="mb-4 text-sm text-gray-600">
                {workspace.ownerId === user?.id ? 'Owner' : 'Member'} • Created {workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : 'recently'}
              </p>

              {/* Invite Code */}
              {workspace.inviteCode && (
                <div className="mb-4 rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 text-xs font-medium text-gray-500">Invite Code</div>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm font-bold text-indigo-600">{workspace.inviteCode}</code>
                    <button
                      onClick={() => copyInviteCode(workspace.inviteCode!)}
                      className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.location.href = `/dashboard?tab=chat&ws=${workspace._id}`;
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
