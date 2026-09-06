"use client";

import { useEffect, useState } from "react";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({
  text,
  shareTitle = "دعوت‌نامه",
  showShare = true,
}: {
  text: string;
  shareTitle?: string;
  /** Native share when the browser supports it (mobile). */
  showShare?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      showShare &&
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
    );
  }, [showShare]);

  const handleCopy = async () => {
    const ok = await writeClipboard(text);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: shareTitle, url: text, text: shareTitle });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-xl bg-zinc-200 px-3 py-2 text-xs font-medium whitespace-nowrap transition hover:bg-zinc-300"
      >
        {copied ? "✓ کپی شد" : "کپی لینک"}
      </button>
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl bg-pink-50 px-3 py-2 text-xs font-medium text-pink-700 whitespace-nowrap transition hover:bg-pink-100"
        >
          اشتراک
        </button>
      )}
    </div>
  );
}
