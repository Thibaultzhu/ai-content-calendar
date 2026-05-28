import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      email: "editor@example.com",
      name: "Content Editor",
      passwordHash,
    },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: "reviewer@example.com" },
    update: {},
    create: {
      email: "reviewer@example.com",
      name: "Content Reviewer",
      passwordHash,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-marketing" },
    update: {},
    create: {
      name: "Acme Marketing",
      slug: "acme-marketing",
      description: "Marketing team workspace for Acme Corp",
      members: {
        create: [
          { userId: admin.id, role: "OWNER" },
          { userId: editor.id, role: "EDITOR" },
          { userId: reviewer.id, role: "ADMIN" },
        ],
      },
    },
  });

  // Create brand profiles
  const techBrand = await prisma.brandProfile.create({
    data: {
      workspaceId: workspace.id,
      name: "Acme SaaS",
      tone: "Professional yet approachable, data-driven, innovative",
      targetAudience:
        "Tech-savvy B2B professionals aged 25-45, CTOs, engineering managers, and product leaders",
      forbiddenWords: ["cheap", "basic", "simple", "free", "guarantee"],
      productDescription:
        "Acme SaaS is an AI-powered project management platform that helps engineering teams ship faster with intelligent sprint planning, automated code reviews, and predictive analytics.",
    },
  });

  const lifestyleBrand = await prisma.brandProfile.create({
    data: {
      workspaceId: workspace.id,
      name: "Bloom Wellness",
      tone: "Warm, encouraging, holistic, mindful",
      targetAudience:
        "Health-conscious women aged 28-40, interested in yoga, meditation, and plant-based nutrition",
      forbiddenWords: ["diet", "skinny", "restriction", "guilt", "cheat"],
      productDescription:
        "Bloom Wellness offers premium organic supplements, guided meditation programs, and personalized wellness coaching to help you thrive from the inside out.",
    },
  });

  // Create prompt templates (system)
  const templates = await Promise.all([
    prisma.promptTemplate.create({
      data: {
        name: "Viral Twitter Thread",
        description: "Create an engaging Twitter thread that drives engagement",
        contentType: "TWITTER",
        prompt:
          "Write a Twitter/X thread (5-7 tweets) about {{topic}}. Start with a hook that stops the scroll. Use short sentences, line breaks, and end with a CTA. Include relevant emojis sparingly.",
        isSystem: true,
        variables: ["topic"],
      },
    }),
    prisma.promptTemplate.create({
      data: {
        name: "LinkedIn Thought Leadership",
        description: "Professional LinkedIn post for industry thought leadership",
        contentType: "LINKEDIN",
        prompt:
          "Write a LinkedIn post about {{topic}} from the perspective of a {{role}}. Include a personal anecdote or industry insight. Format with line breaks for readability. End with a question to encourage comments. Keep it under 1300 characters.",
        isSystem: true,
        variables: ["topic", "role"],
      },
    }),
    prisma.promptTemplate.create({
      data: {
        name: "Xiaohongshu Product Review",
        description: "Engaging Xiaohongshu post for product promotion",
        contentType: "XIAOHONGSHU",
        prompt:
          "用小红书的风格写一篇关于{{product}}的种草笔记。要求：1) 吸引人的标题带emoji 2) 真实体验分享 3) 使用小红书流行的表达方式 4) 加入相关话题标签 5) 字数300-500字",
        isSystem: true,
        variables: ["product"],
      },
    }),
    prisma.promptTemplate.create({
      data: {
        name: "Email Newsletter",
        description: "Weekly newsletter email with value-driven content",
        contentType: "EMAIL",
        prompt:
          "Write a newsletter email about {{topic}}. Include: Subject line (under 50 chars), Preview text (under 100 chars), Opening hook, 2-3 key insights or tips, CTA button text, and sign-off. Tone: {{tone}}.",
        isSystem: true,
        variables: ["topic", "tone"],
      },
    }),
    prisma.promptTemplate.create({
      data: {
        name: "SEO Blog Titles",
        description: "Generate SEO-optimized blog post titles",
        contentType: "BLOG_TITLE",
        prompt:
          "Generate 10 SEO-optimized blog post titles about {{topic}} targeting the keyword '{{keyword}}'. Mix formats: how-to, listicle, question, comparison, and data-driven. Each title should be 50-60 characters.",
        isSystem: true,
        variables: ["topic", "keyword"],
      },
    }),
    prisma.promptTemplate.create({
      data: {
        name: "Facebook Ad Copy",
        description: "High-converting Facebook/Meta ad copy",
        contentType: "AD_COPY",
        prompt:
          "Write 3 variations of Facebook ad copy for {{product}}. Target audience: {{audience}}. Each variation should include: Headline (25 chars max), Primary text (125 chars), Description (30 chars), and CTA suggestion. Focus on {{benefit}}.",
        isSystem: true,
        variables: ["product", "audience", "benefit"],
      },
    }),
  ]);

  // Create social accounts (mock)
  const twitterAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: "TWITTER",
      accountName: "@acme_official",
      accountId: "mock_twitter_acme",
      isConnected: true,
    },
  });

  const linkedinAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: "LINKEDIN",
      accountName: "Acme Corp",
      accountId: "mock_linkedin_acme",
      isConnected: true,
    },
  });

  await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: "XIAOHONGSHU",
      accountName: "Bloom健康生活",
      accountId: "mock_xhs_bloom",
      isConnected: true,
    },
  });

  // Create sample content
  const content1 = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      brandProfileId: techBrand.id,
      authorId: admin.id,
      title: "AI Sprint Planning Launch",
      body: "Excited to announce our new AI Sprint Planning feature! \ud83d\ude80\n\nAfter 6 months of development, we're bringing intelligent sprint estimation to engineering teams.\n\nWhat it does:\n\u2022 Analyzes historical velocity\n\u2022 Suggests optimal task distribution\n\u2022 Predicts delivery dates with 92% accuracy\n\nEarly access starting next Monday. DM for invite.\n\n#ProductLaunch #AI #Engineering",
      contentType: "TWITTER",
      status: "SCHEDULED",
      platform: "TWITTER",
      versions: {
        create: {
          version: 1,
          body: "Excited to announce our new AI Sprint Planning feature! \ud83d\ude80\n\nAfter 6 months of development, we're bringing intelligent sprint estimation to engineering teams.\n\nWhat it does:\n\u2022 Analyzes historical velocity\n\u2022 Suggests optimal task distribution\n\u2022 Predicts delivery dates with 92% accuracy\n\nEarly access starting next Monday. DM for invite.\n\n#ProductLaunch #AI #Engineering",
          changeNote: "Initial version",
        },
      },
    },
  });

  const content2 = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      brandProfileId: techBrand.id,
      authorId: editor.id,
      title: "Engineering Productivity Report",
      body: "I've spent 10 years leading engineering teams. Here's what I've learned about productivity:\n\n1. Meetings kill flow state. Batch them on specific days.\n2. Automate code reviews for style \u2014 save human reviews for architecture.\n3. Sprint velocity is a lagging indicator. Track cycle time instead.\n4. The best engineers aren't the fastest coders \u2014 they're the best communicators.\n5. Technical debt isn't bad. Unmanaged technical debt is.\n\nWhat's your top engineering productivity tip? Let me know in the comments.\n\n#EngineeringLeadership #Productivity #TechManagement",
      contentType: "LINKEDIN",
      status: "DRAFT",
      platform: "LINKEDIN",
      versions: {
        create: {
          version: 1,
          body: "I've spent 10 years leading engineering teams...",
          changeNote: "Initial draft",
        },
      },
    },
  });

  const content3 = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      brandProfileId: lifestyleBrand.id,
      authorId: editor.id,
      title: "晨间冐想分享",
      body: "\ud83c\udf05 坚持晨间冐想30天后，我的变化太大了！\n\n姐妹们，我真的后悔没有早点开始！\n\n从一开始坐不住5分钟，到现在每天20分钟的正念冐想，整个人的状态完全不一样了：\n\n\u2728 焦虑感明显减少\n\u2728 睡眠质量提升\n\u2728 工作时更专注\n\u2728 对周围人更有耐心\n\n我用的是Bloom的冐想课程，里面有专门的晨间系列，从5分钟开始循序渐进，特别适合新手入门～\n\n分享我的小tips：\n1\ufe0f\u20e3 固定时间，起床后第一件事\n2\ufe0f\u20e3 找一个安静的角落\n3\ufe0f\u20e3 不要追求\"什么都不想\"，允许念头来去\n\n#冐想 #正念 #自我成长 #晨间习惯 #Bloom健康",
      contentType: "XIAOHONGSHU",
      status: "PUBLISHED",
      platform: "XIAOHONGSHU",
      versions: {
        create: {
          version: 1,
          body: "\ud83c\udf05 坚持晨间冐想30天后...",
          changeNote: "Published version",
        },
      },
    },
  });

  const content4 = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      brandProfileId: techBrand.id,
      authorId: admin.id,
      title: "Product Update Email",
      body: "Subject: Your team just got 3x faster at code review \u26a1\n\nHi {{name}},\n\nWe shipped something big this week.\n\nOur new AI Code Review feature analyzes pull requests in seconds \u2014 catching bugs, suggesting improvements, and enforcing your team's coding standards automatically.\n\nWhat's new:\n\u2022 Instant PR summaries\n\u2022 Auto-detection of security vulnerabilities\n\u2022 Custom rule configuration\n\u2022 Slack integration for review notifications\n\nTeams in our beta reduced review cycle time by 68%.\n\n[Try it free for 14 days \u2192]\n\nHappy shipping,\nThe Acme Team",
      contentType: "EMAIL",
      status: "DRAFT",
      platform: "EMAIL",
      versions: {
        create: {
          version: 1,
          body: "Subject: Your team just got 3x faster at code review \u26a1...",
          changeNote: "Initial draft",
        },
      },
    },
  });

  // Create schedules
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.publishSchedule.create({
    data: {
      contentItemId: content1.id,
      socialAccountId: twitterAccount.id,
      scheduledAt: tomorrow,
    },
  });

  // Create approval requests
  await prisma.approvalRequest.create({
    data: {
      contentItemId: content2.id,
      requesterId: editor.id,
      reviewerId: reviewer.id,
      status: "PENDING",
    },
  });

  await prisma.approvalRequest.create({
    data: {
      contentItemId: content4.id,
      requesterId: admin.id,
      reviewerId: reviewer.id,
      status: "APPROVED",
      comment: "Great copy! Ready to send.",
      resolvedAt: new Date(),
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      contentItemId: content1.id,
      authorId: reviewer.id,
      body: "Love the emoji usage! Maybe add a link to the waitlist?",
    },
  });

  await prisma.comment.create({
    data: {
      contentItemId: content2.id,
      authorId: admin.id,
      body: "Can we add a stat about our platform specifically? Like the 92% accuracy number.",
    },
  });

  // Create AI usage logs
  const usageDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  for (const date of usageDates) {
    const requests = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < requests; i++) {
      await prisma.aiUsageLog.create({
        data: {
          workspaceId: workspace.id,
          userId: [admin.id, editor.id][Math.floor(Math.random() * 2)],
          contentType: ["TWITTER", "LINKEDIN", "EMAIL", "XIAOHONGSHU"][
            Math.floor(Math.random() * 4)
          ] as any,
          model: "gpt-4o-mini",
          promptTokens: Math.floor(Math.random() * 500) + 100,
          completionTokens: Math.floor(Math.random() * 1000) + 200,
          totalTokens: Math.floor(Math.random() * 1500) + 300,
          createdAt: date,
        },
      });
    }
  }

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: admin.id,
        action: "CREATE",
        entityType: "BrandProfile",
        entityId: techBrand.id,
      },
      {
        workspaceId: workspace.id,
        userId: admin.id,
        action: "CREATE",
        entityType: "ContentItem",
        entityId: content1.id,
      },
      {
        workspaceId: workspace.id,
        userId: editor.id,
        action: "CREATE",
        entityType: "ContentItem",
        entityId: content2.id,
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("\nTest accounts:");
  console.log("  admin@example.com / password123 (Owner)");
  console.log("  editor@example.com / password123 (Editor)");
  console.log("  reviewer@example.com / password123 (Admin/Reviewer)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
