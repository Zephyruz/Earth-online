export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const requiredExp = (level: number) => 100 + (level - 1) * 50;

export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
