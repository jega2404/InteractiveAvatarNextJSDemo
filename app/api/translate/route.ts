import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await fetch(
      "https://translation.googleapis.com/language/translate/v2?key=" +
        process.env.GOOGLE_TRANSLATE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: "ar",
        }),
      }
    );

    const data = await response.json();

    const translatedText =
      data.data?.translations?.[0]?.translatedText || "";

    return NextResponse.json({ text: translatedText });
  } catch (err) {
    return NextResponse.json(
      { error: "Translation error", details: err },
      { status: 500 }
    );
  }
}
