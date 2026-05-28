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

  const brands = await prisma.brandProfile.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, name, tone, targetAudience, forbiddenWords, productDescription } =
      await req.json();

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!member) {
      return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
    }

    const brand = await prisma.brandProfile.create({
      data: {
        workspaceId,
        name,
        tone,
        targetAudience,
        forbiddenWords: forbiddenWords || [],
        productDescription,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "BrandProfile",
        entityId: brand.id,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Brand creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
