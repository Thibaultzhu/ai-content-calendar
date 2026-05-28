import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const contentType = searchParams.get("contentType");

  const where: Record<string, unknown> = {};
  if (workspaceId) {
    where.OR = [{ workspaceId }, { isSystem: true }];
  } else {
    where.isSystem = true;
  }
  if (contentType) where.contentType = contentType;

  const templates = await prisma.promptTemplate.findMany({
    where,
    orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, name, description, contentType, prompt, variables } =
      await req.json();

    if (!workspaceId || !name || !contentType || !prompt) {
      return NextResponse.json(
        { error: "workspaceId, name, contentType, and prompt are required" },
        { status: 400 }
      );
    }

    const template = await prisma.promptTemplate.create({
      data: {
        workspaceId,
        name,
        description,
        contentType,
        prompt,
        variables: variables || [],
        isSystem: false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
