import { getMockDb } from './mock-data';
import { User } from '@/types/user';

// Mock auth utilities

export function getSessionUserIdClient(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(^| )vrs_user_id=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export function getCurrentUserClient(): User | null {
  const userId = getSessionUserIdClient();
  if (!userId) return null;
  const db = getMockDb();
  return db.users.find((u) => u.id === userId) || null;
}

export function loginClient(userId: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `vrs_user_id=${encodeURIComponent(userId)}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function logoutClient() {
  if (typeof window !== 'undefined') {
    document.cookie = 'vrs_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
