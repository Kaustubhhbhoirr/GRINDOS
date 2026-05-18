import { Outlet, NavLink } from 'react-router-dom';
import { LayoutGrid, PlusSquare, Terminal, RefreshCw, User, Search, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { icon: LayoutGrid, path: '/', label: 'Dashboard' },
  { icon: PlusSquare, path: '/add', label: 'Add Problem' },
  { icon: Terminal, path: '/panel', label: 'Side Panel' },
  { icon: RefreshCw, path: '/revisit', label: 'Revisit Queue' },
  { icon: Search, path: '/search', label: 'Search' },
  { icon: User, path: '/profile', label: 'Profile' },
];

export default function Layout() {
  const [userName, setUserName] = useState('Grinder');

  useEffect(() => {
    // Load name from profile info if it exists
    const stored = localStorage.getItem('grindos_profile_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'GO';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
          <NavLink
            to="/profile"
            title="Settings"
            className={({ isActive }) =>
              `flex items-center justify-center w-full py-3 transition-colors ${
                isActive ? 'text-[#da7756]' : 'text-[#888888] hover:text-[#f0f0f0] hover:bg-[#1a1a1a]'
              }`
            }
          >
            <Settings size={20} />
          </NavLink>
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

