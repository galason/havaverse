export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export interface PasswordCheck {
  id: string;
  label: string;
  met: boolean;
}

export function passwordChecks(password: string): PasswordCheck[] {
  return [
  { id: 'length', label: '8+ characters', met: password.length >= 8 },
  { id: 'upper', label: '1 uppercase letter', met: /[A-Z]/.test(password) },
  { id: 'lower', label: '1 lowercase letter', met: /[a-z]/.test(password) },
  { id: 'number', label: '1 number', met: /\d/.test(password) },
  { id: 'special', label: '1 special character', met: /[^A-Za-z0-9]/.test(password) }];

}

export type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export function passwordStrength(password: string): {level: StrengthLevel;score: number;} {
  if (!password) return { level: 'empty', score: 0 };
  const met = passwordChecks(password).filter((c) => c.met).length;
  const score = Math.round(met / 5 * 100);
  if (met <= 2) return { level: 'weak', score };
  if (met === 3) return { level: 'fair', score };
  if (met === 4) return { level: 'good', score };
  return { level: 'strong', score };
}

const takenUsernames = ['john', 'admin', 'havaverse', 'daniel', 'creator', 'support'];

export function isUsernameTaken(username: string) {
  return takenUsernames.includes(username.trim().toLowerCase());
}

export const isValidUsername = (value: string) => /^[a-z0-9_]{3,20}$/i.test(value.trim());

export function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, 3);
  return `${visible}${'•'.repeat(Math.max(3, name.length - 3))}@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\s+/g, '');
  if (digits.length < 5) return phone;
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));