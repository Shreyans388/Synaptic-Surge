const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface AuthResponse {
  _id: string;
  fullName: string;
  email: string;
}

async function request<T>(
  path: string,
  options: RequestInit
): Promise<T> {
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
      const data = (await res.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  return request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ fullName: name, email, password }),
  });
};

export const logoutUser = async (): Promise<void> => {
  await request<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
};

export const checkAuth = async (): Promise<AuthResponse | null> => {
  try {
    const user = await request<AuthResponse>("/api/auth/check", {
      method: "GET",
    });
    return user;
  } catch {
    return null;
  }
};

export const devLogin = async (
  userId: string
): Promise<{ message: string; userId: string }> => {
  return request<{ message: string; userId: string }>(
    `/dev-login/${userId}`,
    { method: "GET" }
  );
};