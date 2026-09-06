import { notFound } from "next/navigation";
import {
  getInvitationByToken,
  recordOpen,
  getResponseByInvitationId,
} from "@/lib/invite-queries";
import { getOptionsForInvitation } from "@/lib/option-queries";
import { getPlanTierForUserId } from "@/lib/plan-limits";
import { toDateOnly, toTimeHm } from "@/lib/datetime";
import InviteBrandFooter from "@/components/invite-brand-footer";
import InviteFlow from "./invite-flow";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await getInvitationByToken(token);
  if (!invite) notFound();

  const ownerPlan = await getPlanTierForUserId(invite.user_id ?? null);
  const showBrand = ownerPlan !== "pro";

  if (!invite.is_active) {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="text-5xl">💤</p>
          <p className="text-xl font-bold">این دعوت فعلاً غیرفعاله</p>
          <p className="max-w-xs text-sm text-zinc-500">
            لینک هنوز همونه؛ وقتی دوباره فعال بشه می‌تونی جواب بدی.
          </p>
        </div>
        <InviteBrandFooter show={showBrand} />
      </main>
    );
  }

  const expired =
    invite.expires_at !== null && new Date(invite.expires_at) < new Date();

  if (expired) {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="text-5xl">⏳</p>
          <p className="text-xl font-bold">این دعوت منقضی شده</p>
          <p className="text-sm text-zinc-500">دیگه نمیتونی جواب بدی 😔</p>
        </div>
        <InviteBrandFooter show={showBrand} />
      </main>
    );
  }

  await recordOpen(invite.id);

  const [existing, foodOptions] = await Promise.all([
    getResponseByInvitationId(invite.id),
    getOptionsForInvitation(invite.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <InviteFlow
          token={token}
          name={invite.recipient_name}
          inviteText={invite.invite_text}
          foodOptions={foodOptions}
          windows={{
            dateFrom: toDateOnly(invite.date_from),
            dateTo: toDateOnly(invite.date_to),
            timeFrom: toTimeHm(invite.time_from),
            timeTo: toTimeHm(invite.time_to),
          }}
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
      </div>
      <InviteBrandFooter show={showBrand} />
    </div>
  );
}
