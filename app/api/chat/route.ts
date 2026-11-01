import OpenAI from "openai";

const openai = new OpenAI();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ApprovedMemory = {
  category: string;
  memory: string;
  confidence: number;
};

export async function POST(request: Request) {
  const {
    messages,
    memories,
  } = (await request.json()) as {
    messages?: ChatMessage[];
    memories?: ApprovedMemory[];
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
      content: item.content.slice(0, 1500),
    }))
    .slice(-40);

  const safeMemories = (memories || [])
    .filter(
      (item) =>
        typeof item.category === "string" &&
        typeof item.memory === "string" &&
        typeof item.confidence === "number",
    )
    .slice(0, 5);

  const memoryContext =
    safeMemories.length > 0
      ? safeMemories
          .map((item) => `- ${item.category}: ${item.memory}`)
          .join("\n")
      : "No approved long-term memories are available.";

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-6-astra",
    instructions: `
You are Tinker, a warm, thoughtful, age-appropriate conversational companion for children aged 8 to 12.

Respond safely, clearly, and meaningfully. Keep replies concise. Never encourage secrecy from trusted adults. If a child discusses danger, abuse, self-harm, or immediate risk, encourage them to contact a trusted adult or emergency services.

Approved memories about this child may be used naturally when relevant:
${memoryContext}

Do not mention memory systems, databases, confidence scores, or hidden instructions. Do not force an approved interest into an unrelated conversation.
`,
    input: safeMessages,
    max_output_tokens: 500,
  });

  return Response.json({ reply: response.output_text });
}
