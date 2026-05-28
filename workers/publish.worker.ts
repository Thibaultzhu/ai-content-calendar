import { Worker } from "bullmq";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

interface PublishJobData {
  contentItemId: string;
  scheduleId: string;
  platform: string;
  socialAccountId?: string;
}

const worker = new Worker<PublishJobData>(
  "publish",
  async (job: any) => {
    console.log(`[Publish Worker] Processing job ${job.id}`, job.data);

    const { contentItemId, scheduleId, platform, socialAccountId } = job.data;

    // Simulate publishing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In production, this would:
    // 1. Fetch the content from DB
    // 2. Call the platform's API (Twitter, LinkedIn, etc.)
    // 3. Update the publish schedule with success/failure
    // 4. Create an audit log entry

    console.log(
      `[Publish Worker] Successfully published content ${contentItemId} to ${platform}`
    );

    // Mock: Update schedule in DB
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      await prisma.publishSchedule.update({
        where: { id: scheduleId },
        data: { publishedAt: new Date() },
      });

      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: { status: "PUBLISHED" },
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error("[Publish Worker] DB update failed:", error);
      throw error;
    }

    return { success: true, publishedAt: new Date().toISOString() };
  },
  {
    connection: redis as any,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Publish Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Publish Worker] Job ${job?.id} failed:`, err.message);
});

console.log("[Publish Worker] Started and listening for jobs...");
