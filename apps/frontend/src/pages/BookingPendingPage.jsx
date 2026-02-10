import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export function BookingPendingPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
          <Clock size={32} />
        </div>
        <h1 className="text-xl font-semibold text-slateText mb-2">Pagamento pendente</h1>
        <p className="text-sm text-slateText/70 mb-6">
          Seu pagamento está aguardando confirmação (ex.: boleto ou PIX). Assim que for aprovado, suas reservas serão criadas.
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
