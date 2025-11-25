import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Se não tiver token → redireciona para login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Rotas protegidas
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
