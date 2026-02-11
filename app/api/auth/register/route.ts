import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

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

  const { first_name, last_name, username, password } = body as Record<
    string,
    string
  >;
  if (
    typeof first_name !== "string" ||
    typeof last_name !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid: first_name, last_name, username, password" },
      { status: 400 }
    );
  }

  const res = await fetch(`${apiUrl}/site/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name,
      last_name,
      username,
      password,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Registration failed" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
