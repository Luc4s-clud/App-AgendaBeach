import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export function BookingFailurePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
          <XCircle size={32} />
        </div>
        <h1 className="text-xl font-semibold text-slateText mb-2">Pagamento não realizado</h1>
        <p className="text-sm text-slateText/70 mb-6">
          O pagamento foi recusado ou cancelado. Você pode tentar novamente.
        </p>
        <Link
          to="/booking"
          className="btn-primary inline-flex"
        >
          Tentar novamente
        </Link>
      </div>
    </div>
  );
}
