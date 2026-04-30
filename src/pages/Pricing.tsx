import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-24 px-4">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose the plan that fits your career goals. Upgrade anytime for advanced AI features.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
          <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
          <p className="text-gray-400 mb-6">Essential features to get you started.</p>
          <div className="text-4xl font-bold text-white mb-8">$0
            <span className="text-lg text-gray-500 font-normal">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-gray-500" /> Limited job access
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-gray-500" /> Basic recommendations
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-gray-500" /> Community access
            </li>
          </ul>

          <Link to="/register" className="w-full block text-center py-3 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition">
            Get Started Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-900 border border-blue-500/50 shadow-[0_0_30px_rgba(45,212,191,0.1)] rounded-2xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Recommended
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
          <p className="text-gray-400 mb-6">Supercharge your opportunity discovery with AI.</p>
          <div className="text-4xl font-bold text-blue-500 mb-8">$10
            <span className="text-lg text-gray-500 font-normal">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-blue-500" /> Full access to jobs & projects
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-blue-500" /> Real-time scholarship alerts
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-blue-500" /> AI-powered cover letter generation
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-blue-500" /> Priority matching
            </li>
          </ul>

          <Link to="/register" className="w-full block text-center py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-gray-950 font-bold transition">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
