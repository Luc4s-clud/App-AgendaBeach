import { z } from 'zod';

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD');

export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm');

export const sportSchema = z.enum(['BEACH_TENNIS', 'VOLEI', 'FUTVOLEI']);

export const bookingCreateSchema = z.object({
  courtId: z.number().int().positive(),
  sport: sportSchema,
  date: dateStringSchema,
  startTime: timeStringSchema,
  endTime: timeStringSchema
});

export const bookingQuerySchema = z.object({
  courtId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !Number.isNaN(val) && val > 0, 'courtId inválido'),
  date: dateStringSchema
});

