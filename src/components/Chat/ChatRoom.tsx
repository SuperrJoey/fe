import React from 'react';

const ChatRoom: React.FC = () => {
	return (
		<div>
			<h2 className="mb-5 text-xl font-semibold text-gray-800">Messages</h2>

			<div className="flex h-[520px] flex-col overflow-hidden rounded-lg border bg-white">
				<div className="flex-1 space-y-3 overflow-y-auto p-4">
					<div className="mr-auto max-w-[75%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800">
						Select a workspace to start messaging.
					</div>
					<div className="ml-auto max-w-[75%] rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
						All messages are end‑to‑end encrypted.
					</div>
				</div>

				<form className="flex items-center gap-2 border-t p-3">
					<input
						type="text"
						placeholder="Type a message…"
						className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
					<button
						type="submit"
						className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
};

export default ChatRoom;