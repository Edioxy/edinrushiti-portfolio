"use client";

import {
  ChevronDown,
  ExternalLink,
  GripVertical,
  LogOut,
  Play,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createEmptyPortfolioItem,
  createEmptyUgcItem,
  DEFAULT_SECTIONS,
  DEFAULT_SETTINGS,
  type HeroSection,
  type PortfolioContentFile,
  type RawPortfolioItem,
  type RawUgcItem,
  type SectionBlock,
  type SiteSections,
  type SiteSettings,
  type UgcSection,
} from "@/lib/content-types";
import { parseVideoInput, resolveThumbnail } from "@/lib/video";

type Tab = "portfolio" | "ugc" | "copy" | "settings";

type VideoRow = {
  title: string;
  video?: string;
  thumbnail?: string;
  category?: string;
  brand?: string;
  description?: string;
};

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [content, setContent] = useState<PortfolioContentFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedPortfolio, setExpandedPortfolio] = useState<number | null>(null);
  const [expandedUgc, setExpandedUgc] = useState<number | null>(null);

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
        sections: { ...DEFAULT_SECTIONS, ...data.sections },
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

  function updateSections(patch: Partial<SiteSections>) {
    if (!content) return;

    const current = { ...DEFAULT_SECTIONS, ...content.sections };

    setContent({
      ...content,
      sections: { ...current, ...patch },
    });
  }

  function updateHeroSection(patch: Partial<HeroSection>) {
    if (!content) return;

    const current = { ...DEFAULT_SECTIONS, ...content.sections };

    setContent({
      ...content,
      sections: {
        ...current,
        hero: { ...current.hero, ...patch },
      },
    });
  }

  function updateSectionBlock(
    key: "portfolio" | "tools" | "contact",
    patch: Partial<SectionBlock>,
  ) {
    if (!content) return;

    const current = { ...DEFAULT_SECTIONS, ...content.sections };

    setContent({
      ...content,
      sections: {
        ...current,
        [key]: { ...current[key], ...patch },
      },
    });
  }

  function updateUgcSection(patch: Partial<UgcSection>) {
    if (!content) return;

    const current = { ...DEFAULT_SECTIONS, ...content.sections };

    setContent({
      ...content,
      sections: {
        ...current,
        ugc: { ...current.ugc, ...patch },
      },
    });
  }

  function updateUgcHighlight(index: number, value: string) {
    if (!content) return;

    const current = { ...DEFAULT_SECTIONS, ...content.sections };
    const highlights = [...current.ugc.highlights] as [string, string, string];
    highlights[index] = value;

    setContent({
      ...content,
      sections: {
        ...current,
        ugc: { ...current.ugc, highlights },
      },
    });
  }

  function removePortfolio(index: number) {
    if (!content) return;

    setContent({
      ...content,
      portfolio: content.portfolio.filter((_, itemIndex) => itemIndex !== index),
    });

    setExpandedPortfolio((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  }

  function removeUgc(index: number) {
    if (!content) return;

    setContent({
      ...content,
      ugc: content.ugc.filter((_, itemIndex) => itemIndex !== index),
    });

    setExpandedUgc((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  }

  function reorderPortfolio(fromIndex: number, toIndex: number) {
    if (!content || fromIndex === toIndex) return;

    setContent({
      ...content,
      portfolio: reorderList(content.portfolio, fromIndex, toIndex),
    });

    setExpandedPortfolio((current) => adjustExpandedIndex(current, fromIndex, toIndex));
  }

  function reorderUgc(fromIndex: number, toIndex: number) {
    if (!content || fromIndex === toIndex) return;

    setContent({
      ...content,
      ugc: reorderList(content.ugc, fromIndex, toIndex),
    });

    setExpandedUgc((current) => adjustExpandedIndex(current, fromIndex, toIndex));
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
  const sections = { ...DEFAULT_SECTIONS, ...content.sections };

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
            ["portfolio", "Commercial Work", content.portfolio.length],
            ["ugc", "UGC Edits", content.ugc.length],
            ["copy", "Page Copy", null],
            ["settings", "Contact & Socials", null],
          ] as const).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                tab === value
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {label}
              {count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    tab === value ? "bg-black/10 text-black/60" : "bg-white/5 text-white/40"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "portfolio" && (
          <VideoListSection
            description="Drag to reorder what appears first on the site. Tap a project to expand and edit. YouTube, Vimeo, TikTok, Instagram, or MP4 links supported."
            addLabel="Add Video"
            emptyLabel="No commercial videos yet."
            items={content.portfolio}
            expandedIndex={expandedPortfolio}
            onExpand={setExpandedPortfolio}
            onReorder={reorderPortfolio}
            onAdd={() => {
              const nextIndex = content.portfolio.length;
              setContent({
                ...content,
                portfolio: [...content.portfolio, createEmptyPortfolioItem()],
              });
              setExpandedPortfolio(nextIndex);
            }}
            onRemove={removePortfolio}
            renderExpanded={(item, index) => (
              <>
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
                <Field label="Video URL">
                  <Input
                    value={item.video ?? ""}
                    onChange={(value) => updatePortfolio(index, { video: value })}
                    placeholder="YouTube, Vimeo, TikTok, Instagram, Drive, or /videos/file.mp4"
                  />
                </Field>
                <Field label="Thumbnail URL (optional)">
                  <Input
                    value={item.thumbnail ?? ""}
                    onChange={(value) => updatePortfolio(index, { thumbnail: value })}
                    placeholder="/thumbnails/project.jpg"
                  />
                </Field>
              </>
            )}
            getMeta={(item) => item.category}
            isVertical={(item) => {
              const parsed = parseVideoInput(item.video);
              return parsed?.type === "tiktok" || parsed?.type === "instagram";
            }}
          />
        )}

        {tab === "ugc" && (
          <VideoListSection
            description="Drag to reorder the carousel. Vertical edits for TikTok, Reels, and paid social. Add a thumbnail for social links."
            addLabel="Add UGC"
            emptyLabel="No UGC edits yet."
            items={content.ugc}
            expandedIndex={expandedUgc}
            onExpand={setExpandedUgc}
            onReorder={reorderUgc}
            onAdd={() => {
              const nextIndex = content.ugc.length;
              setContent({
                ...content,
                ugc: [...content.ugc, createEmptyUgcItem()],
              });
              setExpandedUgc(nextIndex);
            }}
            onRemove={removeUgc}
            renderExpanded={(item, index) => (
              <>
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
                    placeholder="TikTok, Instagram Reel, YouTube, or Vimeo link"
                  />
                </Field>
                <Field label="Thumbnail URL (recommended for TikTok / Instagram)">
                  <Input
                    value={item.thumbnail ?? ""}
                    onChange={(value) => updateUgc(index, { thumbnail: value })}
                    placeholder="https://..."
                  />
                </Field>
              </>
            )}
            getMeta={(item) => item.brand ?? "UGC"}
            isVertical={(item) => {
              const parsed = parseVideoInput(item.video);
              return parsed?.type === "tiktok" || parsed?.type === "instagram";
            }}
          />
        )}

        {tab === "copy" && (
          <div className="space-y-5">
            <p className="max-w-2xl text-sm leading-relaxed text-white/45">
              Edit the headings, descriptions, and button labels shown on your public site.
              Save changes to publish updates.
            </p>

            <CopySection title="Site Header & Footer">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site Name">
                  <Input
                    value={sections.siteName}
                    onChange={(value) => updateSections({ siteName: value })}
                  />
                </Field>
                <Field label="Header Button">
                  <Input
                    value={sections.headerCta}
                    onChange={(value) => updateSections({ headerCta: value })}
                  />
                </Field>
              </div>
            </CopySection>

            <CopySection title="Hero">
              <div className="grid gap-4">
                <Field label="Eyebrow">
                  <Input
                    value={sections.hero.eyebrow}
                    onChange={(value) => updateHeroSection({ eyebrow: value })}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Headline Line 1">
                    <Input
                      value={sections.hero.headingLine1}
                      onChange={(value) => updateHeroSection({ headingLine1: value })}
                    />
                  </Field>
                  <Field label="Headline Line 2">
                    <Input
                      value={sections.hero.headingLine2}
                      onChange={(value) => updateHeroSection({ headingLine2: value })}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <Textarea
                    value={sections.hero.description}
                    onChange={(value) => updateHeroSection({ description: value })}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Primary Button">
                    <Input
                      value={sections.hero.primaryCta}
                      onChange={(value) => updateHeroSection({ primaryCta: value })}
                    />
                  </Field>
                  <Field label="Secondary Button">
                    <Input
                      value={sections.hero.secondaryCta}
                      onChange={(value) => updateHeroSection({ secondaryCta: value })}
                    />
                  </Field>
                  <Field label="Scroll Label">
                    <Input
                      value={sections.hero.scrollLabel}
                      onChange={(value) => updateHeroSection({ scrollLabel: value })}
                    />
                  </Field>
                </div>
              </div>
            </CopySection>

            <CopySection title="Commercial Work Section">
              <SectionBlockFields
                values={sections.portfolio}
                onChange={(patch) => updateSectionBlock("portfolio", patch)}
              />
            </CopySection>

            <CopySection title="UGC Section">
              <SectionBlockFields
                values={sections.ugc}
                onChange={(patch) => updateUgcSection(patch)}
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Badge Label">
                  <Input
                    value={sections.ugc.badge}
                    onChange={(value) => updateUgcSection({ badge: value })}
                  />
                </Field>
              </div>
              <div className="mt-4 grid gap-4">
                {sections.ugc.highlights.map((highlight, index) => (
                  <Field key={index} label={`Highlight ${index + 1}`}>
                    <Input
                      value={highlight}
                      onChange={(value) => updateUgcHighlight(index, value)}
                    />
                  </Field>
                ))}
              </div>
            </CopySection>

            <CopySection title="Technical Arsenal Section">
              <SectionBlockFields
                values={sections.tools}
                onChange={(patch) => updateSectionBlock("tools", patch)}
              />
            </CopySection>

            <CopySection title="Contact Section">
              <SectionBlockFields
                values={sections.contact}
                onChange={(patch) => updateSectionBlock("contact", patch)}
              />
            </CopySection>
          </div>
        )}

        {tab === "settings" && (
          <section className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
            <h2 className="mb-6 text-sm font-medium text-white">Contact & Social Links</h2>
            <div className="grid gap-4">
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

type VideoListSectionProps<T extends VideoRow> = {
  description: string;
  addLabel: string;
  emptyLabel: string;
  items: T[];
  expandedIndex: number | null;
  onExpand: (index: number | null) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderExpanded: (item: T, index: number) => React.ReactNode;
  getMeta: (item: T) => string;
  isVertical: (item: T) => boolean;
};

function VideoListSection<T extends VideoRow>({
  description,
  addLabel,
  emptyLabel,
  items,
  expandedIndex,
  onExpand,
  onReorder,
  onAdd,
  onRemove,
  renderExpanded,
  getMeta,
  isVertical,
}: VideoListSectionProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(index: number) {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (draggedIndex === null) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-white/45">{description}</p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-white/35">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <VideoListItem
              key={`row-${index}`}
              item={item}
              index={index}
              meta={getMeta(item)}
              vertical={isVertical(item)}
              expanded={expandedIndex === index}
              dragging={draggedIndex === index}
              dragOver={dragOverIndex === index && draggedIndex !== index}
              onDragStart={() => handleDragStart(index)}
              onDragOver={() => handleDragOver(index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onToggle={() => onExpand(expandedIndex === index ? null : index)}
              onRemove={() => onRemove(index)}
            >
              {renderExpanded(item, index)}
            </VideoListItem>
          ))}
        </div>
      )}
    </section>
  );
}

type VideoListItemProps = {
  item: VideoRow;
  index: number;
  meta: string;
  vertical: boolean;
  expanded: boolean;
  dragging: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onToggle: () => void;
  onRemove: () => void;
  children: React.ReactNode;
};

function VideoListItem({
  item,
  index,
  meta,
  vertical,
  expanded,
  dragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggle,
  onRemove,
  children,
}: VideoListItemProps) {
  const parsed = parseVideoInput(item.video);
  const [fetchedPreview, setFetchedPreview] = useState<string>();
  const preview = resolveThumbnail(item.thumbnail, parsed) ?? fetchedPreview;
  const platform = getPlatformLabel(parsed?.type, item.video);
  const hasVideo = Boolean(item.video?.trim());

  useEffect(() => {
    if (item.thumbnail?.trim() || parsed?.type !== "tiktok" || !item.video) {
      return;
    }

    let cancelled = false;

    void fetch(`/api/oembed?url=${encodeURIComponent(item.video)}`)
      .then((response) => response.json())
      .then((data: { thumbnail?: string | null }) => {
        if (!cancelled && data.thumbnail) {
          setFetchedPreview(data.thumbnail);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [item.thumbnail, item.video, parsed?.type]);

  return (
    <article
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        dragging
          ? "scale-[0.985] border-white/25 opacity-55"
          : dragOver
            ? "border-white/30 bg-white/[0.03]"
            : expanded
              ? "border-white/20 bg-[#121212] shadow-[0_20px_60px_-30px_rgba(255,255,255,0.15)]"
              : "border-white/10 bg-[#0a0a0a] hover:border-white/15"
      }`}
    >
      <div className="flex items-stretch gap-0">
        <div
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          aria-label={`Drag to reorder ${item.title}`}
          className="flex w-10 shrink-0 cursor-grab items-center justify-center border-r border-white/10 text-white/25 transition-colors hover:bg-white/[0.03] hover:text-white/50 active:cursor-grabbing sm:w-11"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left sm:gap-5 sm:p-5"
        >
          <VideoPreviewThumb preview={preview} vertical={vertical} title={item.title} />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-white/35 uppercase">
                #{index + 1}
              </span>
              <PlatformBadge label={platform} linked={hasVideo} />
            </div>
            <h3 className="truncate text-base font-medium text-white sm:text-lg">{item.title}</h3>
            <p className="mt-1 truncate text-sm text-white/45">{meta}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-center">
            <span className="hidden text-[11px] tracking-[0.15em] text-white/30 uppercase sm:inline">
              {expanded ? "Close" : "Edit"}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-white/40 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.title}`}
          className="flex w-12 shrink-0 items-center justify-center border-l border-white/10 text-red-300/70 transition-colors hover:bg-red-500/10 hover:text-red-300 sm:w-14"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/10 p-4 sm:p-5">
          <div className="grid gap-6 lg:grid-cols-[220px,minmax(0,1fr)]">
            <div className="space-y-3">
              <p className="text-[11px] tracking-[0.2em] text-white/35 uppercase">Preview</p>
              <VideoPreviewThumb
                preview={preview}
                vertical={vertical}
                title={item.title}
                large
              />
              {hasVideo && (
                <a
                  href={parsed?.href ?? item.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white"
                >
                  Open source link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="grid gap-4">{children}</div>
          </div>
        </div>
      )}
    </article>
  );
}

function VideoPreviewThumb({
  preview,
  vertical,
  title,
  large = false,
}: {
  preview?: string;
  vertical: boolean;
  title: string;
  large?: boolean;
}) {
  const sizeClass = large
    ? vertical
      ? "mx-auto aspect-[9/16] w-full max-w-[180px]"
      : "aspect-video w-full"
    : vertical
      ? "aspect-[9/16] w-16 shrink-0 sm:w-[72px]"
      : "aspect-video w-28 shrink-0 sm:w-32";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#050505] ${sizeClass}`}
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#161616] to-black">
          <Play className="h-5 w-5 text-white/25" />
        </div>
      )}
    </div>
  );
}

function PlatformBadge({ label, linked }: { label: string; linked: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase ${
        linked
          ? "border border-white/10 bg-white/5 text-white/55"
          : "border border-amber-500/20 bg-amber-500/10 text-amber-200/80"
      }`}
    >
      {label}
    </span>
  );
}

function reorderList<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function adjustExpandedIndex(
  current: number | null,
  fromIndex: number,
  toIndex: number,
): number | null {
  if (current === null) return null;
  if (current === fromIndex) return toIndex;
  if (fromIndex < current && toIndex >= current) return current - 1;
  if (fromIndex > current && toIndex <= current) return current + 1;
  return current;
}

function getPlatformLabel(type?: string, rawUrl?: string) {
  if (!rawUrl?.trim()) return "No link";

  switch (type) {
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
    case "tiktok":
      return "TikTok";
    case "instagram":
      return "Instagram";
    case "gdrive":
      return "Drive";
    case "file":
      return "MP4";
    default:
      return "Link";
  }
}

function CopySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
      <h2 className="mb-5 text-sm font-medium text-white">{title}</h2>
      {children}
    </section>
  );
}

function SectionBlockFields({
  values,
  onChange,
}: {
  values: SectionBlock;
  onChange: (patch: Partial<SectionBlock>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field label="Eyebrow">
        <Input value={values.eyebrow} onChange={(value) => onChange({ eyebrow: value })} />
      </Field>
      <Field label="Heading">
        <Input value={values.heading} onChange={(value) => onChange({ heading: value })} />
      </Field>
      <Field label="Description">
        <Textarea
          value={values.description}
          onChange={(value) => onChange({ description: value })}
        />
      </Field>
    </div>
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
