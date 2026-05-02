import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Users, FileText, Settings, Ticket, LogOut, Menu, X, LayoutDashboard, Database, MessageSquare, Bell } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    if (user) {
      try {
        await addDoc(collection(db, 'logs'), {
          userId: user.uid,
          userEmail: user.email,
          action: 'logout',
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to log logout event", e);
      }
    }
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Logs', path: '/admin/logs', icon: Database },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Posts', path: '/admin/posts', icon: MessageSquare },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Support', path: '/admin/support', icon: Ticket },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col justify-between shrink-0 absolute md:relative z-50 h-full transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="text-xl font-bold text-red-500 tracking-tight">Avbora Admin</div>
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  location.pathname === item.path 
                    ? 'bg-red-900/30 text-red-500 font-medium border border-red-900/50' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <LayoutDashboard className="w-4 h-4" /> Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
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
             <div className="text-xl font-bold text-red-500 tracking-tight">Admin Panel</div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
