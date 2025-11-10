'use server';

import { users } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import type { AppUser } from '@/lib/definitions';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

const SESSION_COOKIE_NAME = 'campify-session';

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}

export async function login(email: string) {
  const user = users.find((user) => user.email === email);
  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }
  await setSessionCookie(user.id);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function logout() {
  await deleteSessionCookie();
  revalidatePath('/login');
  revalidatePath('/dashboard');
}

export async function getAuthenticatedUser(): Promise<AppUser | null> {
  return await getCurrentUser();
}
