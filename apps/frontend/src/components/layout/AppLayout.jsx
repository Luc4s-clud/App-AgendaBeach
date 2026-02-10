import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck2, Trophy, Video, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';

const navItems = [
  { to: '/home', icon: LayoutDashboard, label: 'Home' },
  { to: '/booking', icon: CalendarCheck2, label: 'Agendar' },
  { to: '/my-bookings', label: 'Meus Agendamentos' },
  { to: '/tournaments', icon: Trophy, label: 'Campeonatos' },
  { to: '/videos', icon: Video, label: 'Jogadas & Vídeos' }
];

function NavLinks({ onLinkClick, className = '' }) {
  return (
    <nav className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm font-medium ${className}`}>
      {navItems.map((item) => (
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

  return (
    <div className="min-h-screen flex flex-col bg-sand/70">
      <header className="border-b border-sand/70 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2"
          >
            <div className="h-10 w-10 rounded-full bg-aqua/80 flex items-center justify-center shadow-soft">
              <span className="text-xs font-bold tracking-[0.18em] text-ocean uppercase">
                ABA
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-slateText text-sm">A Beach Arena</span>
              <span className="text-[11px] text-slateText/60">Agende sua próxima jogada</span>
            </div>
          </button>

          <NavLinks className="hidden md:flex" />

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

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-slateText hover:bg-sand/80"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-sand/70 shadow-lg px-4 py-4"
            role="dialog"
            aria-label="Menu de navegação"
          >
            <NavLinks onLinkClick={() => setMobileOpen(false)} />
            <div className="mt-4 pt-4 border-t border-sand/60 flex flex-col gap-2 md:hidden">
              {user && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-ocean/90 text-white flex items-center justify-center text-xs font-semibold">
                    {user.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slateText block">{user.name}</span>
                    <span className="text-[11px] uppercase tracking-wide text-slateText/60">{user.role}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-slateText/70 hover:bg-sand/80 w-full text-left"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
