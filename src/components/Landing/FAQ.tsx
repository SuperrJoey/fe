import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does end-to-end encryption work?',
      answer: 'All messages and files are encrypted on your device using AES-256-GCM before being sent. The encryption keys are derived from your workspace invite code and never leave your browser. Only members with the workspace key can decrypt the content.'
    },
    {
      question: 'What is the blockchain used for?',
      answer: 'We use Polygon blockchain to store SHA-256 hashes of your messages and files. This creates an immutable audit trail that proves data integrity and provides tamper-proof verification. The blockchain only stores hashes, never your actual data.'
    },
    {
      question: 'Can I search my encrypted messages?',
      answer: 'Yes! Search happens entirely on your device. Messages are decrypted locally, and you can search through them without sending any plaintext to our servers. This maintains your privacy while providing powerful search capabilities.'
    },
    {
      question: 'What happens if I lose my workspace invite code?',
      answer: 'The workspace owner can generate a new invite code. However, you\'ll need to re-join the workspace with the new code. We recommend securely storing your invite codes as they\'re essential for accessing encrypted content.'
    },
    {
      question: 'Is my data stored securely?',
      answer: 'Yes. All data is encrypted at rest in MongoDB using the same AES-256 encryption. Even if someone gains access to our database, they can only see encrypted ciphertext, not your actual messages or files.'
    },
    {
      question: 'How do I add team members?',
      answer: 'Share your workspace invite code with team members. They can join by entering the code in the workspace section. Once joined, they\'ll have access to all encrypted messages and files in that workspace.'
    },
    {
      question: 'Can I use Cryptalk for compliance requirements?',
      answer: 'Yes. Our blockchain audit trails provide immutable proof of data existence and integrity, which can help with compliance requirements like GDPR, SOC2, and HIPAA. However, you should consult with your compliance team for specific requirements.'
    },
    {
      question: 'What file types can I upload?',
      answer: 'You can upload any file type. All files are encrypted before upload and stored securely in MongoDB GridFS. There\'s a 50MB size limit per file to ensure optimal performance.'
    }
  ];

  return (
    <section id="faq" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Cryptalk
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-indigo-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-indigo-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:support@cryptalk.com"
            className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;