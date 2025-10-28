import React from 'react';

const WorkspaceList: React.FC = () => {
	return (
		<div>
			<h2 className="mb-5 text-xl font-semibold text-gray-800">Your Workspaces</h2>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<h3 className="text-lg font-semibold text-gray-800">General</h3>
					<p className="mt-1 text-sm text-gray-600">Main workspace for team communication</p>
					<button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
						Join
					</button>
				</div>

				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<h3 className="text-lg font-semibold text-gray-800">Project Alpha</h3>
					<p className="mt-1 text-sm text-gray-600">Secure project discussions</p>
					<button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
						Join
					</button>
				</div>

				<div className="rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 p-4 shadow-sm">
					<h3 className="text-lg font-semibold text-gray-800">+ Create New Workspace</h3>
					<p className="mt-1 text-sm text-gray-600">Start a new secure collaboration space</p>
					<button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default WorkspaceList;