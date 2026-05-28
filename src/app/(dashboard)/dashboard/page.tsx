"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Analytics {
  totalContent: number;
  contentByStatus: Array<{ status: string; _count: { id: number } }>;
  aiUsage: { totalTokens: number; requestCount: number };
  upcomingSchedules: number;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    // In production, get workspaceId from session/context
    fetch("/api/analytics?workspaceId=demo")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, []);

  const stats = [
    {
      name: "Total Content",
      value: analytics?.totalContent || 0,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      name: "Scheduled",
      value: analytics?.upcomingSchedules || 0,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      name: "AI Requests",
      value: analytics?.aiUsage?.requestCount || 0,
      icon: Sparkles,
      color: "bg-purple-500",
    },
    {
      name: "Tokens Used",
      value: analytics?.aiUsage?.totalTokens?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/content"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="font-medium text-gray-700">Generate Content</span>
          </Link>
          <Link
            href="/calendar"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="font-medium text-gray-700">View Calendar</span>
          </Link>
          <Link
            href="/brands"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-700">Manage Brands</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
