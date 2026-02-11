import { NextResponse } from "next/server";
import {
  clearTokenCookie,
  AUTH_EXPIRATION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.headers.set("Set-Cookie", clearTokenCookie());
  response.headers.append(
    "Set-Cookie",
    `${AUTH_EXPIRATION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=lax`
  );
  return response;
}
