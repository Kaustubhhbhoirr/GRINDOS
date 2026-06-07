import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, PlusSquare, RefreshCw, User, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { icon: LayoutGrid, path: '/', label: 'Dashboard' },
  { icon: PlusSquare, path: '/add', label: 'Add Problem' },
  { icon: RefreshCw, path: '/revisit', label: 'Revisit Queue' },
  { icon: Search, path: '/search', label: 'Search' },
  { icon: User, path: '/profile', label: 'Profile' },
];

export default function Layout() {
  const [userName, setUserName] = useState('Grinder');
  const navigate = useNavigate();
  const location = useLocation();

  const loadProfileName = () => {
    const stored = localStorage.getItem('grindos_profile_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadProfileName();

    // Setup 1-second interval to check if profile name updated elsewhere
    const interval = setInterval(() => {
      const stored = localStorage.getItem('grindos_profile_info');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name && parsed.name !== userName) {
            setUserName(parsed.name);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 1000);

    // Listen to local storage events too for instant sync
    window.addEventListener('storage', loadProfileName);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadProfileName);
    };
  }, [userName]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (location.pathname !== '/search') {
          navigate('/search');
          setTimeout(() => {
            const input = document.getElementById('search-input');
            if (input) input.focus();
          }, 150);
        } else {
          const input = document.getElementById('search-input');
          if (input) {
            input.focus();
            input.select();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);

  const getInitials = (name) => {
    if (!name) return 'GR';
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const last = parts[parts.length - 1][0] || '';
      return (first + last).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-screen bg-[#0d0d0d] text-[#f0f0f0] font-sans overflow-hidden">
      {/* SideNavBar (Matching Stitch CSS and Visual specs) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full flex-col items-center py-6 z-50 w-[56px] bg-[#0d0d0d] border-r border-[#2a2a2a] shrink-0 select-none">
        {/* Branding header: Rotated vertically */}
        <div className="mb-8 flex flex-col items-center gap-8">
          <span 
            className="text-[#da7756] font-mono font-bold tracking-[0.2em] text-[11px] uppercase cursor-default"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            GrindOS
          </span>
        </div>

        {/* Navigation Item Links */}
        <div className="flex flex-col gap-3.5 w-full items-center mt-4">
          {navItems.map(({ icon: Icon, path, label }) => (
            <NavLink
              key={path}
              to={path}
              title={label}
              className={({ isActive }) =>
                `relative flex items-center justify-center w-full py-3 transition-colors ${
                  isActive 
                    ? 'text-[#da7756] bg-[#da7756]/5' 
                    : 'text-[#888888] hover:text-[#f0f0f0] hover:bg-[#1a1a1a]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#da7756]"></div>
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom Menu & Avatar Profile */}
        <div className="mt-auto flex flex-col items-center gap-4 pb-6 w-full">
          <div className="px-2">
            <NavLink 
              to="/profile"
              className="w-8 h-8 rounded-full bg-[#3b2a5c] border border-[#4a3a6c] flex items-center justify-center cursor-pointer hover:opacity-90 transition-all select-none"
            >
              <span className="text-[10px] font-bold text-[#b7a8d9] font-mono leading-none">
                {getInitials(userName)}
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 md:ml-[56px] h-full overflow-y-auto p-0">
        <Outlet />
      </main>
    </div>
  );
}
