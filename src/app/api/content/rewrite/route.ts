import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { editContent } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, content, action, targetLanguage, brandTone } =
      await req.json();

    if (!workspaceId || !content || !action) {
      return NextResponse.json(
        { error: "workspaceId, content, and action are required" },
        { status: 400 }
      );
    }

    const validActions = ["rewrite", "shorten", "expand", "translate"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await editContent({
      content,
      action,
      targetLanguage,
      brandTone,
    });

    // Log AI usage
    await prisma.aiUsageLog.create({
      data: {
        workspaceId,
        userId: session.user.id,
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
    console.error("AI rewrite error:", error);
    return NextResponse.json(
      { error: "AI edit failed" },
      { status: 500 }
    );
  }
}
