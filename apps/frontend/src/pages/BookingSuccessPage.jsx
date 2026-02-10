import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function BookingSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-aqua/20 text-aqua mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-xl font-semibold text-slateText mb-2">Pagamento confirmado!</h1>
        <p className="text-sm text-slateText/70 mb-6">
          Suas reservas foram processadas. Em instantes elas aparecerão em Meus Agendamentos.
        </p>
        <Link
          to="/my-bookings"
          className="btn-primary inline-flex"
        >
          Ver meus agendamentos
        </Link>
      </div>
    </div>
  );
}
