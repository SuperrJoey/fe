import React from 'react';

const ChatRoom: React.FC = () => {
  return (
    <div className="chat-room">
      <h2>Messages</h2>
      <div className="chat-placeholder">
        <p>Select a workspace to start messaging</p>
        <p>All messages are end-to-end encrypted</p>
      </div>
    </div>
  );
};

export default ChatRoom;