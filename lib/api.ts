export function getApiUrl(): string | undefined {
  return process.env.API_BASE_URL?.trim() || undefined;
}