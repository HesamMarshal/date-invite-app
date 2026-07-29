"use client";

import { useState } from "react";

export default function CopyButtonClient({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-xl bg-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-300 whitespace-nowrap"
    >
      {copied ? "✓ کپی شد" : "📋 کپی"}
    </button>
  );
}
