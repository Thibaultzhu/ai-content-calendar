import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/ai";
import type { ContentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      workspaceId,
      brandProfileId,
      contentType,
      topic,
      customPrompt,
      language,
    } = await req.json();

    if (!workspaceId || !contentType) {
      return NextResponse.json(
        { error: "workspaceId and contentType are required" },
        { status: 400 }
      );
    }

    // Get brand profile if specified
    let brand = null;
    if (brandProfileId) {
      brand = await prisma.brandProfile.findUnique({
        where: { id: brandProfileId },
      });
    }

    const result = await generateContent({
      contentType: contentType as ContentType,
      brandName: brand?.name,
      brandTone: brand?.tone || undefined,
      targetAudience: brand?.targetAudience || undefined,
      forbiddenWords: brand?.forbiddenWords || [],
      productDescription: brand?.productDescription || undefined,
      topic,
      customPrompt,
      language,
    });

    // Log AI usage
    await prisma.aiUsageLog.create({
      data: {
        workspaceId,
        userId: session.user.id,
        contentType: contentType as ContentType,
        model: process.env.AI_MODEL || "gpt-4o-mini",
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    });

    return NextResponse.json({
      content: result.content,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
