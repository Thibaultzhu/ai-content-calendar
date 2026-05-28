"use client";

import { useState, useEffect } from "react";
import { BarChart3, PieChart, TrendingUp, Zap } from "lucide-react";

interface AnalyticsData {
  totalContent: number;
  contentByType: Array<{ contentType: string; _count: { id: number } }>;
  contentByStatus: Array<{ status: string; _count: { id: number } }>;
  contentByPlatform: Array<{ platform: string; _count: { id: number } }>;
  aiUsage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
  };
  upcomingSchedules: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics?workspaceId=demo")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="flex justify-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Content</p>
              <p className="text-xl font-bold">{data.totalContent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-xl font-bold">{data.upcomingSchedules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Requests</p>
              <p className="text-xl font-bold">{data.aiUsage.requestCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PieChart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tokens Used</p>
              <p className="text-xl font-bold">
                {data.aiUsage.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Content by Type</h3>
          <div className="space-y-3">
            {data.contentByType.map((item) => (
              <div key={item.contentType} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {item.contentType.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">{item._count.id}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (item._count.id / data.totalContent) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.contentByType.length === 0 && (
              <p className="text-sm text-gray-500">No data yet.</p>
            )}
          </div>
        </div>

        {/* Content by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Content by Status
          </h3>
          <div className="space-y-3">
            {data.contentByStatus.map((item) => {
              const colors: Record<string, string> = {
                DRAFT: "bg-gray-400",
                SCHEDULED: "bg-blue-500",
                PUBLISHED: "bg-green-500",
                ARCHIVED: "bg-yellow-500",
              };
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.status}</span>
                      <span className="font-medium">{item._count.id}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[item.status] || "bg-gray-400"}`}
                        style={{
                          width: `${
                            (item._count.id / data.totalContent) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {data.contentByStatus.length === 0 && (
              <p className="text-sm text-gray-500">No data yet.</p>
            )}
          </div>
        </div>

        {/* AI Token Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">AI Token Usage</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Prompt Tokens</span>
              <span className="font-medium">
                {data.aiUsage.promptTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Tokens</span>
              <span className="font-medium">
                {data.aiUsage.completionTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="font-bold text-lg">
                {data.aiUsage.totalTokens.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Platform Distribution
          </h3>
          <div className="space-y-3">
            {data.contentByPlatform.map((item) => (
              <div key={item.platform} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.platform}</span>
                    <span className="font-medium">{item._count.id}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (item._count.id / data.totalContent) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.contentByPlatform.length === 0 && (
              <p className="text-sm text-gray-500">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
