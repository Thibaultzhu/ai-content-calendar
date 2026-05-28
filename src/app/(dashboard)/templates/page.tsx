"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Sparkles } from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  contentType: string;
  prompt: string;
  isSystem: boolean;
  variables: string[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contentType: "TWITTER",
    prompt: "",
    variables: "",
  });

  useEffect(() => {
    fetch("/api/templates?workspaceId=demo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "demo",
          ...formData,
          variables: formData.variables
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          description: "",
          contentType: "TWITTER",
          prompt: "",
          variables: "",
        });
        const data = await res.json();
        setTemplates([data, ...templates]);
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prompt Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Prompt Template</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) =>
                    setFormData({ ...formData, contentType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TWITTER">Twitter</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="XIAOHONGSHU">Xiaohongshu</option>
                  <option value="EMAIL">Email</option>
                  <option value="BLOG_TITLE">Blog Title</option>
                  <option value="AD_COPY">Ad Copy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) =>
                  setFormData({ ...formData, prompt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Write a {{contentType}} post about {{topic}} for {{audience}}..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables (comma-separated)
              </label>
              <input
                type="text"
                value={formData.variables}
                onChange={(e) =>
                  setFormData({ ...formData, variables: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="topic, audience, tone"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Template
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {template.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {template.isSystem && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    System
                  </span>
                )}
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {template.contentType.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-3 font-mono">
              {template.prompt.substring(0, 150)}
              {template.prompt.length > 150 ? "..." : ""}
            </p>

            {template.variables.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {template.variables.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No templates yet. System templates will appear after seeding.
          </div>
        )}
      </div>
    </div>
  );
}
