const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create sample user (for development)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      expenses: {
        create: [
          {
            title: 'Morning Coffee',
            amount: 4.50,
            category: 'FOOD',
            date: new Date('2024-12-16'),
            paymentMethod: 'CREDIT_CARD',
            location: 'Starbucks',
            notes: 'Daily caffeine fix',
            tags: ['daily', 'beverage']
          },
          {
            title: 'Grocery Shopping',
            amount: 67.89,
            category: 'GROCERIES',
            date: new Date('2024-12-15'),
            paymentMethod: 'DEBIT_CARD',
            location: 'Whole Foods',
            notes: 'Weekly groceries',
            tags: ['weekly', 'essentials']
          },
          {
            title: 'Uber to Airport',
            amount: 35.20,
            category: 'TRANSPORTATION',
            date: new Date('2024-12-14'),
            paymentMethod: 'DIGITAL_WALLET',
            location: 'Los Angeles',
            notes: 'Business trip',
            tags: ['business', 'travel']
          },
          {
            title: 'Netflix Subscription',
            amount: 15.99,
            category: 'SUBSCRIPTIONS',
            date: new Date('2024-12-13'),
            paymentMethod: 'CREDIT_CARD',
            notes: 'Monthly subscription',
            isRecurring: true,
            tags: ['monthly', 'entertainment']
          },
          {
            title: 'Dinner at Restaurant',
            amount: 89.50,
            category: 'FOOD',
            date: new Date('2024-12-12'),
            paymentMethod: 'CREDIT_CARD',
            location: 'Italian Bistro',
            notes: 'Date night',
            tags: ['date', 'special']
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });