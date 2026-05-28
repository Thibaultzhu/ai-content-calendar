"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface ScheduledContent {
  id: string;
  title: string | null;
  body: string;
  contentType: string;
  status: string;
  schedule: {
    id: string;
    scheduledAt: string;
    publishedAt: string | null;
  } | null;
  brandProfile: { name: string } | null;
}

const TYPE_COLORS: Record<string, string> = {
  TWITTER: "bg-blue-100 border-blue-300 text-blue-800",
  LINKEDIN: "bg-indigo-100 border-indigo-300 text-indigo-800",
  XIAOHONGSHU: "bg-red-100 border-red-300 text-red-800",
  EMAIL: "bg-green-100 border-green-300 text-green-800",
  BLOG_TITLE: "bg-yellow-100 border-yellow-300 text-yellow-800",
  AD_COPY: "bg-purple-100 border-purple-300 text-purple-800",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(
    []
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    fetch(
      `/api/calendar?workspaceId=demo&start=${start.toISOString()}&end=${end.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setScheduledContent(data);
      })
      .catch(console.error);
  }, [currentMonth]);

  const handleDrop = async (date: Date, contentId: string) => {
    try {
      await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentItemId: contentId,
          scheduledAt: date.toISOString(),
        }),
      });

      // Refresh
      setScheduledContent((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? {
                ...item,
                schedule: {
                  ...item.schedule!,
                  scheduledAt: date.toISOString(),
                },
              }
            : item
        )
      );
    } catch (error) {
      console.error("Reschedule error:", error);
    }
    setDraggedItem(null);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];
    let day = calStart;

    while (day <= calEnd) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayContent = scheduledContent.filter(
          (item) =>
            item.schedule &&
            isSameDay(new Date(item.schedule.scheduledAt), currentDay)
        );

        days.push(
          <div
            key={day.toISOString()}
            className={`min-h-[120px] border border-gray-100 p-1 ${
              !isSameMonth(day, monthStart) ? "bg-gray-50" : "bg-white"
            } ${isToday(day) ? "ring-2 ring-blue-500 ring-inset" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleDrop(currentDay, draggedItem);
              }
            }}
          >
            <span
              className={`text-xs font-medium ${
                isToday(day)
                  ? "text-blue-600"
                  : !isSameMonth(day, monthStart)
                  ? "text-gray-400"
                  : "text-gray-700"
              }`}
            >
              {format(day, "d")}
            </span>
            <div className="space-y-1 mt-1">
              {dayContent.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedItem(item.id)}
                  className={`px-1.5 py-0.5 text-xs rounded border cursor-move truncate ${
                    TYPE_COLORS[item.contentType] || "bg-gray-100"
                  }`}
                >
                  {item.title || item.body.substring(0, 20)}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {renderCalendar()}
      </div>
    </div>
  );
}
