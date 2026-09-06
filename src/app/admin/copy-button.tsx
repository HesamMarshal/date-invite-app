"use client";

import CopyButton from "@/components/copy-button";

/** @deprecated Use `@/components/copy-button` */
export default function CopyButtonClient({ text }: { text: string }) {
  return <CopyButton text={text} />;
}
