import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users2, 
  UserCircle2, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { name: 'User Management', href: '/users', icon: Users2, roles: ['admin'] },
    { name: 'My Profile', href: '/profile', icon: UserCircle2, roles: ['admin', 'user'] },
  ].filter(item => item.roles.includes(user?.role));

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">Userly</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-full sm:w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col px-4 py-8">
          <div className="hidden md:flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Userly</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group",
                  isActive(item.href)
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive(item.href) ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="pt-10 mt-auto border-t border-slate-100">
            <div className="px-4 mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Identity</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black border-2 border-white shadow-xl">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium truncate uppercase tracking-tighter opacity-80">{user?.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
