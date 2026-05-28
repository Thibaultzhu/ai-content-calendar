"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles, Filter } from "lucide-react";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string | null;
  body: string;
  contentType: string;
  status: string;
  platform: string | null;
  createdAt: string;
  author: { name: string | null; email: string };
  brandProfile: { name: string } | null;
  _count: { comments: number; approvals: number };
}

const CONTENT_TYPES = [
  "BLOG_TITLE",
  "XIAOHONGSHU",
  "TWITTER",
  "LINKEDIN",
  "EMAIL",
  "AD_COPY",
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-yellow-100 text-yellow-700",
};

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({
    contentType: "TWITTER",
    topic: "",
    language: "English",
  });
  const [generatedContent, setGeneratedContent] = useState("");

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = () => {
    fetch("/api/content?workspaceId=demo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setContents(data);
      })
      .catch(console.error);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedContent("");

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "demo",
          contentType: genForm.contentType,
          topic: genForm.topic,
          language: genForm.language,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setGeneratedContent(data.content);
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const saveGeneratedContent = async () => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "demo",
          title: genForm.topic || `${genForm.contentType} content`,
          body: generatedContent,
          contentType: genForm.contentType,
        }),
      });

      if (res.ok) {
        setShowGenerator(false);
        setGeneratedContent("");
        fetchContents();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" />
            New Content
          </button>
        </div>
      </div>

      {/* AI Generator */}
      {showGenerator && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Content Generator
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={genForm.contentType}
                  onChange={(e) =>
                    setGenForm({ ...genForm, contentType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={genForm.topic}
                  onChange={(e) =>
                    setGenForm({ ...genForm, topic: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter topic or subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={genForm.language}
                  onChange={(e) =>
                    setGenForm({ ...genForm, language: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Content"}
            </button>
          </form>

          {generatedContent && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">
                  Generated Content
                </span>
                <button
                  onClick={saveGeneratedContent}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                >
                  Save as Draft
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-800 text-sm">
                {generatedContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contents.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/content/${item.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {item.title || item.body.substring(0, 50) + "..."}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.contentType.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[item.status] || ""
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.author.name || item.author.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {contents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No content yet. Use AI Generate to create your first piece.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
