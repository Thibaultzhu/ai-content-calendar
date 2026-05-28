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

  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, platform, accountName } = await req.json();

    if (!workspaceId || !platform || !accountName) {
      return NextResponse.json(
        { error: "workspaceId, platform, and accountName are required" },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.create({
      data: {
        workspaceId,
        platform,
        accountName,
        isConnected: true, // Mock connection
        accountId: `mock_${platform.toLowerCase()}_${Date.now().toString(36)}`,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
