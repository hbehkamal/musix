import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: API_BASE_URL not set" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const authHeaders = getAuthHeaders(request);
  const res = await fetch(`${apiUrl}/uploader/playlist-cover`, {
    method: "POST",
    headers: {
      ...authHeaders,
      // Do not set Content-Type; fetch sets multipart/form-data with boundary
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      data?.error ?? data ?? { error: "Failed to upload cover" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
