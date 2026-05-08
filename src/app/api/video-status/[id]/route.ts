import { NextResponse } from "next/server";
import { buildDidAuthHeader } from "@/lib/video";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authHeader = buildDidAuthHeader();
  const { id } = await context.params;

  if (!authHeader) {
    return NextResponse.json(
      {
        error:
          "D_ID_API_KEY is missing. Add your D-ID API key to .env.local before checking video status.",
      },
      { status: 500 },
    );
  }

  if (!id) {
    return NextResponse.json({ error: "Missing video id." }, { status: 400 });
  }

  const didResponse = await fetch(
    `https://api.d-id.com/talks/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const result = await didResponse.json().catch(() => null);

  if (!didResponse.ok) {
    return NextResponse.json(
      {
        error: "D-ID status lookup failed.",
        details: result,
      },
      { status: didResponse.status },
    );
  }

  return NextResponse.json({
    id: result?.id ?? id,
    status: result?.status,
    resultUrl: result?.result_url ?? null,
    createdAt: result?.created_at,
    duration: result?.metadata?.duration,
  });
}
