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

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  // Content count by type
  const contentByType = await prisma.contentItem.groupBy({
    by: ["contentType"],
    where: { workspaceId },
    _count: { id: true },
  });

  // Content count by status
  const contentByStatus = await prisma.contentItem.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: { id: true },
  });

  // Platform distribution
  const contentByPlatform = await prisma.contentItem.groupBy({
    by: ["platform"],
    where: { workspaceId, platform: { not: null } },
    _count: { id: true },
  });

  // AI token usage (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const aiUsage = await prisma.aiUsageLog.aggregate({
    where: {
      workspaceId,
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: {
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
    },
    _count: { id: true },
  });

  // Daily AI usage for chart
  const dailyUsage = await prisma.aiUsageLog.groupBy({
    by: ["createdAt"],
    where: {
      workspaceId,
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: { totalTokens: true },
    orderBy: { createdAt: "asc" },
  });

  // Upcoming schedules
  const upcomingSchedules = await prisma.publishSchedule.count({
    where: {
      contentItem: { workspaceId },
      scheduledAt: { gte: new Date() },
      publishedAt: null,
    },
  });

  // Total content count
  const totalContent = await prisma.contentItem.count({
    where: { workspaceId },
  });

  return NextResponse.json({
    totalContent,
    contentByType,
    contentByStatus,
    contentByPlatform,
    aiUsage: {
      totalTokens: aiUsage._sum.totalTokens || 0,
      promptTokens: aiUsage._sum.promptTokens || 0,
      completionTokens: aiUsage._sum.completionTokens || 0,
      requestCount: aiUsage._count.id,
    },
    dailyUsage,
    upcomingSchedules,
  });
}
