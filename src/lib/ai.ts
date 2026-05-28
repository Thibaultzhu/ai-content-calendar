import OpenAI from "openai";
import { ContentType } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "sk-placeholder",
  baseURL: process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
});

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export interface GenerateContentParams {
  contentType: ContentType;
  brandName?: string;
  brandTone?: string;
  targetAudience?: string;
  forbiddenWords?: string[];
  productDescription?: string;
  topic?: string;
  customPrompt?: string;
  language?: string;
}

export interface AIEditParams {
  content: string;
  action: "rewrite" | "shorten" | "expand" | "translate";
  targetLanguage?: string;
  brandTone?: string;
}

const CONTENT_TYPE_PROMPTS: Record<ContentType, string> = {
  BLOG_TITLE:
    "Generate 5 compelling blog post titles that are SEO-friendly and engaging.",
  XIAOHONGSHU:
    "Write a Xiaohongshu (Little Red Book) post with emojis, hashtags, and engaging copy in Chinese style.",
  TWITTER:
    "Write a concise, engaging Twitter/X post within 280 characters. Include relevant hashtags.",
  LINKEDIN:
    "Write a professional LinkedIn post that is insightful and encourages engagement.",
  EMAIL:
    "Write compelling email marketing copy with a subject line, preview text, and body.",
  AD_COPY:
    "Write persuasive advertising copy with a headline, body, and call-to-action.",
};

export async function generateContent(
  params: GenerateContentParams
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const systemPrompt = buildSystemPrompt(params);
  const userPrompt = params.customPrompt || buildUserPrompt(params);

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "";
  const usage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
  };

  return { content, usage };
}

export async function editContent(
  params: AIEditParams
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const actionPrompts: Record<string, string> = {
    rewrite: `Rewrite the following content while maintaining the same meaning but improving clarity and engagement${params.brandTone ? `. Use a ${params.brandTone} tone` : ""}:\n\n${params.content}`,
    shorten: `Condense the following content to be more concise while keeping the key message:\n\n${params.content}`,
    expand: `Expand the following content with more details, examples, and depth while maintaining the same tone:\n\n${params.content}`,
    translate: `Translate the following content to ${params.targetLanguage || "English"}. Maintain the tone and style:\n\n${params.content}`,
  };

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional content editor. Return only the edited content without explanations.",
      },
      { role: "user", content: actionPrompts[params.action] },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "";
  const usage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
  };

  return { content, usage };
}

function buildSystemPrompt(params: GenerateContentParams): string {
  let prompt = `You are a professional content creator and copywriter.`;

  if (params.brandName) {
    prompt += ` You are writing for the brand "${params.brandName}".`;
  }
  if (params.brandTone) {
    prompt += ` The brand voice is: ${params.brandTone}.`;
  }
  if (params.targetAudience) {
    prompt += ` The target audience is: ${params.targetAudience}.`;
  }
  if (params.forbiddenWords && params.forbiddenWords.length > 0) {
    prompt += ` Never use these words: ${params.forbiddenWords.join(", ")}.`;
  }
  if (params.productDescription) {
    prompt += ` Product context: ${params.productDescription}.`;
  }
  if (params.language) {
    prompt += ` Write in ${params.language}.`;
  }

  return prompt;
}

function buildUserPrompt(params: GenerateContentParams): string {
  let prompt = CONTENT_TYPE_PROMPTS[params.contentType];

  if (params.topic) {
    prompt += `\n\nTopic/Subject: ${params.topic}`;
  }

  return prompt;
}

export { openai, MODEL };
