import { Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useState } from 'react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Pricing() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

  const handlePaymentSuccess = async (details: any) => {
    if (!user) return;
    setIsProcessing(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscriptionPlan: 'Pro',
        updatedAt: new Date().toISOString()
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating subscription:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      setError('Payment successful, but failed to update your account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
      <div className="min-h-screen bg-gray-950 text-gray-200 py-24 px-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your career goals. Upgrade anytime for advanced AI features.
          </p>
          {error && (
            <div className="mt-8 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg max-w-md mx-auto italic">
              {error}
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 pb-12">
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

            {profile?.subscriptionPlan === 'Free' ? (
              <div className="w-full text-center py-3 px-6 rounded-lg bg-gray-800/50 text-gray-400 font-medium border border-gray-700">
                Current Plan
              </div>
            ) : (
              <Link to="/register" className="w-full block text-center py-3 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition">
                Get Started Free
              </Link>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-gray-900 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)] rounded-2xl p-8 flex flex-col relative overflow-hidden">
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

            {isProcessing ? (
              <div className="flex items-center justify-center py-4 text-blue-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : profile?.subscriptionPlan === 'Pro' ? (
              <div className="w-full text-center py-3 px-6 rounded-lg bg-blue-900/30 text-blue-400 font-bold border border-blue-700">
                Your Current Plan
              </div>
            ) : user ? (
              <div className="mt-4 relative z-10">
                <PayPalButtons
                  style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          description: "Avbora Pro Monthly Subscription",
                          amount: {
                            currency_code: "USD",
                            value: "10.00",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order!.capture().then((details) => {
                      handlePaymentSuccess(details);
                    });
                  }}
                  onError={(err) => {
                    console.error('PayPal Error:', err);
                    setError('Something went wrong with the payment. Please try again.');
                  }}
                />
              </div>
            ) : (
              <Link to="/register" className="w-full block text-center py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-gray-950 font-bold transition">
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
