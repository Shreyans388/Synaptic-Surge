const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export const loginUser = async (email: string, password: string) => {
  await delay(800);

  if (email === "demo@ai.com" && password === "123456") {
    return {
      userId: "u1",
      token: "mock-jwt-token",
    };
  }

  throw new Error("Invalid credentials");
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  await delay(1000);

  return {
    userId: crypto.randomUUID(),
    token: "mock-jwt-token",
  };
};