import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-red-200';
    case 'faculty': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200';
    case 'student': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
  }
};

export const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const getInitial = (name: string | undefined | null): string => {
  if (!name) return 'U';
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
  return (cleaned.charAt(0) || name.charAt(0)).toUpperCase();
};

export const getActiveSemester = (year: number | undefined) => {
  if (!year) return null;
  const month = new Date().getMonth();
  const isEvenSemester = month >= 0 && month <= 5;

  if (isEvenSemester) {
    return year * 2;
  } else {
    return year * 2 - 1;
  }
};

export const getBatchFromId = (id: string | undefined) => {
  if (!id) return '2024';
  if (id.includes('-')) {
    const parts = id.split('-');
    return parts.length > 2 ? parts[2] : parts[0];
  }
  if (/^\d+$/.test(id) && id.length >= 4) {
    return id.substring(0, 4);
  }
  return '2024';
};
