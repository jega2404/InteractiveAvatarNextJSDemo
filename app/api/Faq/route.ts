import { NextResponse } from "next/server";
import hospitalFaq from "@/public/hospital_faq.json";

export async function POST(req: Request) {
  const { question } = await req.json();

  const lowerQ = question.toLowerCase();

  // Simple FAQ match
  const match = hospitalFaq.find((item: any) =>
    lowerQ.includes(item.question.toLowerCase())
  );

  return NextResponse.json({
    answer: match ? match.answer : "Sorry, I don't have information about that.",
  });
}
