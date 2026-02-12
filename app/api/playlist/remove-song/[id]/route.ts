import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: API_BASE_URL not set" },
      { status: 500 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing playlist id" }, { status: 400 });
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

  const songId = (body as Record<string, unknown>).song_id;
  if (songId == null || (typeof songId !== "number" && typeof songId !== "string")) {
    return NextResponse.json(
      { error: "Missing or invalid: song_id" },
      { status: 400 }
    );
  }

  const authHeaders = getAuthHeaders(request);
  const res = await fetch(`${apiUrl}/playlist/remove-song/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ song_id: Number(songId) }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Failed to remove song from playlist" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
