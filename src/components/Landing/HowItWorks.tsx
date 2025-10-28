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
		<section id="how-it-works" className="px-6 py-12">
			<h2 className="text-center text-2xl font-bold text-indigo-50">How it works</h2>
			<p className="mx-auto mt-2 max-w-2xl text-center text-sm text-indigo-200/80">
				Privacy by design. Cryptalk keeps plaintext on your device and uses blockchain only for verification metadata.
			</p>

			{/* Timeline */}
			<ol className="mx-auto mt-8 max-w-4xl space-y-4">
				{steps.map((s) => (
					<li key={s.num} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5">
						<div className="flex items-start gap-4">
							<div className="rounded-xl bg-indigo-600/90 px-3 py-1 text-sm font-semibold text-white">{s.num}</div>
							<div className="flex-1">
								<h3 className="text-base font-semibold text-indigo-50">{s.title}</h3>
								<p className="mt-1 text-sm leading-relaxed text-indigo-200/80">{s.desc}</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{s.badges.map((b) => (
										<span key={b} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-indigo-200/80">{b}</span>
									))}
								</div>
							</div>
						</div>
					</li>
				))}
			</ol>

			{/* Architecture snapshot */}
			<div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
				<h3 className="text-sm font-semibold text-indigo-50">Architecture</h3>
				<div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					{arch.map((col) => (
						<div key={col.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
							<div className="text-xs font-medium text-indigo-200/80">{col.label}</div>
							<ul className="mt-2 space-y-1">
								{col.items.map((it) => (
									<li key={it} className="text-xs text-indigo-200/80">• {it}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			{/* CTA */}
			<div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-400/20 to-cyan-300/10 p-6 text-center">
				<p className="text-sm text-indigo-200/80">
					Want the details? Read our security notes on key exchange, rotation, and audit proofs.
				</p>
				<div className="mt-4 flex justify-center gap-3">
					<Link to="/register" className="inline-flex items-center rounded-xl border border-transparent bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600">
						Start a secure workspace
					</Link>
					<a href="#faq" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-indigo-50 hover:border-white/30">
						View FAQ
					</a>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;