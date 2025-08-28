import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Hash passwords for the initial users
    const adminPassword = await bcrypt.hash('password123', 10);
    const teacherPassword = await bcrypt.hash('password123', 10);

    // Create a default Admin user
    // upsert will create the user if they don't exist, or do nothing if they do.
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            role: 'Admin',
        },
    });

    // Create a default Teacher user
    await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: {},
        create: {
            email: 'teacher@example.com',
            password: teacherPassword,
            role: 'Teacher',
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        // Close the Prisma Client connection
        await prisma.$disconnect();
    });
