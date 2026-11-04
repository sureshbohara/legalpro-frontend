import { User } from '@/types';

export const hasPermission = (user: User | null, permissionName: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.some((p) => p.name === permissionName);
};