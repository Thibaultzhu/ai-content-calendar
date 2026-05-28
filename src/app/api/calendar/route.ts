import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { schedulePublish, cancelScheduledPublish } from "@/lib/queue";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    workspaceId,
    schedule: { isNot: null },
  };

  if (start && end) {
    where.schedule = {
      scheduledAt: {
        gte: new Date(start),
        lte: new Date(end),
      },
    };
  }

  const scheduledContent = await prisma.contentItem.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true } },
      brandProfile: { select: { id: true, name: true } },
      schedule: { include: { socialAccount: true } },
    },
    orderBy: { schedule: { scheduledAt: "asc" } },
  });

  return NextResponse.json(scheduledContent);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentItemId, socialAccountId, scheduledAt } = await req.json();

    if (!contentItemId || !scheduledAt) {
      return NextResponse.json(
        { error: "contentItemId and scheduledAt are required" },
        { status: 400 }
      );
    }

    const content = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Upsert schedule
    const schedule = await prisma.publishSchedule.upsert({
      where: { contentItemId },
      create: {
        contentItemId,
        socialAccountId,
        scheduledAt: new Date(scheduledAt),
      },
      update: {
        socialAccountId,
        scheduledAt: new Date(scheduledAt),
        publishedAt: null,
        failedAt: null,
        failReason: null,
      },
    });

    // Update content status
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "SCHEDULED" },
    });

    // Queue the publish job
    await schedulePublish(
      {
        contentItemId,
        scheduleId: schedule.id,
        platform: content.platform || "TWITTER",
        socialAccountId: socialAccountId || undefined,
      },
      new Date(scheduledAt)
    );

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Schedule creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentItemId, scheduledAt } = await req.json();

    if (!contentItemId || !scheduledAt) {
      return NextResponse.json(
        { error: "contentItemId and scheduledAt required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.publishSchedule.findUnique({
      where: { contentItemId },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Cancel existing job and reschedule
    await cancelScheduledPublish(schedule.id);

    const updated = await prisma.publishSchedule.update({
      where: { id: schedule.id },
      data: { scheduledAt: new Date(scheduledAt) },
    });

    const content = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    await schedulePublish(
      {
        contentItemId,
        scheduleId: schedule.id,
        platform: content?.platform || "TWITTER",
        socialAccountId: schedule.socialAccountId || undefined,
      },
      new Date(scheduledAt)
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Schedule update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
