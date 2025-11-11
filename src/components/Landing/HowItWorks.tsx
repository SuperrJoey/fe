import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
	{
		num: '01',
		title: 'Client‑side key generation',
		desc: 'Your browser generates AES keys per workspace and an RSA key pair per user. Keys never leave your device unencrypted.',
		badges: ['AES‑256', 'RSA‑2048']
	},
	{
		num: '02',
		title: 'End‑to‑end encryption',
		desc: 'Messages and files are encrypted locally before sending. The server stores ciphertext only.',
		badges: ['Zero‑knowledge', 'Forward secrecy (rotating keys)']
	},
	{
		num: '03',
		title: 'Secure file vault',
		desc: 'Encrypted files are stored in MongoDB GridFS. Access control ensures only authorized members can decrypt.',
		badges: ['GridFS', 'Access control']
	},
	{
		num: '04',
		title: 'Tamper‑proof audit trail',
		desc: 'SHA‑256 hashes of messages/files are anchored on Polygon for immutable verification and dispute resolution.',
		badges: ['SHA‑256', 'Polygon']
	}
];

const arch = [
	{ label: 'Browser', items: ['React + TypeScript', 'AES/RSA crypto', 'Local search'] },
	{ label: 'API', items: ['Node.js + Express', 'JWT auth', 'Socket.io'] },
	{ label: 'Storage', items: ['MongoDB + GridFS', 'Ciphertext only'] },
	{ label: 'Audit', items: ['SHA‑256 hash', 'Polygon anchor'] },
];

const HowItWorks: React.FC = () => {
	return (
		<section id="how-it-works" className="px-6 py-16 scroll-mt-20">
			<div className="mx-auto max-w-7xl">
				<div className="mb-12 text-center">
					<h2 className="text-4xl font-bold text-indigo-50 mb-4">How It Works</h2>
					<p className="mx-auto max-w-2xl text-lg text-indigo-200/80">
						Privacy by design. Cryptalk keeps plaintext on your device and uses blockchain only for verification metadata.
					</p>
				</div>

				{/* Features Grid - Quick Overview */}
				<div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{[
						{ icon:"🔐", title:"End‑to‑End Encrypted Chat", desc:"Messages are encrypted on your device using AES‑256. Keys never leave your browser."},
						{ icon:"🗂️", title:"Secure File Vault", desc:"Files are encrypted before upload and stored in GridFS. Access is strictly controlled."},
						{ icon:"⛓️", title:"Blockchain Verification", desc:"SHA‑256 hashes anchored on Polygon provide tamper‑proof audit trails for messages and files."},
						{ icon:"🕵️", title:"Private Search", desc:"Search locally over decrypted content — plaintext never touches the server."}
					].map((f) => (
						<div key={f.title} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl">
							<div className="mb-4 text-3xl">{f.icon}</div>
							<h3 className="mb-2 text-lg font-semibold text-indigo-50">{f.title}</h3>
							<p className="text-sm leading-relaxed text-indigo-200/80">{f.desc}</p>
						</div>
					))}
				</div>

				{/* Detailed Steps Timeline */}
				<div className="mb-12">
					<h3 className="mb-8 text-center text-2xl font-bold text-indigo-50">Security Architecture</h3>
					<div className="relative mx-auto max-w-4xl">
						{/* Connecting line */}
						<div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-indigo-500/30 via-purple-500/30 to-transparent hidden md:block"></div>
						<ol className="relative space-y-6">
							{steps.map((s, index) => (
								<li key={s.num} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl">
									<div className="flex items-start gap-6">
										<div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg ring-4 ring-[#0b1020]">
											{s.num}
										</div>
										<div className="flex-1">
											<h3 className="mb-2 text-xl font-semibold text-indigo-50">{s.title}</h3>
											<p className="mb-4 text-sm leading-relaxed text-indigo-200/80">{s.desc}</p>
											<div className="flex flex-wrap gap-2">
												{s.badges.map((b) => (
													<span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200/80">
														{b}
													</span>
												))}
											</div>
										</div>
									</div>
								</li>
							))}
						</ol>
					</div>
				</div>

				{/* Architecture snapshot */}
				<div className="mx-auto mb-12 max-w-5xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8 shadow-xl">
					<h3 className="mb-6 text-center text-xl font-semibold text-indigo-50">Technical Architecture</h3>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{arch.map((col) => (
							<div key={col.label} className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]">
								<div className="mb-3 text-sm font-semibold text-indigo-50">{col.label}</div>
								<ul className="space-y-2">
									{col.items.map((it) => (
										<li key={it} className="flex items-center gap-2 text-xs text-indigo-200/80">
											<span className="h-1.5 w-1.5 rounded-full bg-indigo-400/50"></span>
											<span>{it}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

          {/* CTA */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-cyan-300/10 p-8 text-center shadow-xl">
            <h3 className="mb-3 text-2xl font-bold text-indigo-50">Ready to Get Started?</h3>
            <p className="mb-6 text-sm text-indigo-200/80">
              Create your secure workspace and start collaborating with end-to-end encryption and blockchain audit trails.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
              >
                <span>🚀</span>
                <span>Start a secure workspace</span>
              </Link>
              <Link 
                to="/faq" 
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-indigo-50 transition-all hover:border-white/30 hover:bg-white/10"
              >
                <span>View FAQ</span>
              </Link>
            </div>
          </div>
			</div>
		</section>
	);
};

export default HowItWorks;