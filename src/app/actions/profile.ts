'use server';

import { getSessionUserId } from '@/lib/auth';
import { users } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: 'Authentication required.' };
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const name = formData.get('name') as string;
  if (name) {
    user.name = name;
  }

  revalidatePath('/dashboard/profile');
  return { success: true, message: 'Profile updated successfully.' };
}

export async function updatePassword(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: 'Authentication required.' };
  }
  // In a real app, you'd validate the current password and update it.
  // For this demo, we'll just return a success message.
  const newPassword = formData.get('new-password') as string;
  if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters.'}
  }

  console.log('Password updated for user:', userId);
  return { success: true, message: 'Password updated successfully.' };
}
