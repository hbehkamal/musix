import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import {
  getExpirationFromLoginResult,
  setTokenCookie,
  setExpirationCookie,
  DEFAULT_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth";

export async function POST(request: Request) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: API_BASE_URL not set" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { username, password } = body as Record<string, string>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid: username, password" },
      { status: 400 }
    );
  }

  const res = await fetch(`${apiUrl}/site/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Login failed" },
      { status: res.status }
    );
  }

  const result = data?.result ?? data;
  const accessToken =
    typeof result?.access_token === "string" ? result.access_token : null;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Login response missing access_token" },
      { status: 502 }
    );
  }

  const expiration =
    getExpirationFromLoginResult(result) ??
    new Date(Date.now() + DEFAULT_TOKEN_MAX_AGE_SECONDS * 1000);

  const response = NextResponse.json({
    ...data,
    message: "Logged in successfully",
  });
  response.headers.set("Set-Cookie", setTokenCookie(accessToken));
  response.headers.append("Set-Cookie", setExpirationCookie(expiration));
  return response;
}
