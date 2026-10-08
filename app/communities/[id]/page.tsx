import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommunityDetail from "@/components/CommunityDetail";
import { COMMUNITIES } from "@/content/communities";
import { getCommunity } from "@/lib/communityGraph";

// Static export: one HTML file per community, generated at build time. Unknown ids are 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return COMMUNITIES.map((community) => ({ id: community.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const community = getCommunity((await params).id);
  return { title: community ? `${community.name} · Communities` : "Community" };
}

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCommunity(id)) notFound();
  return <CommunityDetail id={id} />;
}
