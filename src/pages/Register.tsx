import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

import { serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      const adminEmails = ['av6ora@gmail.com', 'contact@avbora.online'];
      const role = adminEmails.includes(formData.email.toLowerCase()) ? 'admin' : 'user';

      // Handle firestore rules error properly
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        age: parseInt(formData.age) || 0,
        createdAt: serverTimestamp(),
        level: '',
        skills: [],
        subscriptionPlan: 'Free',
        role: role
      });
      navigate('/setup');
    } catch (err: any) {
      if (err.code?.includes('permission-denied') || err.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, `users/${formData.email}`);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else {
        setError(err.message || 'Failed to register');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const adminEmails = ['av6ora@gmail.com', 'contact@avbora.online'];
        const role = adminEmails.includes(user.email?.toLowerCase() || '') ? 'admin' : 'user';

        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          country: '',
          age: 0,
          createdAt: serverTimestamp(),
          level: '',
          skills: [],
          subscriptionPlan: 'Free',
          role: role
        });
        navigate('/setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.code?.includes('permission-denied') || err.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, `users`);
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-gray-400">Join Avbora today</p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          {error && <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-900">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <input type="text" required className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-300">Email address</label>
                <input type="email" required className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <input type="password" required className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Phone</label>
                <input type="tel" className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Age</label>
                <input type="number" className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-300">Country</label>
                <input type="text" className="mt-1 block w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
              </div>
              
              <div className="col-span-2 flex items-center mt-2">
                <input type="checkbox" required className="mr-2 h-4 w-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-blue-500 focus:ring-opacity-50" />
                <label className="text-sm text-gray-400">
                  I agree to the <Link to="/terms" className="text-blue-500 hover:text-blue-400">Terms & Conditions</Link>
                </label>
              </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-white text-gray-900 hover:bg-gray-50 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
        </div>

        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
