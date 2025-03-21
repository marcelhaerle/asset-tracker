#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SALT_ROUNDS = 10;

async function createUser(): Promise<void> {
  const username = await question('Username: ');
  const email = await question('Email: ');
  const plainPassword = await question('Password: ');

  try {
    const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
    });

    console.log(`✅ User created successfully with ID: ${user.id}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('❌ Error creating user:', errorMessage);
  }
}

async function listUsers(): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log('\nUsers:');
    console.log('--------------------------------------');
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.createdAt.toISOString()}`);
      console.log('--------------------------------------');
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('❌ Error listing users:', errorMessage);
  }
}

async function updateUser(): Promise<void> {
  const idStr = await question('User ID to update: ');
  const id = parseInt(idStr, 10);

  if (isNaN(id)) {
    console.error('❌ Invalid ID');
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`Updating user: ${user.username}`);

    const newUsername = await question(`New username (${user.username}): `);
    const newEmail = await question(`New email (${user.email}): `);
    const newPassword = await question('New password (leave empty to keep current): ');

    const updateData: {
      username?: string;
      password?: string;
      email?: string;
    } = {};

    if (newUsername && newUsername !== user.username) {
      updateData.username = newUsername;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    if (newEmail) {
      updateData.email = newEmail;
    }

    if (Object.keys(updateData).length === 0) {
      console.log('No changes to make');
      return;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    console.log('✅ User updated successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('❌ Error updating user:', errorMessage);
  }
}

async function deleteUser(): Promise<void> {
  const idStr = await question('User ID to delete: ');
  const id = parseInt(idStr, 10);

  if (isNaN(id)) {
    console.error('❌ Invalid ID');
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    const confirm = await question(
      `Are you sure you want to delete user ${user.username}? (y/N): `
    );

    if (confirm.toLowerCase() !== 'y') {
      console.log('Deletion cancelled');
      return;
    }

    await prisma.user.delete({ where: { id } });
    console.log('✅ User deleted successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('❌ Error deleting user:', errorMessage);
  }
}

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  console.log('🔐 User Management CLI');
  console.log('=====================');

  while (true) {
    console.log('\nSelect an action:');
    console.log('1) Create user');
    console.log('2) List users');
    console.log('3) Update user');
    console.log('4) Delete user');
    console.log('5) Exit');

    const choice = await question('\nEnter choice (1-5): ');

    switch (choice) {
      case '1':
        await createUser();
        break;
      case '2':
        await listUsers();
        break;
      case '3':
        await updateUser();
        break;
      case '4':
        await deleteUser();
        break;
      case '5':
        console.log('Goodbye! 👋');
        await prisma.$disconnect();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid choice. Try again.');
    }
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
