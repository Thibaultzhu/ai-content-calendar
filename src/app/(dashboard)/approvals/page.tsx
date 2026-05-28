"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Send } from "lucide-react";

interface ApprovalRequest {
  id: string;
  status: string;
  comment: string | null;
  createdAt: string;
  resolvedAt: string | null;
  contentItem: {
    id: string;
    title: string | null;
    body: string;
    contentType: string;
    status: string;
  };
  requester: { id: string; name: string | null; email: string };
  reviewer: { id: string; name: string | null } | null;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-500",
  APPROVED: "text-green-500",
  REJECTED: "text-red-500",
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams({ workspaceId: "demo" });
    if (filter !== "all") params.append("status", filter);

    fetch(`/api/approvals?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setApprovals(data);
      })
      .catch(console.error);
  }, [filter]);

  const handleAction = async (approvalId: string, status: string) => {
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, status }),
      });

      if (res.ok) {
        setApprovals((prev) =>
          prev.map((a) =>
            a.id === approvalId ? { ...a, status, resolvedAt: new Date().toISOString() } : a
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <div className="flex gap-2">
          {["all", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => {
          const Icon = STATUS_ICONS[approval.status] || Clock;
          return (
            <div
              key={approval.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-5 w-5 mt-0.5 ${
                      STATUS_COLORS[approval.status] || ""
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {approval.contentItem.title ||
                        approval.contentItem.body.substring(0, 60)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Requested by{" "}
                      {approval.requester.name || approval.requester.email} on{" "}
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {approval.contentItem.contentType.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {approval.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(approval.id, "APPROVED")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(approval.id, "REJECTED")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {approval.comment && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {approval.comment}
                </div>
              )}
            </div>
          );
        })}

        {approvals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No approval requests found.
          </div>
        )}
      </div>
    </div>
  );
}
