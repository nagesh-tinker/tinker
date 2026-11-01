import OpenAI from "openai";

const openai = new OpenAI();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MemoryCandidate = {
  category:
    | "interest"
    | "hobby"
    | "ongoing_project"
    | "learning_preference";
  memory: string;
  confidence: number;
};

export async function POST(request: Request) {
  const { messages } = (await request.json()) as {
    messages?: ChatMessage[];
  };

  if (!messages || messages.length === 0) {
    return Response.json({ memories: [] });
  }

  const safeMessages = messages
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    )
    .map((item) => `${item.role}: ${item.content.slice(0, 1500)}`)
    .slice(-20)
    .join("\n");

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-6-astra",
    instructions: `
You identify only safe, useful, non-sensitive long-term preferences from a child's conversation.

Return JSON only in this exact shape:
{
  "memories": [
    {
      "category": "interest" | "hobby" | "ongoing_project" | "learning_preference",
      "memory": "short description",
      "confidence": 0.0
    }
  ]
}

Rules:
- Return at most 3 memories.
- Only include interests, hobbies, ongoing projects, or learning preferences.
- Do not include names, locations, schools, family details, health, trauma, secrets, or sensitive information.
- Do not treat one random mention as a strong interest.
- Use confidence between 0.1 and 0.9.
- Return {"memories": []} when there is not enough evidence.
`,
    input: safeMessages,
    max_output_tokens: 300,
  });

  try {
    const parsed = JSON.parse(response.output_text) as {
      memories?: MemoryCandidate[];
    };

    const memories = (parsed.memories || []).filter(
      (item) =>
        [
          "interest",
          "hobby",
          "ongoing_project",
          "learning_preference",
        ].includes(item.category) &&
        typeof item.memory === "string" &&
        item.memory.length > 0 &&
        typeof item.confidence === "number",
    );

    return Response.json({ memories: memories.slice(0, 3) });
  } catch {
    return Response.json({ memories: [] });
  }
}
