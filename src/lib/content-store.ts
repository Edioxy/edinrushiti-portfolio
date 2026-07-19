import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
  CONTENT_FILE_PATH,
  normalizeContent,
  type PortfolioContentFile,
} from "@/lib/content-types";

const DEFAULT_REPO = "Edioxy/edinrushiti-portfolio";

function getRepoSlug() {
  return process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
}

function getGithubToken() {
  return process.env.GITHUB_TOKEN?.trim() ?? "";
}

function getLocalContentPath() {
  return path.join(process.cwd(), CONTENT_FILE_PATH);
}

async function readLocalContentFile(): Promise<PortfolioContentFile> {
  const raw = await readFile(getLocalContentPath(), "utf8");
  return normalizeContent(JSON.parse(raw) as PortfolioContentFile);
}

async function writeLocalContentFile(content: PortfolioContentFile) {
  await writeFile(getLocalContentPath(), `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

async function readGithubContentFile(): Promise<{
  content: PortfolioContentFile;
  sha?: string;
}> {
  const token = getGithubToken();
  const repo = getRepoSlug();

  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${CONTENT_FILE_PATH}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub read failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    content?: string;
    sha?: string;
  };

  const decoded = Buffer.from(payload.content ?? "", "base64").toString("utf8");
  return {
    content: normalizeContent(JSON.parse(decoded) as PortfolioContentFile),
    sha: payload.sha,
  };
}

async function writeGithubContentFile(content: PortfolioContentFile, sha?: string) {
  const token = getGithubToken();
  const repo = getRepoSlug();
  const encoded = Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${CONTENT_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update portfolio content via admin panel",
        content: encoded,
        sha,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub save failed (${response.status}): ${error}`);
  }
}

export async function readPortfolioContent(): Promise<PortfolioContentFile> {
  if (getGithubToken()) {
    try {
      const { content } = await readGithubContentFile();
      return content;
    } catch {
      // Fall back to local file if GitHub is unavailable during build/dev.
    }
  }

  return readLocalContentFile();
}

export async function savePortfolioContent(content: PortfolioContentFile) {
  const normalized = normalizeContent(content);

  if (getGithubToken()) {
    const current = await readGithubContentFile();
    await writeGithubContentFile(normalized, current.sha);
    return normalized;
  }

  if (process.env.NODE_ENV === "development") {
    await writeLocalContentFile(normalized);
    return normalized;
  }

  throw new Error(
    "Saving requires GITHUB_TOKEN in production. Add it in Vercel → Settings → Environment Variables.",
  );
}
