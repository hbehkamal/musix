import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
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
    return NextResponse.json({ error: "Missing song id" }, { status: 400 });
  }

  const authHeaders = getAuthHeaders(_request);
  const url = `${apiUrl.replace(/\/$/, "")}/song/download/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders,
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Download failed" },
      { status: res.status }
    );
  }

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const contentDisposition = `attachment; filename="song-${safeId}.mp3"`;

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": contentDisposition,
    },
  });
}
