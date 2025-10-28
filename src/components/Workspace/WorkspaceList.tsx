import React from 'react';

const WorkspaceList: React.FC = () => {
  return (
    <div className="workspace-list">
      <h2>Your Workspaces</h2>
      <div className="workspace-grid">
        <div className="workspace-card">
          <h3>General</h3>
          <p>Main workspace for team communication</p>
          <button className="join-button">Join</button>
        </div>
        <div className="workspace-card">
          <h3>Project Alpha</h3>
          <p>Secure project discussions</p>
          <button className="join-button">Join</button>
        </div>
        <div className="workspace-card create-new">
          <h3>+ Create New Workspace</h3>
          <p>Start a new secure collaboration space</p>
          <button className="create-button">Create</button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceList;