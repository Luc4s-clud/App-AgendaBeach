import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '@abeach/shared';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const { name, email, password } = parsed;

    const existing = await req.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await req.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { email, password } = parsed;

    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

