import { NextResponse } from "next/server";
import {
  buildDidAuthHeader,
  buildMarketingScript,
  findAvatar,
  isMarketingLanguage,
  languages,
} from "@/lib/video";

export const runtime = "nodejs";

type GenerateVideoRequest = {
  avatarId?: string;
  description?: string;
  language?: string;
  productImageName?: string;
};

export async function POST(request: Request) {
  const authHeader = buildDidAuthHeader();

  if (!authHeader) {
    return NextResponse.json(
      {
        error:
          "D_ID_API_KEY is missing. Add your D-ID API key to .env.local before generating videos.",
      },
      { status: 500 },
    );
  }

  let body: GenerateVideoRequest;

  try {
    body = (await request.json()) as GenerateVideoRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const description = body.description?.trim();
  const language = body.language;

  if (!description || description.length < 12) {
    return NextResponse.json(
      { error: "Product description must be at least 12 characters." },
      { status: 400 },
    );
  }

  if (!language || !isMarketingLanguage(language)) {
    return NextResponse.json(
      { error: "Unsupported marketing language." },
      { status: 400 },
    );
  }

  const avatar = findAvatar(body.avatarId ?? "");
  const script = buildMarketingScript({ description, language });
  const voice = languages[language];

  const didPayload = {
    source_url: avatar.imageUrl,
    script: {
      type: "text",
      input: script,
      provider: {
        type: "microsoft",
        voice_id: voice.voiceId,
        voice_config: {
          rate: "1.03",
          style: "cheerful",
          language: voice.voiceLanguage,
        },
      },
    },
    config: {
      stitch: true,
      result_format: "mp4",
      driver_expressions: {
        expressions: [
          { start_frame: 0, expression: "happy", intensity: 0.75 },
          { start_frame: 75, expression: "neutral", intensity: 0.9 },
          { start_frame: 130, expression: "happy", intensity: 0.65 },
        ],
        transition_frames: 18,
      },
    },
    user_data: body.productImageName
      ? `Product image uploaded: ${body.productImageName}`
      : undefined,
  };

  const didResponse = await fetch("https://api.d-id.com/talks", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(didPayload),
  });

  const result = await didResponse.json().catch(() => null);

  if (!didResponse.ok) {
    return NextResponse.json(
      {
        error: "D-ID video generation failed.",
        details: result,
      },
      { status: didResponse.status },
    );
  }

  return NextResponse.json({
    id: result?.id,
    status: result?.status ?? "created",
    script,
    avatar,
  });
}
