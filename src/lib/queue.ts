import { Queue, Worker } from "bullmq";
import redis from "./redis";

export const publishQueue = new Queue("publish", {
  connection: redis as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

export interface PublishJobData {
  contentItemId: string;
  scheduleId: string;
  platform: string;
  socialAccountId?: string;
}

export async function schedulePublish(
  data: PublishJobData,
  scheduledAt: Date
): Promise<string> {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  const job = await publishQueue.add("publish-content", data, {
    delay,
    jobId: `publish-${data.scheduleId}`,
  });

  return job.id || "";
}

export async function cancelScheduledPublish(scheduleId: string): Promise<void> {
  const job = await publishQueue.getJob(`publish-${scheduleId}`);
  if (job) {
    await job.remove();
  }
}
