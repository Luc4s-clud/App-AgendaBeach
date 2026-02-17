import express from 'express';
import { z } from 'zod';

export const tournamentsRouter = express.Router();

const tournamentSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(1000).optional().nullable(),
  sport: z.enum(['BEACH_TENNIS', 'VOLEI', 'FUTVOLEI']),
  startDate: z.string(), // yyyy-MM-dd
  endDate: z.string().optional().nullable(), // yyyy-MM-dd
  registrationEndDate: z.string().optional().nullable(), // yyyy-MM-dd
  hasGold: z.boolean().optional(),
  hasSilver: z.boolean().optional(),
  hasBronze: z.boolean().optional(),
  status: z.enum(['UPCOMING', 'ONGOING', 'FINISHED', 'CANCELED']).optional()
});

const leagueSchema = z.object({
  league: z.enum(['GOLD', 'SILVER', 'BRONZE'])
});

function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acesso restrito a administradores.' });
    return false;
  }
  return true;
}

// Lista torneios públicos (para usuários em geral)
tournamentsRouter.get('/tournaments', async (req, res, next) => {
  try {
    const tournaments = await req.prisma.tournament.findMany({
      orderBy: { startDate: 'asc' }
    });
    return res.json(tournaments);
  } catch (err) {
    next(err);
  }
});

// Lista torneios para painel admin (pode incluir todos os status)
tournamentsRouter.get('/tournaments/admin', async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const tournaments = await req.prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(tournaments);
  } catch (err) {
    next(err);
  }
});

// Cria torneio (ADMIN)
tournamentsRouter.post('/tournaments', async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const parsed = tournamentSchema.parse(req.body);

    const startDate = new Date(parsed.startDate);
    const endDate = parsed.endDate ? new Date(parsed.endDate) : null;
    const registrationEndDate = parsed.registrationEndDate
      ? new Date(parsed.registrationEndDate)
      : null;

    const tournament = await req.prisma.tournament.create({
      data: {
        name: parsed.name,
        description: parsed.description || null,
        sport: parsed.sport,
        startDate,
        endDate,
        registrationEndDate,
        hasGold: parsed.hasGold ?? false,
        hasSilver: parsed.hasSilver ?? false,
        hasBronze: parsed.hasBronze ?? false,
        status: parsed.status ?? 'UPCOMING'
      }
    });

    return res.status(201).json(tournament);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

// Atualiza torneio (ADMIN)
tournamentsRouter.put('/tournaments/:id', async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const parsed = tournamentSchema.partial().parse(req.body);

    const data = {};
    if (parsed.name != null) data.name = parsed.name;
    if (parsed.description !== undefined) data.description = parsed.description ?? null;
    if (parsed.sport) data.sport = parsed.sport;
    if (parsed.status) data.status = parsed.status;
    if (parsed.startDate) data.startDate = new Date(parsed.startDate);
    if (parsed.endDate !== undefined) data.endDate = parsed.endDate ? new Date(parsed.endDate) : null;
    if (parsed.registrationEndDate !== undefined) {
      data.registrationEndDate = parsed.registrationEndDate
        ? new Date(parsed.registrationEndDate)
        : null;
    }
    if (parsed.hasGold !== undefined) data.hasGold = parsed.hasGold;
    if (parsed.hasSilver !== undefined) data.hasSilver = parsed.hasSilver;
    if (parsed.hasBronze !== undefined) data.hasBronze = parsed.hasBronze;

    const updated = await req.prisma.tournament.update({
      where: { id },
      data
    });

    return res.json(updated);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

// Remove / cancela torneio (ADMIN)
tournamentsRouter.delete('/tournaments/:id', async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await req.prisma.tournament.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Inscrição em campeonato (USER)
tournamentsRouter.post('/tournaments/:id/register', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Faça login para se inscrever no campeonato.' });
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const { league } = leagueSchema.parse(req.body);

    const tournament = await req.prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ message: 'Campeonato não encontrado.' });
    }

    if (
      (league === 'GOLD' && !tournament.hasGold) ||
      (league === 'SILVER' && !tournament.hasSilver) ||
      (league === 'BRONZE' && !tournament.hasBronze)
    ) {
      return res.status(400).json({ message: 'Esta liga não está disponível para este campeonato.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const regEndStr = tournament.registrationEndDate
      ? tournament.registrationEndDate.toISOString().slice(0, 10)
      : null;

    if (!(tournament.status === 'UPCOMING' || tournament.status === 'ONGOING')) {
      return res.status(400).json({ message: 'Este campeonato não está disponível para inscrições.' });
    }

    if (regEndStr && regEndStr < todayStr) {
      return res.status(400).json({ message: 'Inscrições encerradas para este campeonato.' });
    }

    try {
      const registration = await req.prisma.tournamentRegistration.create({
        data: {
          userId: req.user.id,
          tournamentId: id,
          league
        }
      });

      return res.status(201).json(registration);
    } catch (err) {
      if (err.code === 'P2002') {
        return res
          .status(409)
          .json({ message: 'Você já está inscrito nesta liga deste campeonato.' });
      }
      throw err;
    }
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

// Minhas inscrições em campeonatos
tournamentsRouter.get('/tournaments/registrations/me', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Faça login para visualizar suas inscrições.' });
    }

    const regs = await req.prisma.tournamentRegistration.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        tournamentId: true,
        league: true,
        createdAt: true
      }
    });

    return res.json(regs);
  } catch (err) {
    next(err);
  }
});

