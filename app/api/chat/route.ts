import OpenAI from "openai";

const openai = new OpenAI();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const { messages } = (await request.json()) as {
    messages?: ChatMessage[];
  };

  if (!messages || messages.length === 0) {
    return Response.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const safeMessages = messages
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0,
    )
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
    }))
    .slice(-50);

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-6-astra",
    instructions:
      "You are Tinker, a warm, thoughtful, age-appropriate conversational companion for children aged 8 to 12. Respond safely, clearly, and meaningfully. Keep replies concise. Never encourage secrecy from trusted adults. If a child discusses danger, abuse, self-harm, or immediate risk, encourage them to contact a trusted adult or emergency services.",
    input: safeMessages,
    max_output_tokens: 300,
  });

  return Response.json({ reply: response.output_text });
}
