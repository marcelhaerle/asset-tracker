import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Session encryption/decryption using Web Crypto API
function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET is not set or is too short (must be at least 32 characters)');
  }

  // Convert to ArrayBuffer using TextEncoder
  const encoder = new TextEncoder();
  return encoder.encode(secret.slice(0, 32));
}

// Utility functions to convert between base64, hex and array buffers
function hexToBuffer(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  return new Uint8Array(pairs.map(s => parseInt(s, 16)));
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Use native Web Crypto API
export async function encryptSession(data: string): Promise<string> {
  // Get key material from secret
  const keyMaterial = getSessionSecret();

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Import the key
  const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-CBC' }, false, [
    'encrypt',
  ]);

  // Encode the data
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, dataBuffer);

  // Convert results to hex strings for storage in cookie
  const ivHex = bufferToHex(iv);
  const encryptedHex = bufferToHex(encryptedBuffer);

  // Return iv and encrypted data together
  return `${ivHex}:${encryptedHex}`;
}

export async function decryptSession(encryptedData: string): Promise<string | null> {
  try {
    // Split IV and encrypted data
    const [ivHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !encryptedHex) return null;

    // Convert hex to buffers
    const iv = hexToBuffer(ivHex);
    const encryptedBuffer = hexToBuffer(encryptedHex);

    // Get key material from secret
    const keyMaterial = getSessionSecret();

    // Import the key
    const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-CBC' }, false, [
      'decrypt',
    ]);

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedBuffer
    );

    // Decode the decrypted data
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Session decryption failed:', error);
    return null;
  }
}

// Session management
export async function createSession(userId: number): Promise<string> {
  // Generate a random token
  const token = crypto.randomUUID();

  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Create the session
  await prisma.session.create({
    data: {
      token,
      expiresAt,
      userId,
    },
  });

  // Encrypt the token before returning it
  return await encryptSession(token);
}

export async function getUserBySession(encryptedToken: string): Promise<User | null> {
  if (!encryptedToken) return null;

  // Decrypt the token (now async)
  const token = await decryptSession(encryptedToken);

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const encryptedToken = cookieStore.get('session')?.value;

  if (!encryptedToken) return null;

  return getUserBySession(encryptedToken);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const encryptedToken = cookieStore.get('session')?.value;

  if (encryptedToken) {
    try {
      // Decrypt the token (now async)
      const token = await decryptSession(encryptedToken);

      if (token) {
        // Delete the session from the database
        await prisma.session.delete({
          where: { token },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear the cookie, even if decryption fails
      cookieStore.delete('session');
    }
  }
}
