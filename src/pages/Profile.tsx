import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings as SettingsIcon, CreditCard, Bell, Loader2, Globe } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const { isAR } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');

  const t = {
    title: isAR ? 'حسابي' : 'My Account',
    profile: isAR ? 'الملف الشخصي' : 'Profile',
    settings: isAR ? 'الإعدادات' : 'Settings',
    subscription: isAR ? 'الاشتراك' : 'Subscription',
    notifications: isAR ? 'التنبيهات' : 'Notifications',
  };

  const navItems = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
    { id: 'subscription', label: t.subscription, icon: CreditCard },
    { id: 'notifications', label: t.notifications, icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && <ProfileInfoTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'subscription' && <SubscriptionTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileInfoTab() {
  const { profile, user, refreshProfile } = useAuth();
  const { isAR } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    country: '',
    age: '',
  });

  const t = {
    title: isAR ? 'المعلومات الشخصية' : 'Personal Information',
    editBtn: isAR ? 'تعديل الملف' : 'Edit Profile',
    fullName: isAR ? 'الاسم الكامل' : 'Full Name',
    email: isAR ? 'البريد الإلكتروني' : 'Email',
    phone: isAR ? 'رقم الهاتف' : 'Phone Number',
    country: isAR ? 'الدولة' : 'Country',
    age: isAR ? 'العمر' : 'Age',
    cancel: isAR ? 'إلغاء' : 'Cancel',
    save: isAR ? 'حفظ التغييرات' : 'Save Changes',
    notSet: isAR ? 'غير محدد' : 'Not set',
    level: isAR ? 'المستوى' : 'Level',
    balance: isAR ? 'الرصيد' : 'Balance',
    skills: isAR ? 'المهارات' : 'Skills',
    noSkills: isAR ? 'لا توجد مهارات مضافة.' : 'No skills added yet.',
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        age: profile.age ? profile.age.toString() : '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        country: formData.country,
        age: parseInt(formData.age) || 0,
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t.title}</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
            >
              {t.editBtn}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.fullName}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white outline-none focus:border-blue-500" 
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.email}</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.phone}</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.country}</label>
                <input 
                  type="text" 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.age}</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white outline-none focus:border-blue-500" 
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition"
              >
                {t.cancel}
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-950 rounded-lg text-sm font-bold transition flex items-center justify-center min-w-[100px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.fullName}</label>
              <div className="text-white font-medium">{profile?.name || t.notSet}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.email}</label>
              <div className="text-white font-medium">{user?.email}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.phone}</label>
              <div className="text-white font-medium">{profile?.phone || t.notSet}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.country}</label>
              <div className="text-white font-medium">{profile?.country || t.notSet}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.age}</label>
              <div className="text-white font-medium">{profile?.age ? profile.age : t.notSet}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.level}</label>
              <div className="text-white font-medium">{profile?.level || t.notSet}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.balance}</label>
              <div className="text-emerald-400 font-black text-xl">${profile?.balance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">{t.skills}</h2>
        <div className="flex flex-wrap gap-2">
          {profile?.skills.map(sk => (
            <span key={sk} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
              {sk}
            </span>
          ))}
          {(!profile?.skills || profile.skills.length === 0) && (
            <span className="text-gray-500 text-sm">{t.noSkills}</span>
          )}
        </div>
      </div>
    </>
  )
}

