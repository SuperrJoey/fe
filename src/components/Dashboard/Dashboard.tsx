import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import WorkspaceList from '../../components/Workspace/WorkspaceList';
import ChatRoom from '../../components/Chat/ChatRoom';
import FileVault from '../../components/Files/FileVault';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState('workspaces');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Cryptalk</h1>
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={`nav-button ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspaces')}
          >
            Workspaces
          </button>
          <button 
            className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Messages
          </button>
          <button 
            className={`nav-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'workspaces' && <WorkspaceList />}
          {activeTab === 'chat' && <ChatRoom />}
          {activeTab === 'files' && <FileVault />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;