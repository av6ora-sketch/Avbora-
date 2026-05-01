import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Menu, X, Globe, Activity } from 'lucide-react';

export default function AppLayout() {
  const { profile, user } = useAuth();
  const { language, setLanguage, isAR } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || user?.email === 'contact@avbora.online' || user?.email === 'av6ora@gmail.com';

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const t = {
    dashboard: isAR ? 'لوحة التحكم' : 'Dashboard',
    articles: isAR ? 'المقالات' : 'Articles',
    media: isAR ? 'مكتبة الميديا' : 'Media Library',
    settings: isAR ? 'الإعدادات' : 'Settings',
    support: isAR ? 'الدعم الفني' : 'Support',
    adminDashboard: isAR ? 'لوحة المسؤول' : 'Admin Dashboard',
    profileSettings: isAR ? 'الملف الشخصي' : 'Profile & Settings',
    logout: isAR ? 'تسجيل الخروج' : 'Logout',
    aiActive: isAR ? 'تحليل الذكاء الاصطناعي نشط' : 'AI Analysis Active',
  };

  const navItems = [
    { name: t.dashboard, path: '/dashboard' },
    { name: t.articles, path: '/articles' },
    { name: t.media, path: '/media' },
    { name: t.settings, path: '/blog-settings' },
    { name: t.support, path: '/support' },
  ];

  return (
    <div 
      className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden relative" 
      dir={isAR ? 'rtl' : 'ltr'}
    >
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-gray-900 border-gray-800 p-6 flex flex-col justify-between shrink-0 absolute md:relative z-50 h-full transition-transform duration-300 md:translate-x-0 ${isAR ? 'border-l' : 'border-r'} ${
          isSidebarOpen ? 'translate-x-0' : (isAR ? 'translate-x-full' : '-translate-x-full')
        } ${isAR ? 'right-0' : 'left-0'}`}
      >
        <div>
          <div className="flex justify-between items-center mb-12">
            <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-bold text-blue-500 tracking-tight">
              <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
              <span>Avbora</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  location.pathname === item.path 
                    ? 'bg-gray-800 text-white font-medium' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${isAR ? 'text-right' : 'text-left'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-2">
          {isAdmin && (
            <Link
              to="/admin/users"
              onClick={() => setIsSidebarOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition font-medium`}
            >
              {t.adminDashboard}
            </Link>
          )}
          <Link
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              location.pathname === '/profile' 
                ? 'bg-gray-800 text-white font-medium' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {t.profileSettings}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-950 w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white">
               <Menu className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-2 text-xl font-bold text-blue-500 tracking-tight">
               <Activity className="w-6 h-6 text-blue-400" />
               <span>Avbora</span>
             </div>
           </div>
           <button onClick={handleLogout} className="text-gray-400">
             <LogOut className="w-5 h-5" />
           </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative flex flex-col">
          <header className="hidden md:flex justify-end items-center mb-8 gap-4">
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-xs font-medium text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(45,212,191,1)]" />
                {t.aiActive}
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-gray-950 font-bold text-lg cursor-pointer">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
