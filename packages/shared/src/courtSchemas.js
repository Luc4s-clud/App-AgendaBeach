import { z } from 'zod';

export const sportSchema = z.enum(['BEACH_TENNIS', 'VOLEI', 'FUTVOLEI']);

export const courtTypeSchema = z.enum(['COBERTA', 'DESCOBERTA']);

export const courtSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  sport: sportSchema,
  type: courtTypeSchema,
  pricePerHour: z.number().int().min(0)
});

export const courtArraySchema = z.array(courtSchema);

