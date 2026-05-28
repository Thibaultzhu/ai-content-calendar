"use client";

import { useState, useEffect } from "react";
import { Plus, Wifi, WifiOff } from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isConnected: boolean;
  createdAt: string;
}

const PLATFORMS = [
  "TWITTER",
  "LINKEDIN",
  "XIAOHONGSHU",
  "INSTAGRAM",
  "FACEBOOK",
  "WECHAT",
  "EMAIL",
];

const PLATFORM_COLORS: Record<string, string> = {
  TWITTER: "bg-blue-500",
  LINKEDIN: "bg-blue-700",
  XIAOHONGSHU: "bg-red-500",
  INSTAGRAM: "bg-pink-500",
  FACEBOOK: "bg-blue-600",
  WECHAT: "bg-green-500",
  EMAIL: "bg-gray-500",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: "TWITTER",
    accountName: "",
  });

  useEffect(() => {
    fetch("/api/accounts?workspaceId=demo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: "demo", ...formData }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccounts([data, ...accounts]);
        setShowForm(false);
        setFormData({ platform: "TWITTER", accountName: "" });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Connect Account
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          Social account connections are currently in mock mode. Real OAuth integrations are reserved for production deployment.
        </p>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Connect Account (Mock)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@username"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Connect (Mock)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  PLATFORM_COLORS[account.platform] || "bg-gray-500"
                }`}
              >
                {account.platform.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {account.accountName}
                </h3>
                <p className="text-sm text-gray-500">{account.platform}</p>
              </div>
              {account.isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        ))}

        {accounts.length === 0 && !showForm && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No accounts connected. Add one to start scheduling.
          </div>
        )}
      </div>
    </div>
  );
}
