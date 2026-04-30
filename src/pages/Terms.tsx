import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
        
        <div className="space-y-8 text-gray-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. General Usage</h2>
            <p>
              By accessing and using Avbora, you agree to comply with the following terms and conditions. Our platform aggregates third-party opportunities and utilizes AI to provide recommendations. We do not guarantee employment, scholarship awards, or marketplace sales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Privacy Policy</h2>
            <p>
              Your privacy is important to us. We securely store your profile information, skills, and preferences to improve AI recommendations. We do not sell your personal data to third parties without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Subscriptions</h2>
            <p>
              Avbora offers Free and Pro subscription tiers. Pro accounts provide enhanced AI processing, prioritized opportunity matching, and full access to premium listings. Subscriptions are billed on a recurring basis and can be canceled at any time.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
