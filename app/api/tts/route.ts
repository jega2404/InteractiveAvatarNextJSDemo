import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const ttsReq = {
      input: { text },
      voice: {
        languageCode: "ar-XA",
        name: "ar-XA-Wavenet-B", 
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    };

    const response = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
        process.env.GOOGLE_TTS_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsReq),
      }
    );

    const data = await response.json();

    if (!data.audioContent) {
      return NextResponse.json(
        { error: "TTS failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: data.audioContent });
  } catch (err) {
    return NextResponse.json(
      { error: "TTS error", details: err },
      { status: 500 }
    );
  }
}
