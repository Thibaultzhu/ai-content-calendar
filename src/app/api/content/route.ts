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
  const status = searchParams.get("status");
  const contentType = searchParams.get("contentType");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { workspaceId };
  if (status) where.status = status;
  if (contentType) where.contentType = contentType;

  const contents = await prisma.contentItem.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      brandProfile: { select: { id: true, name: true } },
      schedule: true,
      _count: { select: { comments: true, approvals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, brandProfileId, title, body, contentType, platform } =
      await req.json();

    if (!workspaceId || !body || !contentType) {
      return NextResponse.json(
        { error: "workspaceId, body, and contentType are required" },
        { status: 400 }
      );
    }

    const content = await prisma.contentItem.create({
      data: {
        workspaceId,
        brandProfileId,
        authorId: session.user.id,
        title,
        body,
        contentType,
        platform,
        versions: {
          create: {
            version: 1,
            body,
            changeNote: "Initial version",
          },
        },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        versions: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "ContentItem",
        entityId: content.id,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Content creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
