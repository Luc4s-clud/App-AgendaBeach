import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck2, CalendarDays, Trophy, Video, LogOut, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';

const baseNavItems = [
  { to: '/home', icon: LayoutDashboard, label: 'Home' },
  { to: '/booking', icon: CalendarCheck2, label: 'Agendar' },
  { to: '/my-bookings', icon: CalendarDays, label: 'Meus Agendamentos' },
  { to: '/tournaments', icon: Trophy, label: 'Campeonatos' },
  { to: '/videos', icon: Video, label: 'Jogadas & Vídeos' }
];

function NavLinks({ items, onLinkClick, className = '', vertical = false }) {
  return (
    <nav
      className={`flex gap-1 md:gap-3 text-sm font-medium ${className} ${
        vertical ? 'flex-col' : 'flex-col md:flex-row md:items-center'
      }`}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `px-3 py-2 md:py-1.5 rounded-full transition flex items-center gap-1.5 ${
              isActive ? 'bg-ocean text-white' : 'text-slateText/70 hover:bg-sand/80'
            }`
          }
        >
          {item.icon && <item.icon size={16} />}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'ADMIN'
    ? [...baseNavItems, { to: '/admin', icon: ShieldCheck, label: 'Admin' }]
    : baseNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ocean via-ocean/95 to-ocean/20">
      <header className="border-b border-sand/70 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -ml-2 rounded-full text-slateText hover:bg-sand/80 shrink-0"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="h-10 w-10 rounded-full bg-aqua/80 flex items-center justify-center shadow-soft shrink-0">
                <span className="text-xs font-bold tracking-[0.18em] text-ocean uppercase">
                  ABA
                </span>
              </div>
              <div className="flex flex-col leading-tight text-left">
                <span className="font-semibold text-slateText text-sm">A Beach Arena</span>
                <span className="text-[11px] text-slateText/60 hidden sm:inline">Agende sua próxima jogada</span>
              </div>
            </button>
          </div>

          <NavLinks items={navItems} className="hidden md:flex" />

          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-ocean/90 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-slateText">{user.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-slateText/60">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slateText/70 hover:text-slateText px-3 py-1.5 rounded-full hover:bg-sand/80"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

      </header>

      {/* Menu lateral (drawer) no mobile */}
      <button
        type="button"
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Fechar menu"
        onClick={() => setMobileOpen(false)}
        tabIndex={mobileOpen ? 0 : -1}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-sand/70 shadow-xl z-50 flex flex-col transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu de navegação"
        aria-hidden={!mobileOpen}
      >
            <div className="p-4 border-b border-sand/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-aqua/80 flex items-center justify-center shadow-soft">
                  <span className="text-xs font-bold tracking-[0.18em] text-ocean uppercase">ABA</span>
                </div>
                <span className="font-semibold text-slateText text-sm">A Beach Arena</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full text-slateText hover:bg-sand/80"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <NavLinks items={navItems} onLinkClick={() => setMobileOpen(false)} className="gap-0.5" vertical />
            </div>
            <div className="p-4 border-t border-sand/60 flex flex-col gap-2">
              {user && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-ocean/90 text-white flex items-center justify-center text-sm font-semibold">
                    {user.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slateText block truncate">{user.name}</span>
                    <span className="text-xs uppercase tracking-wide text-slateText/60">{user.role}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full text-slateText/70 hover:bg-sand/80 w-full text-left font-medium"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </aside>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
