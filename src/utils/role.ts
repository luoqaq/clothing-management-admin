import type { User } from '../types';

export type ClientRole = 'admin' | 'sales';

export function normalizeRole(role?: User['role'] | string | null): ClientRole {
  return role === 'admin' ? 'admin' : 'sales';
}

export function isAdminUser(user?: User | null): boolean {
  return normalizeRole(user?.role) === 'admin';
}

export function formatRoleLabel(role?: User['role'] | string | null): string {
  return normalizeRole(role) === 'admin' ? '管理员' : '销售';
}
