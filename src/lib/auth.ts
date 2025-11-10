import { cookies } from 'next/headers';
import { users } from './data';
import type { AppUser } from './definitions';

const SESSION_COOKIE_NAME = 'campify-session';

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const user = users.find((user) => user.id === userId);

  if (!user) {
    // This can happen if the user was deleted but the cookie still exists.
    // We should not delete the cookie here as it's a side-effect not allowed in this context.
    // The user will be treated as logged out.
    return null;
  }

  return user;
}

// This is the function that should be used in Server Components and Route Handlers.
export { getCurrentUser as getUser };


export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}
