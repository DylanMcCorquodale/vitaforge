export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = { "Content-Type": "application/json", ...Object.fromEntries(new Headers(options.headers).entries()) };
  const response = await fetch(`/api${path}`, { ...options, headers, credentials: "same-origin" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}
