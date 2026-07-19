import { NextResponse } from "next/server";
import { readPortfolioContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function GET() {
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
