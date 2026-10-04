export function normalizeFrenchPhone(value: string): string {
  const compact = value.trim().replace(/[\s.()-]/g, "").replace(/^0033/, "+33");
  if (/^0[1-9]\d{8}$/.test(compact)) return `+33${compact.slice(1)}`;
  return compact;
}

export function isFrenchPhone(value: string): boolean {
  return /^\+33[1-9]\d{8}$/.test(normalizeFrenchPhone(value));
}

export function isFrenchPostalCode(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}
