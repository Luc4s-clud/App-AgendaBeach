import jwt from 'jsonwebtoken';

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
};

export const authMiddleware = {
  required: (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    req.user = decoded;
    next();
  },

  optional: (req, _res, next) => {
    const token = getTokenFromHeader(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  }
};

