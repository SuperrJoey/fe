import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Pricing: React.FC = () => {
    const { user } = useAuth();

    const plans = [
        {
          name: 'Free',
          price: '$0',
          period: 'forever',
          description: 'Perfect for small teams getting started',
          features: [
            'Up to 5 workspaces',
            '10GB encrypted storage',
            'End-to-end encryption',
            'Blockchain audit trail',
            'Community support'
          ],
          cta: user ? 'Current Plan' : 'Get Started',
          highlight: false
        },
        {
          name: 'Pro',
          price: '$9',
          period: 'per month',
          description: 'For growing teams and businesses',
          features: [
            'Unlimited workspaces',
            '100GB encrypted storage',
            'Priority support',
            'Advanced search',
            'Custom integrations',
            'Team management',
            '99.9% uptime SLA'
          ],
          cta: user ? 'Upgrade' : 'Start Free Trial',
          highlight: true
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          period: '',
          description: 'For large organizations with custom needs',
          features: [
            'Everything in Pro',
            'Unlimited storage',
            'Dedicated support',
            'Custom deployment',
            'SSO integration',
            'Advanced analytics',
            'Compliance certifications'
          ],
          cta: 'Contact Sales',
          highlight: false
        }
      ];

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the plan that's right for your team. All plans include end-to-end encryption and blockchain audit trails.
              </p>
            </div>
    
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border-2 p-8 bg-white shadow-lg transition-all hover:shadow-xl ${
                    plan.highlight
                      ? 'border-indigo-500 scale-105 relative'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                  </div>
    
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
    
                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className={`block w-full text-center rounded-xl px-6 py-3 font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
    
            <div className="mt-16 text-center">
              <p className="text-gray-600 mb-4">All plans include:</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  AES-256 Encryption
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Blockchain Audit Trail
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Zero-Knowledge Architecture
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  30-day Money Back Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default Pricing;