import { redirect } from "next/navigation";

export default async function LegacyProfileRedirect({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  redirect(`/trainers/${agentId}`);
}

