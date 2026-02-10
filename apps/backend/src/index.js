import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import { authRouter } from './routes/auth.js';
import { courtsRouter } from './routes/courts.js';
import { bookingsRouter } from './routes/bookings.js';
import { meRouter } from './routes/me.js';
import { paymentsRouter } from './routes/payments.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const prisma = new PrismaClient();

// Middlewares globais
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Injeta prisma no request para uso nos routers
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Rotas
app.use('/api/auth', authRouter);
app.use('/api', authMiddleware.optional, meRouter);
app.use('/api', courtsRouter);
app.use('/api', authMiddleware.optional, paymentsRouter);
app.use('/api', authMiddleware.required, bookingsRouter);

// Healthcheck simples
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handler de erros
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend A Beach Arena rodando na porta ${PORT}`);
});

