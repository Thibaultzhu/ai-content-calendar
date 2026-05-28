import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const content = await prisma.contentItem.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      brandProfile: true,
      versions: { orderBy: { version: "desc" } },
      schedule: { include: { socialAccount: true } },
      approvals: {
        include: {
          requester: { select: { id: true, name: true } },
          reviewer: { select: { id: true, name: true } },
        },
      },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(content);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await req.json();

  const existing = await prisma.contentItem.findUnique({
    where: { id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Create new version if body changed
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.platform !== undefined) updateData.platform = updates.platform;

  if (updates.body !== undefined && updates.body !== existing.body) {
    const nextVersion = (existing.versions[0]?.version || 0) + 1;
    await prisma.contentVersion.create({
      data: {
        contentItemId: id,
        version: nextVersion,
        body: updates.body,
        changeNote: updates.changeNote || `Version ${nextVersion}`,
      },
    });
    updateData.body = updates.body;
  }

  const content = await prisma.contentItem.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
      versions: { orderBy: { version: "desc" }, take: 5 },
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: existing.workspaceId,
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ContentItem",
      entityId: id,
      metadata: { fields: Object.keys(updates) },
    },
  });

  return NextResponse.json(content);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const content = await prisma.contentItem.findUnique({ where: { id } });
  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contentItem.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      workspaceId: content.workspaceId,
      userId: session.user.id,
      action: "DELETE",
      entityType: "ContentItem",
      entityId: id,
    },
  });

  return NextResponse.json({ success: true });
}
