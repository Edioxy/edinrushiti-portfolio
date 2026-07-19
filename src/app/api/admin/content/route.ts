import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { readPortfolioContent, savePortfolioContent } from "@/lib/content-store";
import { enrichContentThumbnails } from "@/lib/social-thumbnail";
import { normalizeContent, type PortfolioContentFile } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await readPortfolioContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load content" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PortfolioContentFile;
    const normalized = normalizeContent(body);
    const enriched = await enrichContentThumbnails(normalized);
    const saved = await savePortfolioContent(enriched);

    return NextResponse.json({
      ok: true,
      content: saved,
      message: process.env.GITHUB_TOKEN
        ? "Saved. Your live site updates in about 1–2 minutes."
        : "Saved locally.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save content" },
      { status: 500 },
    );
  }
}
