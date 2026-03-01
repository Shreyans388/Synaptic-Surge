import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Local dev: rely on backend /api/auth/check + AppShell for auth.
// Middleware is a no-op so it won't cause redirect loops.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}