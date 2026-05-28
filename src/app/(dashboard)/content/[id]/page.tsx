"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Save, Sparkles, Languages, Minimize2, Maximize2 } from "lucide-react";
import Link from "next/link";

interface ContentDetail {
  id: string;
  title: string | null;
  body: string;
  contentType: string;
  status: string;
  platform: string | null;
  versions: Array<{ id: string; version: number; body: string; createdAt: string }>;
  comments: Array<{
    id: string;
    body: string;
    author: { name: string | null };
    createdAt: string;
  }>;
}

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/content/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(data);
        setEditBody(data.body);
        setEditTitle(data.title || "");
      })
      .catch(console.error);
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, body: editBody }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAiEdit = async (action: string) => {
    setAiAction(action);
    try {
      const res = await fetch("/api/content/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "demo",
          content: editBody,
          action,
          targetLanguage: action === "translate" ? "Chinese" : undefined,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setEditBody(data.content);
      }
    } finally {
      setAiAction(null);
    }
  };

  if (!content) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/content"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-bold border-none outline-none mb-4 placeholder-gray-400"
              placeholder="Content title..."
            />

            {/* AI Actions */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={() => handleAiEdit("rewrite")}
                disabled={!!aiAction}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiAction === "rewrite" ? "..." : "Rewrite"}
              </button>
              <button
                onClick={() => handleAiEdit("shorten")}
                disabled={!!aiAction}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                {aiAction === "shorten" ? "..." : "Shorten"}
              </button>
              <button
                onClick={() => handleAiEdit("expand")}
                disabled={!!aiAction}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                {aiAction === "expand" ? "..." : "Expand"}
              </button>
              <button
                onClick={() => handleAiEdit("translate")}
                disabled={!!aiAction}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition disabled:opacity-50"
              >
                <Languages className="h-3.5 w-3.5" />
                {aiAction === "translate" ? "..." : "Translate"}
              </button>
            </div>

            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full min-h-[300px] border-none outline-none resize-none text-gray-800"
              placeholder="Write your content here..."
            />

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">
                  {content.contentType.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">{content.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Versions</span>
                <span className="font-medium">{content.versions.length}</span>
              </div>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Versions</h3>
            <div className="space-y-2">
              {content.versions.slice(0, 5).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setEditBody(v.body)}
                  className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="font-medium">v{v.version}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
            {content.comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {content.comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{c.author.name}</span>
                    <p className="text-gray-600 mt-1">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
