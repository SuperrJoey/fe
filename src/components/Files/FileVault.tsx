import React from 'react';

const FileVault: React.FC = () => {
	return (
		<div>
			<h2 className="mb-5 text-xl font-semibold text-gray-800">Secure File Vault</h2>

			<div className="rounded-lg border bg-white p-5 shadow-sm">
				<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
					<p className="text-sm text-gray-600">Upload and share encrypted files</p>
					<p className="text-xs text-gray-500">All files are encrypted with AES‑256</p>
					<button className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
						Upload Files
					</button>
				</div>

				<h3 className="mt-6 text-base font-semibold text-gray-800">Recent Files</h3>
				<ul className="mt-3 divide-y rounded-md border">
					<li className="flex items-center justify-between px-3 py-2">
						<span className="text-sm text-gray-700">requirements.pdf</span>
						<button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
							Download
						</button>
					</li>
					<li className="flex items-center justify-between px-3 py-2">
						<span className="text-sm text-gray-700">architecture.png</span>
						<button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
							Download
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default FileVault;