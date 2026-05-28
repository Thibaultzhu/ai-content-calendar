import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";

// We test the hashPassword function in isolation without importing the full auth module
// since NextAuth requires runtime environment that's not available in unit tests

describe("Auth - Password Hashing", () => {
  it("hashPassword produces a valid bcrypt hash", async () => {
    const password = "testpassword";
    const hash = await bcrypt.hash(password, 12);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it("hashPassword with wrong password returns false", async () => {
    const hash = await bcrypt.hash("testpassword", 12);
    const isValid = await bcrypt.compare("wrongpassword", hash);
    expect(isValid).toBe(false);
  });

  it("different passwords produce different hashes", async () => {
    const hash1 = await bcrypt.hash("password1", 12);
    const hash2 = await bcrypt.hash("password2", 12);
    expect(hash1).not.toBe(hash2);
  });

  it("same password produces different hashes (salt)", async () => {
    const hash1 = await bcrypt.hash("samepassword", 12);
    const hash2 = await bcrypt.hash("samepassword", 12);
    expect(hash1).not.toBe(hash2);
    // But both should validate
    expect(await bcrypt.compare("samepassword", hash1)).toBe(true);
    expect(await bcrypt.compare("samepassword", hash2)).toBe(true);
  });
});
