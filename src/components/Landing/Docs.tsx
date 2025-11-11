import React from 'react';

const Docs: React.FC = () => {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start Guide', desc: 'Set up your first workspace in minutes' },
        { title: 'Creating Workspaces', desc: 'Learn how to create and manage workspaces' },
        { title: 'Inviting Team Members', desc: 'Add team members using invite codes' }
      ]
    },
    {
      title: 'Security',
      items: [
        { title: 'Encryption Overview', desc: 'How end-to-end encryption works' },
        { title: 'Key Management', desc: 'Understanding workspace keys and key derivation' },
        { title: 'Blockchain Audit Trails', desc: 'How blockchain verification works' },
        { title: 'Best Practices', desc: 'Security recommendations for your team' }
      ]
    },
    {
      title: 'Features',
      items: [
        { title: 'Messaging', desc: 'Send encrypted messages in real-time' },
        { title: 'File Vault', desc: 'Store and share encrypted files securely' },
        { title: 'Search', desc: 'Search through your encrypted messages locally' },
        { title: 'Workspace Management', desc: 'Organize your team communications' }
      ]
    },
    {
      title: 'API & Integration',
      items: [
        { title: 'REST API', desc: 'Integrate Cryptalk with your applications' },
        { title: 'Webhooks', desc: 'Receive real-time events via webhooks' },
        { title: 'SDKs', desc: 'Official SDKs for popular languages' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about using Cryptalk securely
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Check our FAQ or contact support.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#faq" className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all">
                View FAQ
              </a>
              <a href="mailto:support@cryptalk.com" className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;