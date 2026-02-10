import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/home';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      toast.success('Bem-vindo de volta!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sand to-sand/70 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-aqua/90 flex items-center justify-center shadow-soft">
              <span className="text-xs font-bold tracking-[0.18em] text-ocean uppercase">
                ABA
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-slateText text-lg">A Beach Arena</span>
              <span className="text-xs text-slateText/70">
                Agende sua quadra em poucos cliques
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card px-8 py-8 space-y-6">
          <h1 className="text-lg font-semibold text-slateText">Entrar</h1>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slateText/80">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-sand/80 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aqua focus:border-aqua"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slateText/80">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-sand/80 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aqua focus:border-aqua"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-xs text-center text-slateText/70">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-ocean font-semibold hover:underline">
              Cadastrar agora
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

