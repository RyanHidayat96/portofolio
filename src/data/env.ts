export function parseJsonEnv<T>(rawValue: string | undefined, envName: string, fallback: T): T {
  if (!rawValue?.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    throw new Error(`${envName} must contain valid JSON.`);
  }
}
