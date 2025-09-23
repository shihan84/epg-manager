import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      companyName: 'EPG Manager Admin',
    },
  });

  // Create demo client user
  const clientPassword = await bcrypt.hash('password', 12);
  const client = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: clientPassword,
      role: UserRole.CLIENT,
      companyName: 'Demo TV Network',
    },
  });

  // Create demo channels for the client
  const channel1 = await prisma.channel.create({
    data: {
      name: 'news-channel',
      displayName: 'News Channel',
      description: '24/7 News Channel',
      number: 1,
      userId: client.id,
    },
  });

  const channel2 = await prisma.channel.create({
    data: {
      name: 'sports-channel',
      displayName: 'Sports Channel',
      description: 'Sports and Entertainment',
      number: 2,
      userId: client.id,
    },
  });

  // Create demo programs for the client
  const program1 = await prisma.program.create({
    data: {
      title: 'Morning News',
      description: 'Daily morning news update',
      category: 'News',
      duration: 60,
      userId: client.id,
    },
  });

  const program2 = await prisma.program.create({
    data: {
      title: 'Sports Highlights',
      description: 'Weekly sports highlights show',
      category: 'Sports',
      duration: 90,
      userId: client.id,
    },
  });

  const program3 = await prisma.program.create({
    data: {
      title: 'Movie Night',
      description: 'Feature film presentation',
      category: 'Movies',
      duration: 120,
      userId: client.id,
    },
  });

  // Create demo schedules
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await prisma.schedule.create({
    data: {
      channelId: channel1.id,
      programId: program1.id,
      startTime: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM
      endTime: new Date(today.getTime() + 7 * 60 * 60 * 1000), // 7:00 AM
      isLive: true,
    },
  });

  await prisma.schedule.create({
    data: {
      channelId: channel2.id,
      programId: program2.id,
      startTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), // 8:00 PM
      endTime: new Date(today.getTime() + 21 * 60 * 60 * 1000 + 30 * 60 * 1000), // 9:30 PM
      isNew: true,
    },
  });

  await prisma.schedule.create({
    data: {
      channelId: channel2.id,
      programId: program3.id,
      startTime: new Date(today.getTime() + 22 * 60 * 60 * 1000), // 10:00 PM
      endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 12:00 AM
    },
  });

  // Create subscription plans
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for small TV networks and individual users',
      price: 29.99,
      features: [
        'Up to 10 channels',
        'Up to 100 programs',
        'Up to 500 schedules',
        '50 EPG generations per month',
        '10,000 API calls per month',
        'Email support',
      ],
      limits: {
        channels: 10,
        programs: 100,
        schedules: 500,
        epgGenerations: 50,
        apiCalls: 10000,
      },
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Professional',
      description: 'Ideal for growing TV networks and media companies',
      price: 79.99,
      features: [
        'Up to 50 channels',
        'Up to 500 programs',
        'Up to 2,500 schedules',
        '200 EPG generations per month',
        '50,000 API calls per month',
        'Priority support',
        'Advanced analytics',
      ],
      limits: {
        channels: 50,
        programs: 500,
        schedules: 2500,
        epgGenerations: 200,
        apiCalls: 50000,
      },
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise',
      description: 'For large media organizations and broadcasters',
      price: 199.99,
      features: [
        'Unlimited channels',
        'Unlimited programs',
        'Unlimited schedules',
        'Unlimited EPG generations',
        'Unlimited API calls',
        '24/7 phone support',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
      ],
      limits: {
        channels: -1, // -1 means unlimited
        programs: -1,
        schedules: -1,
        epgGenerations: -1,
        apiCalls: -1,
      },
    },
  });

  // Create subscription for demo client
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      userId: client.id,
      planId: professionalPlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
      nextBillingDate: nextBillingDate,
      autoRenew: true,
    },
  });

  // Create sample billing record
  await prisma.billingHistory.create({
    data: {
      userId: client.id,
      subscriptionId: (await prisma.subscription.findFirst({
        where: { userId: client.id },
      }))!.id,
      amount: 79.99,
      status: 'PAID',
      billingDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidDate: new Date(),
      notes: 'Initial subscription payment',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@example.com / admin123');
  console.log('Demo credentials: demo@example.com / password');
  console.log('Demo user has Professional subscription plan');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
