"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface BrandProfile {
  id: string;
  name: string;
  tone: string | null;
  targetAudience: string | null;
  forbiddenWords: string[];
  productDescription: string | null;
  createdAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tone: "",
    targetAudience: "",
    forbiddenWords: "",
    productDescription: "",
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    fetch("/api/brands?workspaceId=demo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "demo",
          name: formData.name,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          forbiddenWords: formData.forbiddenWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
          productDescription: formData.productDescription,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          tone: "",
          targetAudience: "",
          forbiddenWords: "",
          productDescription: "",
        });
        fetchBrands();
      }
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brand Profiles</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Brand
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Brand Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name *
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
                Brand Tone / Voice
              </label>
              <input
                type="text"
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Professional, friendly, authoritative..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <textarea
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Tech-savvy millennials interested in productivity tools..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forbidden Words (comma-separated)
              </label>
              <input
                type="text"
                value={formData.forbiddenWords}
                onChange={(e) =>
                  setFormData({ ...formData, forbiddenWords: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cheap, discount, free..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Description
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productDescription: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="A SaaS platform that helps teams..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Brand
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

      {/* Brand List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {brand.name}
              </h3>
              <div className="flex gap-2">
                <button className="p-1 text-gray-400 hover:text-blue-600">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {brand.tone && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Tone:</span> {brand.tone}
              </p>
            )}
            {brand.targetAudience && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Audience:</span>{" "}
                {brand.targetAudience}
              </p>
            )}
            {brand.forbiddenWords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {brand.forbiddenWords.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {brands.length === 0 && !showForm && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No brand profiles yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
