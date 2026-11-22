import { Link, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Moon, ShoppingBag, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { getMe } from '../api/auth';

interface Me {
  firstName: string;
  lastName: string;
  image?: string;
}

export default function Layout() {
  const { logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const queryClient = useQueryClient();

  const { data: me } = useQuery<Me>({
    queryKey: ['me'],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };

  const iconBtn =
    'rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link to="/products" className="flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            <ShoppingBag size={22} />
            ProductHub
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {me && (
              <div className="flex items-center gap-2">
                {me.image ? (
                  <img src={me.image} alt={me.firstName} className="h-8 w-8 rounded-full bg-slate-200 object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                    {me.firstName[0]}
                  </span>
                )}
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
                  {me.firstName} {me.lastName}
                </span>
              </div>
            )}

            <button onClick={toggle} className={iconBtn} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button onClick={handleLogout} className={`${iconBtn} flex items-center gap-2 text-sm font-medium`}>
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}