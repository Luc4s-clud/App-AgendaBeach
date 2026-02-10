import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api.js';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Cadastro realizado! Agora faça login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao cadastrar');
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
              <span className="text-xs text-slateText/70">Crie sua conta</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card px-8 py-8 space-y-6">
          <h1 className="text-lg font-semibold text-slateText">Cadastro</h1>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slateText/80">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-sand/80 bg-sand/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aqua focus:border-aqua"
              placeholder="Seu nome completo"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="text-xs text-center text-slateText/70">
            Já tem conta?{' '}
            <Link to="/login" className="text-ocean font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

