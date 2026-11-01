import OpenAI from "openai";

const openai = new OpenAI();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MemoryCandidate = {
  memory_key: string;
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
    model: process.env.OPENAI_MEMORY_MODEL || "gpt-6-luna",
    instructions: `
You identify only safe, useful, non-sensitive long-term preferences from a child's conversation.

Return JSON only in this exact shape:
{
  "memories": [
    {
      "memory_key": "short stable lowercase key such as iphone, space, drawing",
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
- Use the same memory_key for closely related descriptions across conversations.
- Keep memory_key lowercase and short.
- Return {"memories": []} when there is not enough evidence.
`,
    input: safeMessages,
    max_output_tokens: 300,
  });

  try {
    const parsed = JSON.parse(response.output_text) as {
      memories?: MemoryCandidate[];
    };

    const allowedCategories = [
      "interest",
      "hobby",
      "ongoing_project",
      "learning_preference",
    ];

    const memories = (parsed.memories || [])
      .filter(
        (item) =>
          typeof item.memory_key === "string" &&
          item.memory_key.trim().length > 0 &&
          allowedCategories.includes(item.category) &&
          typeof item.memory === "string" &&
          item.memory.trim().length > 0 &&
          typeof item.confidence === "number" &&
          item.confidence >= 0.1 &&
          item.confidence <= 0.9,
      )
      .map((item) => ({
        memory_key: item.memory_key
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, ""),
        category: item.category,
        memory: item.memory.trim(),
        confidence: item.confidence,
      }))
      .slice(0, 3);

    return Response.json({ memories });
  } catch {
    return Response.json({ memories: [] });
  }
}
