"use client";

import {
  ExternalLink,
  GripVertical,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createEmptyPortfolioItem,
  createEmptyUgcItem,
  DEFAULT_SETTINGS,
  type PortfolioContentFile,
  type RawPortfolioItem,
  type RawUgcItem,
  type SiteSettings,
} from "@/lib/content-types";

type Tab = "portfolio" | "ugc" | "settings";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [content, setContent] = useState<PortfolioContentFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/content");
      if (!response.ok) throw new Error("Could not load admin content.");
      const data = (await response.json()) as PortfolioContentFile;
      setContent({
        ...data,
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveContent() {
    if (!content) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        content?: PortfolioContentFile;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Save failed.");
      }

      if (payload.content) {
        setContent(payload.content);
      }

      setMessage(payload.message ?? "Saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  function updatePortfolio(index: number, patch: Partial<RawPortfolioItem>) {
    if (!content) return;

    setContent({
      ...content,
      portfolio: content.portfolio.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function updateUgc(index: number, patch: Partial<RawUgcItem>) {
    if (!content) return;

    setContent({
      ...content,
      ugc: content.ugc.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function updateSettings(patch: Partial<SiteSettings>) {
    if (!content) return;

    setContent({
      ...content,
      settings: { ...DEFAULT_SETTINGS, ...content.settings, ...patch },
    });
  }

  function removePortfolio(index: number) {
    if (!content) return;
    setContent({
      ...content,
      portfolio: content.portfolio.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function removeUgc(index: number) {
    if (!content) return;
    setContent({
      ...content,
      ugc: content.ugc.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white/60">
        Loading admin panel…
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white/60">
        {error || "Unable to load content."}
      </div>
    );
  }

  const settings = { ...DEFAULT_SETTINGS, ...content.settings };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-white/35 uppercase">Portfolio Admin</p>
            <h1 className="text-lg font-medium">Manage your site content</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white sm:inline-flex"
            >
              View Site
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => void saveContent()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-opacity disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Log out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {(message || error) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {([
            ["portfolio", "Commercial Work"],
            ["ugc", "UGC Edits"],
            ["settings", "Contact & Socials"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                tab === value
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "portfolio" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/45">
                Paste a YouTube or Vimeo link. Thumbnail is optional for YouTube.
              </p>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    portfolio: [...content.portfolio, createEmptyPortfolioItem()],
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add Video
              </button>
            </div>

            {content.portfolio.map((item, index) => (
              <EditorCard
                key={`portfolio-${index}`}
                title={`Portfolio #${index + 1}`}
                onRemove={() => removePortfolio(index)}
              >
                <Field label="Title">
                  <Input
                    value={item.title}
                    onChange={(value) => updatePortfolio(index, { title: value })}
                  />
                </Field>
                <Field label="Category">
                  <Input
                    value={item.category}
                    onChange={(value) => updatePortfolio(index, { category: value })}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={item.description}
                    onChange={(value) => updatePortfolio(index, { description: value })}
                  />
                </Field>
                <Field label="Video URL (YouTube, Vimeo, or /videos/file.mp4)">
                  <Input
                    value={item.video ?? ""}
                    onChange={(value) => updatePortfolio(index, { video: value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </Field>
                <Field label="Thumbnail URL (optional)">
                  <Input
                    value={item.thumbnail ?? ""}
                    onChange={(value) => updatePortfolio(index, { thumbnail: value })}
                    placeholder="/thumbnails/project.jpg"
                  />
                </Field>
              </EditorCard>
            ))}
          </section>
        )}

        {tab === "ugc" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/45">Vertical 9:16 edits for your UGC section.</p>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    ugc: [...content.ugc, createEmptyUgcItem()],
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add UGC
              </button>
            </div>

            {content.ugc.map((item, index) => (
              <EditorCard
                key={`ugc-${index}`}
                title={`UGC #${index + 1}`}
                onRemove={() => removeUgc(index)}
              >
                <Field label="Title">
                  <Input
                    value={item.title}
                    onChange={(value) => updateUgc(index, { title: value })}
                  />
                </Field>
                <Field label="Brand / Client">
                  <Input
                    value={item.brand ?? ""}
                    onChange={(value) => updateUgc(index, { brand: value })}
                  />
                </Field>
                <Field label="Video URL">
                  <Input
                    value={item.video ?? ""}
                    onChange={(value) => updateUgc(index, { video: value })}
                    placeholder="https://youtu.be/..."
                  />
                </Field>
                <Field label="Thumbnail URL (optional)">
                  <Input
                    value={item.thumbnail ?? ""}
                    onChange={(value) => updateUgc(index, { thumbnail: value })}
                  />
                </Field>
              </EditorCard>
            ))}
          </section>
        )}

        {tab === "settings" && (
          <section className="space-y-4">
            <EditorCard title="Contact & Social Links">
              <Field label="Email">
                <Input
                  value={settings.email}
                  onChange={(value) => updateSettings({ email: value })}
                />
              </Field>
              <Field label="Instagram URL">
                <Input
                  value={settings.instagram}
                  onChange={(value) => updateSettings({ instagram: value })}
                />
              </Field>
              <Field label="YouTube URL">
                <Input
                  value={settings.youtube}
                  onChange={(value) => updateSettings({ youtube: value })}
                />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  value={settings.linkedin}
                  onChange={(value) => updateSettings({ linkedin: value })}
                />
              </Field>
            </EditorCard>
          </section>
        )}
      </div>
    </div>
  );
}

function EditorCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <GripVertical className="h-4 w-4 text-white/20" />
          {title}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:border-red-500/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>
      <div className="grid gap-4">{children}</div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-[0.2em] text-white/35 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
    />
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
    />
  );
}
