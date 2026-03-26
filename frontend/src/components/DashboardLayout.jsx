import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LayoutDashboard, Box, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Containers', path: '/containers', icon: Box },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-700/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
          <Layers className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-xl font-bold text-white tracking-tight">DockStack</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="text-sm truncate pr-2 text-slate-300">
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto">
        {/* Top Navbar for Mobile */}
        <header className="h-16 glass-panel border-b border-slate-700/50 flex items-center justify-between px-6 md:hidden sticky top-0 z-50">
          <div className="flex items-center">
            <Layers className="w-6 h-6 text-blue-500 mr-2" />
            <span className="font-bold text-white">DockStack</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
