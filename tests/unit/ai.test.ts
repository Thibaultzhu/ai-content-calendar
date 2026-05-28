import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock OpenAI
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "Generated content here" } }],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        }),
      },
    },
  })),
}));

describe("AI Content Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates content with correct structure", async () => {
    const { generateContent } = await import("@/lib/ai");

    const result = await generateContent({
      contentType: "TWITTER",
      topic: "AI productivity",
    });

    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("usage");
    expect(result.content).toBe("Generated content here");
    expect(result.usage.totalTokens).toBe(150);
  });

  it("edits content with rewrite action", async () => {
    const { editContent } = await import("@/lib/ai");

    const result = await editContent({
      content: "Original content",
      action: "rewrite",
    });

    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("usage");
    expect(typeof result.content).toBe("string");
  });

  it("edits content with shorten action", async () => {
    const { editContent } = await import("@/lib/ai");

    const result = await editContent({
      content: "This is a very long content that needs to be shortened.",
      action: "shorten",
    });

    expect(result).toHaveProperty("content");
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });

  it("edits content with translate action", async () => {
    const { editContent } = await import("@/lib/ai");

    const result = await editContent({
      content: "Hello world",
      action: "translate",
      targetLanguage: "Chinese",
    });

    expect(result).toHaveProperty("content");
  });
});
