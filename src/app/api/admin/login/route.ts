import { NextResponse } from "next/server";
import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin password is not configured on the server." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim() ?? "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
