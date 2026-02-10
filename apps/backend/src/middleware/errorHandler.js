export function errorHandler(err, _req, res, _next) {
  console.error('Erro na API:', err);

  if (err.status && err.message) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Erro interno do servidor' });
}

