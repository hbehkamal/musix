import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: API_BASE_URL not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.set(key, value);
  });

  const url = `${apiUrl}/playlist?${params.toString()}`;
  const authHeaders = getAuthHeaders(request);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Failed to fetch playlists" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
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

  const { title, cover } = body as Record<string, string>;
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid: title" },
      { status: 400 }
    );
  }

  const authHeaders = getAuthHeaders(request);
  const res = await fetch(`${apiUrl}/playlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({
      title: title.trim(),
      ...(typeof cover === "string" && cover.trim() ? { cover: cover.trim() } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Failed to create playlist" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
