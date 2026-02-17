import { PrismaClient, Sport, CourtType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding courts...');

  // Deletar na ordem correta por causa de foreign keys (courtId)
  await prisma.pendingPayment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.court.deleteMany({});

  const courtsData = [
    { name: 'Quadra JJ', sport: Sport.BEACH_TENNIS, type: CourtType.COBERTA, pricePerHour: 80 },
    { name: 'Quadra 2', sport: Sport.VOLEI, type: CourtType.COBERTA, pricePerHour: 80 },
    { name: 'Quadra 3', sport: Sport.FUTVOLEI, type: CourtType.COBERTA, pricePerHour: 80 },
    { name: 'Quadra 4', sport: Sport.BEACH_TENNIS, type: CourtType.DESCOBERTA, pricePerHour: 50 },
    { name: 'Quadra 5', sport: Sport.VOLEI, type: CourtType.DESCOBERTA, pricePerHour: 50 },
    { name: 'Quadra 6', sport: Sport.FUTVOLEI, type: CourtType.DESCOBERTA, pricePerHour: 50 }
  ];

  for (const court of courtsData) {
    await prisma.court.create({ data: court });
  }

  console.log('Seed concluído: Quadra JJ, 2, 3 (cobertas R$80/h) | Quadras 4, 5, 6 (descobertas R$50/h).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
