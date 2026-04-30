import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X } from 'lucide-react';

const availableFields = [
  'Programming', 'Design', 'Marketing', 'Writing', 'Other'
];

export default function Setup() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [level, setLevel] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter(s => s !== sk));
  };

  const handleFieldToggle = (field: string) => {
    if (skills.includes(field)) removeSkill(field);
    else setSkills([...skills, field]);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Please add at least one skill or field.');
      return;
    }
    if (!level) {
      setError('Please select your experience level.');
      return;
    }
    
    setSaving(true);
    setError('');
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        await setDoc(userRef, {
          skills,
          level,
          name: user.displayName || 'User',
          email: user.email || '',
          balance: 0,
          subscriptionPlan: 'Free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        await refreshProfile();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Complete your profile</h2>
          <p className="mt-2 text-gray-400">Tell us what you're good at so we can find the best opportunities for you.</p>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-900 text-center">{error}</div>}

        <form className="mt-8 space-y-8" onSubmit={handleSave}>
          
          <div className="space-y-4">
            <label className="text-lg font-medium text-white block">What are you good at?</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableFields.map(field => (
                <button
                  type="button"
                  key={field}
                  onClick={() => handleFieldToggle(field)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${skills.includes(field) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {field}
                </button>
              ))}
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Add specific skills (e.g., React, SEO, Copywriting)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="flex-1 px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 border border-gray-800 rounded-lg bg-gray-950/50">
                {skills.map(sk => (
                  <span key={sk} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                    {sk}
                    <button type="button" onClick={() => removeSkill(sk)} className="hover:text-blue-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-lg font-medium text-white block">Experience Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`py-3 px-2 text-sm sm:text-base break-words rounded-lg border font-medium transition-all ${
                    level === lvl 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
