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

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    contentItem: { workspaceId },
  };
  if (status) where.status = status;

  const approvals = await prisma.approvalRequest.findMany({
    where,
    include: {
      contentItem: {
        select: { id: true, title: true, body: true, contentType: true, status: true },
      },
      requester: { select: { id: true, name: true, email: true, image: true } },
      reviewer: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(approvals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentItemId, reviewerId } = await req.json();

    if (!contentItemId) {
      return NextResponse.json(
        { error: "contentItemId is required" },
        { status: 400 }
      );
    }

    const content = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const approval = await prisma.approvalRequest.create({
      data: {
        contentItemId,
        requesterId: session.user.id,
        reviewerId,
      },
      include: {
        contentItem: { select: { id: true, title: true, contentType: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error("Approval creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { approvalId, status, comment } = await req.json();

    if (!approvalId || !status) {
      return NextResponse.json(
        { error: "approvalId and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const approval = await prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status,
        reviewerId: session.user.id,
        comment,
        resolvedAt: new Date(),
      },
      include: {
        contentItem: true,
      },
    });

    // Update content status if approved
    if (status === "APPROVED") {
      await prisma.contentItem.update({
        where: { id: approval.contentItemId },
        data: { status: "SCHEDULED" },
      });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error("Approval update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
