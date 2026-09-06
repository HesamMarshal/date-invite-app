"use client";

import CreateInvite from "@/components/create-invite";

export default function CreateInviteAdmin({
  activeOptions,
}: {
  activeOptions: { id: number; emoji: string; label: string }[];
}) {
  return <CreateInvite activeOptions={activeOptions} />;
}
