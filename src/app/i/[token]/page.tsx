import { notFound } from "next/navigation";
import {
  getInvitationByToken,
  recordOpen,
  getResponseByInvitationId,
} from "@/lib/invite-queries";
import InviteFlow from "./invite-flow";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await getInvitationByToken(token);
  if (!invite) notFound();

  const expired =
    invite.expires_at !== null && new Date(invite.expires_at) < new Date();

  await recordOpen(invite.id);

  const existing = await getResponseByInvitationId(invite.id);

  if (expired) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-5xl">⏳</p>
        <p className="text-xl font-bold">این دعوت منقضی شده</p>
        <p className="text-sm text-zinc-500">دیگه نمیتونی جواب بدی 😔</p>
      </main>
    );
  }

  return (
    <InviteFlow
      token={token}
      name={invite.recipient_name}
      inviteText={invite.invite_text}
      existing={
        existing
          ? {
              accepted: !!existing.accepted,
              selectedDatetime: existing.selected_datetime,
              foodChoice: existing.food_choice,
            }
          : null
      }
    />
  );
}
