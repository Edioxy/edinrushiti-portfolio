import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "edin-admin-session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function createSessionToken() {
  const password = getAdminPassword();
  if (!password) return null;

  return createHmac("sha256", password).update("edin-admin-authenticated").digest("hex");
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const token = createSessionToken();
  if (!token) return false;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated() {
  const token = createSessionToken();
  if (!token) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!session) return false;

  const a = Buffer.from(session);
  const b = Buffer.from(token);

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
