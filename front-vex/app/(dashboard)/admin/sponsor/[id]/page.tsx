"use client";

import { useParams } from "next/navigation";
import DetailSponsor from "@/components/sponsor/DetailSponsor";

export default function DetailSponsorPage() {
  const { id } = useParams();

  return <DetailSponsor id={Number(id)} />;
}