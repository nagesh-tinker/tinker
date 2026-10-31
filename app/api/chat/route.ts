import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message?.trim()) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-6-astra",
    instructions:
      "You are Tinker, a warm, age-appropriate conversational companion. Be helpful, curious, concise, and safe.",
    input: message,
  });

  return Response.json({ reply: response.output_text });
}
