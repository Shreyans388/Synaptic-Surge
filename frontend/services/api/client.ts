const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5004";

interface ApiErrorPayload {
  message?: string;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = (await res.json()) as ApiErrorPayload;
      if (data?.message) message = data.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function getApiBase(): string {
  return API_BASE;
}
