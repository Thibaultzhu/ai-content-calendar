import { describe, it, expect, vi } from "vitest";
import { cn, formatDate, slugify } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conflicting tailwind classes", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", "end")).toBe("base end");
    });
  });

  describe("formatDate", () => {
    it("formats date strings correctly", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("formats Date objects correctly", () => {
      const result = formatDate(new Date("2024-06-01"));
      expect(result).toContain("Jun");
      expect(result).toContain("2024");
    });
  });

  describe("slugify", () => {
    it("converts text to slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(slugify("Hello! @World#")).toBe("hello-world");
    });

    it("handles multiple spaces", () => {
      expect(slugify("hello   world")).toBe("hello-world");
    });

    it("trims leading/trailing hyphens", () => {
      expect(slugify(" -hello world- ")).toBe("hello-world");
    });
  });
});
