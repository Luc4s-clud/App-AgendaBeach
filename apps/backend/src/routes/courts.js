import express from 'express';

export const courtsRouter = express.Router();

courtsRouter.get('/courts', async (req, res, next) => {
  try {
    const courts = await req.prisma.court.findMany({
      orderBy: { id: 'asc' }
    });
    return res.json(courts);
  } catch (err) {
    next(err);
  }
});