function SettingsTab() {
  const { language, setLanguage, isAR } = useLanguage();
  const t = {
    title: isAR ? 'إعدادات الحساب' : 'Account Settings',
    language: isAR ? 'لغة التطبيق' : 'App Language',
    languageDesc: isAR ? 'اختر اللغة المفضلة لواجهة المستخدم.' : 'Choose your preferred language for the user interface.',
    changePass: isAR ? 'تغيير كلمة المرور' : 'Change Password',
    passDesc: isAR ? 'سنرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' : 'We will send a password reset link to your email address.',
    sendBtn: isAR ? 'إرسال البريد' : 'Send Reset Email',
    danger: isAR ? 'منطقة الخطر' : 'Danger Zone',
    deleteDesc: isAR ? 'بمجرد حذف حسابك، لا يمكنك التراجع. يرجى التأكد.' : 'Once you delete your account, there is no going back. Please be certain.',
    deleteBtn: isAR ? 'حذف الحساب' : 'Delete Account',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">{t.title}</h2>
      <div className="space-y-8">
        {/* Language Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">{t.language}</h3>
          <p className="text-xs text-gray-500 mb-4">{t.languageDesc}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('AR')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                language === 'AR'
                  ? 'bg-blue-600 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage('EN')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                language === 'EN'
                  ? 'bg-blue-600 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-300 mb-2">{t.changePass}</h3>
          <p className="text-xs text-gray-500 mb-4">{t.passDesc}</p>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition border border-gray-700">
            {t.sendBtn}
          </button>
        </div>
        <div className="pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-red-500 mb-2">{t.danger}</h3>
          <p className="text-xs text-gray-500 mb-4">{t.deleteDesc}</p>
          <button className="px-4 py-2 bg-red-900/10 hover:bg-red-900/20 text-red-500 border border-red-900/30 rounded-lg text-sm font-medium transition">
            {t.deleteBtn}
          </button>
        </div>
      </div>
    </div>
  )
}

function SubscriptionTab() {
  const { profile } = useAuth();
  const { isAR } = useLanguage();

  const t = {
    title: isAR ? 'الاشتراك والفواتير' : 'Subscription & Billing',
    currentPlan: isAR ? 'الباقة الحالية' : 'Current Plan',
    planDesc: isAR ? `أنت حالياً مشترك في باقة ${profile?.subscriptionPlan || (isAR ? 'المجانية' : 'Free')}.` : `You are currently on the ${profile?.subscriptionPlan || 'Free'} plan.`,
    upgrade: isAR ? 'الترقية إلى برو' : 'Upgrade to Pro',
    upgradeDesc: isAR ? 'احصل على وصول كامل لجميع الفرص، وتواقق كامل مع الذكاء الاصطناعي.' : 'Get full access to all opportunities, priority matching, and AI career tools.',
    viewPlans: isAR ? 'عرض الخطط' : 'View Plans',
    free: isAR ? 'مجانية' : 'Free',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">{t.title}</h2>
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 font-medium">{t.currentPlan}</span>
          <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {profile?.subscriptionPlan || t.free}
          </span>
        </div>
        <p className="text-sm text-gray-500">{t.planDesc}</p>
      </div>
      
      {(!profile?.subscriptionPlan || profile.subscriptionPlan === 'Free') && (
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-5">
          <h3 className="text-white font-bold mb-2">{t.upgrade}</h3>
          <p className="text-gray-400 text-sm mb-4">{t.upgradeDesc}</p>
          <Link to="/pricing" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-gray-950 font-bold rounded-lg text-sm transition">
            {t.viewPlans}
          </Link>
        </div>
      )}
    </div>
  )
}

function NotificationsTab() {
  const { isAR } = useLanguage();
  const t = {
    title: isAR ? 'تفضيلات التنبيهات' : 'Notification Preferences',
  };

  const notificationOptions = [
    { title: isAR ? 'مقالات جديدة' : 'New Article Notifications', desc: isAR ? 'تنبيه عند اكتمال توليد مقال بالذكاء الاصطناعي.' : 'Get notified when an AI article is generated.', default: true },
    { title: isAR ? 'تنبيهات المدونة' : 'Blog Alerts', desc: isAR ? 'تنبيهات حالة الربط مع بلوجر.' : 'Receive updates about your Blogger connection status.', default: true },
    { title: isAR ? 'تحديثات النظام' : 'System Updates', desc: isAR ? 'تحديثات حول الميزات الجديدة.' : 'Learn about new features and improvements.', default: true },
    { title: isAR ? 'رسائل إخبارية' : 'Newsletter', desc: isAR ? 'نصائح حول زيادة الزيارات وتطوير السيو.' : 'Get tips on growth and SEO strategy.', default: false },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">{t.title}</h2>
      <div className="space-y-4">
        {notificationOptions.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium text-sm">{item.title}</div>
              <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
